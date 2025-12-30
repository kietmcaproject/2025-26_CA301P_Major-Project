import * as fs from "fs/promises";
import path from "path";
//import pdfParse from "pdf-parse/lib/pdf-parse.js";
import * as pkgPdfParse from "pdf-parse";
//const pdfParse = pkgPdfParse; // needed because pdf-parse doesn't export default properly
import mammoth from "mammoth";

export async function parseResumeFile(filePath) {
  if (!filePath) throw new Error("filePath required");

  const ext = path.extname(filePath).toLowerCase();

  try {
    if (ext === ".pdf") {
      const data = await fs.readFile(filePath);
      const parsed = await pdfParse(data);
      return (parsed.text || "").replace(/\s+/g, " ").trim();
    } else if (ext === ".docx") {
      const result = await mammoth.extractRawText({ path: filePath });
      return (result.value || "").replace(/\s+/g, " ").trim();
    } else {
      const txt = await fs.readFile(filePath, "utf8");
      return txt.replace(/\s+/g, " ").trim();
    }
  } catch (err) {
    throw new Error("Failed to parse resume file: " + err.message);
  }
}
