import express from "express";
import multer from "multer";
import mammoth from "mammoth";
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

async function createPdfFromText(text, sourceName) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 50;
  const titleSize = 14;
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

  page.drawText(`Converted from Word: ${sourceName}`, {
    x: margin,
    y,
    size: titleSize,
    font: boldFont
  });
  y -= 30;

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

async function convertInputToPdfBuffer(file) {
  if (isPdfFile(file)) {
    return file.buffer;
  }

  if (isDocxFile(file)) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    const pdfBytes = await createPdfFromText(result.value, file.originalname);
    return Buffer.from(pdfBytes);
  }

  throw new Error(
    `Unsupported file type: ${file.originalname}. Use PDF or Word (.docx).`
  );
}

router.post("/merge", authMiddleware, upload.array("pdfs", 20), async (req, res) => {
  try {
    const files = req.files || [];

    if (files.length < 2) {
      return res
        .status(400)
        .json({ message: "Please upload at least 2 files." });
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const normalizedPdfBuffer = await convertInputToPdfBuffer(file);
      const sourcePdf = await PDFDocument.load(normalizedPdfBuffer);
      const pages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
    }

    const pdfBytes = await mergedPdf.save();
    const fileName = `merged-${Date.now()}.pdf`;

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

