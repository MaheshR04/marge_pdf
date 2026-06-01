import fs from "fs/promises";
import path from "path";
import os from "os";
import { execFile as execFileCb } from "child_process";
import util from "util";
import { fileURLToPath } from "url";

const execFile = util.promisify(execFileCb);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testConversion() {
  const tmpDir = os.tmpdir();
  const docxPath = path.join(tmpDir, "test_input.docx");
  const pdfPath = path.join(tmpDir, "test_output.pdf");

  console.log("docxPath:", docxPath);
  console.log("pdfPath:", pdfPath);

  // 1. Create a very simple valid docx or use a blank buffer?
  // Let's create a minimal docx zip file structure or write a mock docx.
  // Actually, let's write a very minimal zip file that represents a blank word document,
  // or we can see if there is any docx we can write.
  // Wait, if it is a corrupted zip, Word will fail to open it.
  // Can we create a simple docx?
  // Let's write a dummy text file renamed to docx, but Word might fail to open it if it's not a zip.
  // Wait, let's write a simple word document using Word itself via COM!
  // That will guarantee it is valid and let us test if Word COM is fully functional.
  
  try {
    const psScript = path.join(__dirname, "src/utils/wordToPdf.ps1");
    console.log("Running powershell with script:", psScript);

    // Let's first create a real DOCX file using Word COM via PowerShell!
    const createDocxCmd = `
      $word = New-Object -ComObject Word.Application
      $word.Visible = $false
      $doc = $word.Documents.Add()
      $selection = $word.Selection
      $selection.TypeText("Hello World from Antigravity test conversion!")
      $doc.SaveAs("${docxPath.replace(/\\/g, '\\\\')}")
      $doc.Close()
      $word.Quit()
    `;
    
    console.log("Creating test docx file...");
    await execFile("powershell", ["-Command", createDocxCmd]);
    console.log("Test docx file created successfully.");

    console.log("Now trying to convert it to PDF using wordToPdf.ps1...");
    const { stdout, stderr } = await execFile("powershell", [
      "-ExecutionPolicy", "Bypass",
      "-File", psScript,
      "-inputPath", docxPath,
      "-outputPath", pdfPath
    ]);
    
    console.log("Stdout:", stdout);
    console.log("Stderr:", stderr);
    
    if (await fs.stat(pdfPath).then(() => true).catch(() => false)) {
      console.log("SUCCESS! PDF file exists at:", pdfPath);
      const pdfSize = (await fs.stat(pdfPath)).size;
      console.log("PDF size:", pdfSize, "bytes");
    } else {
      console.log("FAILURE: PDF file was not created.");
    }
  } catch (error) {
    console.error("Test execution failed with error:", error);
  }
}

testConversion();
