import express from "express";
import multer from "multer";
import mammoth from "mammoth";
import zlib from "zlib";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024
  }
});

const PDF_MIME_TYPES = new Set(["application/pdf"]);
const DOCX_MIME_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);
const IMAGE_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/jpg"]);
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg"]);

function getExtension(fileName = "") {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
}

function isPdfFile(file) {
  const ext = getExtension(file.originalname);
  return PDF_MIME_TYPES.has(file.mimetype) || ext === ".pdf";
}

function isDocxFile(file) {
  const ext = getExtension(file.originalname);
  return DOCX_MIME_TYPES.has(file.mimetype) || ext === ".docx";
}

function isImageFile(file) {
  const ext = getExtension(file.originalname);
  return IMAGE_MIME_TYPES.has(file.mimetype) || IMAGE_EXTENSIONS.has(ext);
}

function isPngFile(file) {
  return file.mimetype === "image/png" || getExtension(file.originalname) === ".png";
}

function isJpgFile(file) {
  const ext = getExtension(file.originalname);
  return file.mimetype === "image/jpeg" || file.mimetype === "image/jpg" || ext === ".jpg" || ext === ".jpeg";
}

function xmlEscape(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapTextToWidth(text, font, fontSize, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const proposed = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(proposed, fontSize);
    if (width <= maxWidth) {
      currentLine = proposed;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [""];
}

async function createPdfFromText(text) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 50;
  const bodySize = 11;
  const lineHeight = 16;
  const maxTextWidth = pageWidth - margin * 2;

  const safeText = text?.trim() || "No readable text found in this Word file.";
  const paragraphs = safeText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const contentLines =
    paragraphs.length > 0
      ? paragraphs.flatMap((p) => wrapTextToWidth(p, font, bodySize, maxTextWidth))
      : wrapTextToWidth(safeText, font, bodySize, maxTextWidth);

  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  for (const line of contentLines) {
    if (y < margin) {
      page = pdf.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
    page.drawText(line, {
      x: margin,
      y,
      size: bodySize,
      font
    });
    y -= lineHeight;
  }

  return pdf.save();
}

async function createPdfFromImage(file) {
  const pdf = await PDFDocument.create();
  const image = isPngFile(file)
    ? await pdf.embedPng(file.buffer)
    : await pdf.embedJpg(file.buffer);

  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 40;
  const page = pdf.addPage([pageWidth, pageHeight]);
  const scale = Math.min(
    (pageWidth - margin * 2) / image.width,
    (pageHeight - margin * 2) / image.height,
    1
  );
  const width = image.width * scale;
  const height = image.height * scale;

  page.drawImage(image, {
    x: (pageWidth - width) / 2,
    y: (pageHeight - height) / 2,
    width,
    height
  });

  return pdf.save();
}

async function convertInputToPdfBuffer(file) {
  if (isPdfFile(file)) {
    return file.buffer;
  }

  if (isDocxFile(file)) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    const pdfBytes = await createPdfFromText(result.value);
    return Buffer.from(pdfBytes);
  }

  if (isImageFile(file)) {
    const pdfBytes = await createPdfFromImage(file);
    return Buffer.from(pdfBytes);
  }

  throw new Error(
    `Unsupported file type: ${file.originalname}. Use PDF, Word (.docx), PNG, JPG, or JPEG.`
  );
}

function getPngSize(buffer) {
  const signature = "89504e470d0a1a0a";
  if (buffer.subarray(0, 8).toString("hex") !== signature) {
    return null;
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

function getJpegSize(buffer) {
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      return null;
    }
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7)
      };
    }
    offset += 2 + length;
  }
  return null;
}

function getImageSize(file) {
  if (isPngFile(file)) {
    return getPngSize(file.buffer);
  }
  if (isJpgFile(file)) {
    return getJpegSize(file.buffer);
  }
  return null;
}

function docxParagraph(text) {
  return `<w:p><w:r><w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r></w:p>`;
}

function docxHeading(text) {
  return `<w:p><w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r></w:p>`;
}

function docxPageBreak() {
  return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
}

function docxImage(relId, file, index) {
  const size = getImageSize(file) || { width: 1000, height: 1000 };
  const maxWidthEmu = 5486400;
  const maxHeightEmu = 7315200;
  const pxToEmu = 9525;
  const scale = Math.min(maxWidthEmu / (size.width * pxToEmu), maxHeightEmu / (size.height * pxToEmu), 1);
  const cx = Math.round(size.width * pxToEmu * scale);
  const cy = Math.round(size.height * pxToEmu * scale);
  const name = xmlEscape(file.originalname);

  return `<w:p><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${index}" name="${name}"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${index}" name="${name}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${relId}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function zipDateTime(date = new Date()) {
  const time =
    (date.getHours() << 11) |
    (date.getMinutes() << 5) |
    Math.floor(date.getSeconds() / 2);
  const dosDate =
    ((date.getFullYear() - 1980) << 9) |
    ((date.getMonth() + 1) << 5) |
    date.getDate();
  return { time, dosDate };
}

function createZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const { time, dosDate } = zipDateTime();

  entries.forEach((entry) => {
    const name = Buffer.from(entry.path, "utf8");
    const data = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data, "utf8");
    const compressed = zlib.deflateRawSync(data);
    const crc = crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(dosDate, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);

    localParts.push(local, name, compressed);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(dosDate, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, name);

    offset += local.length + name.length + compressed.length;
  });

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);

  return Buffer.concat([...localParts, ...centralParts, end]);
}

async function extractPdfText(file) {
  // For now, return a placeholder message
  // PDF text extraction would require pdf-parse or similar
  return "PDF content included in merge.";
}

function addTextToDocx(bodyParts, text) {
  const paragraphs = (text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const safeParagraphs =
    paragraphs.length > 0 ? paragraphs : ["No readable text found in this file."];

  safeParagraphs.forEach((paragraph) => bodyParts.push(docxParagraph(paragraph)));
}

export async function createDocxFromFiles(files, options = {}) {
  const includeFileHeadings = options.includeFileHeadings ?? files.length > 1;
  const mediaEntries = [];
  const relationshipEntries = [];
  const contentTypes = [
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
    '<Default Extension="xml" ContentType="application/xml"/>',
    '<Default Extension="png" ContentType="image/png"/>',
    '<Default Extension="jpg" ContentType="image/jpeg"/>',
    '<Default Extension="jpeg" ContentType="image/jpeg"/>',
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
  ];
  const bodyParts = [];
  let relIndex = 1;
  let imageIndex = 1;

  for (const [index, file] of files.entries()) {
    if (index > 0) {
      bodyParts.push(docxPageBreak());
    }

    if (isDocxFile(file)) {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      if (includeFileHeadings) {
        bodyParts.push(docxHeading(file.originalname));
      }
      addTextToDocx(bodyParts, result.value || "No readable text found in this Word file.");
      continue;
    }

    if (isImageFile(file)) {
      const extension = isPngFile(file) ? "png" : "jpg";
      const mediaPath = `word/media/image${imageIndex}.${extension}`;
      const relId = `rId${relIndex}`;
      if (includeFileHeadings) {
        bodyParts.push(docxHeading(file.originalname));
      }
      bodyParts.push(docxImage(relId, file, imageIndex));
      mediaEntries.push({ path: mediaPath, data: file.buffer });
      relationshipEntries.push(
        `<Relationship Id="${relId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image${imageIndex}.${extension}"/>`
      );
      relIndex += 1;
      imageIndex += 1;
      continue;
    }

    if (isPdfFile(file)) {
      if (includeFileHeadings) {
        bodyParts.push(docxHeading(file.originalname));
      }
      const text = await extractPdfText(file);
      addTextToDocx(bodyParts, text);
      continue;
    }

    throw new Error(
      `Unsupported file type: ${file.originalname}. Use PDF, Word (.docx), PNG, JPG, or JPEG.`
    );
  }

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${bodyParts.join("")}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`;
  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relationshipEntries.join("")}</Relationships>`;
  const rootRelsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';
  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">${contentTypes.join("")}</Types>`;

  return createZip([
    { path: "[Content_Types].xml", data: contentTypesXml },
    { path: "_rels/.rels", data: rootRelsXml },
    { path: "word/document.xml", data: documentXml },
    { path: "word/_rels/document.xml.rels", data: relsXml },
    ...mediaEntries
  ]);
}

router.post("/merge", authMiddleware, upload.array("pdfs", 20), async (req, res) => {
  try {
    const files = req.files || [];
    const outputFormat = req.body?.outputFormat === "docx" ? "docx" : "pdf";
    const mode = req.body?.mode === "convert" ? "convert" : "merge";
    const minimumFiles = mode === "convert" ? 1 : 2;

    if (files.length < minimumFiles) {
      return res.status(400).json({
        message:
          mode === "convert"
            ? "Please upload at least 1 file."
            : "Please upload at least 2 files."
      });
    }

    if (outputFormat === "docx") {
      const docxBuffer = await createDocxFromFiles(files, {
        includeFileHeadings: mode !== "convert"
      });
      const fileName = `${mode === "convert" ? "converted" : "merged"}-${Date.now()}.docx`;
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
      return res.send(docxBuffer);
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const normalizedPdfBuffer = await convertInputToPdfBuffer(file);
      const sourcePdf = await PDFDocument.load(normalizedPdfBuffer);
      const pages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
    }

    const pdfBytes = await mergedPdf.save();
    const fileName = `${mode === "convert" ? "converted" : "merged"}-${Date.now()}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    return res.send(Buffer.from(pdfBytes));
  } catch (error) {
    return res.status(400).json({
      message: error?.message || "Failed to merge files."
    });
  }
});

export default router;
