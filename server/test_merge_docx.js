import fs from "fs/promises";
import path from "path";
import os from "os";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { convertWordToPdf } from "./src/routes/pdfRoutes.js";

async function runTest() {
  console.log("Starting automated Word-to-PDF conversion test...");
  
  const tmpDir = os.tmpdir();
  const testDocxPath = path.join(tmpDir, "test_verification.docx");
  
  // Create a dummy docx using Word COM via PowerShell
  const createDocxCmd = `
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $doc = $word.Documents.Add()
    $selection = $word.Selection
    $selection.Font.Name = "Arial"
    $selection.Font.Size = 14
    $selection.TypeText("Automated Integration Test for High-Quality PDF Conversion.")
    $selection.TypeParagraph()
    $selection.TypeText("Symbols test: Alpha=α, Beta=β, Theta=θ, Infinity=∞.")
    $doc.SaveAs("${testDocxPath.replace(/\\/g, '\\\\')}")
    $doc.Close()
    $word.Quit()
  `;

  try {
    console.log("Generating a test DOCX file with custom text and symbols...");
    // Use execFileSync with arguments array to avoid shell escaping issues
    execFileSync("powershell", ["-Command", createDocxCmd]);
    console.log("Test DOCX file generated successfully.");

    // Read the generated DOCX into a buffer
    const docxBuffer = await fs.readFile(testDocxPath);

    // Convert it using the new convertWordToPdf function
    console.log("Converting DOCX buffer to PDF using our new implementation...");
    const pdfBuffer = await convertWordToPdf(docxBuffer);

    if (pdfBuffer && pdfBuffer.length > 0) {
      const outPath = path.join(__dirname, "test_output.pdf");
      await fs.writeFile(outPath, pdfBuffer);
      console.log(`SUCCESS! High-quality PDF generated at: ${outPath}`);
      console.log(`PDF file size: ${pdfBuffer.length} bytes`);
    } else {
      throw new Error("Conversion returned an empty or invalid buffer.");
    }
  } catch (error) {
    console.error("TEST FAILED:", error);
    process.exit(1);
  } finally {
    try { await fs.unlink(testDocxPath); } catch (e) {}
  }
}

runTest();
