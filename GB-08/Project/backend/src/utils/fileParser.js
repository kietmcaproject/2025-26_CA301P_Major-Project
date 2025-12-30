import fs from "fs/promises";
import mammoth from "mammoth";
import PDFParser from "pdf2json";


export async function parseFileBuffer(buffer, mimeType = 'application/pdf') {
  try {
    if (mimeType === 'application/pdf') {
      const pdfParser = new PDFParser();

      return await new Promise((resolve, reject) => {
        pdfParser.on("pdfParser_dataReady", pdfData => {
          try {
            let text = '';
            try {
              text = pdfParser.getRawTextContent() || '';
            } catch (e) {
              console.warn('pdfParser.getRawTextContent() failed:', e);
            }

            // If raw text is empty, try to extract from pdfData structure
            if (!text || text.trim().length === 0) {
              try {
                const pages = pdfData?.formImage?.Pages || pdfData?.Pages || [];
                const parts = [];
                for (const page of pages) {
                  if (!page.Texts) continue;
                  for (const t of page.Texts) {
                    if (t.R && t.R.length) {
                      // t.R[0].T is url-encoded text
                      const raw = t.R.map(r => r.T).join('');
                      try {
                        parts.push(decodeURIComponent(raw));
                      } catch (decErr) {
                        parts.push(raw);
                      }
                    }
                  }
                  parts.push('\n');
                }
                text = parts.join(' ');
              } catch (extErr) {
                console.warn('Fallback PDF text extraction failed:', extErr);
              }
            }

            console.log('Parsed PDF text length:', text?.length);
            if (text && text.length > 0) {
              console.log('Parsed PDF sample:', text.substring(0, 300));
            }

            resolve(text);
          } catch (procErr) {
            reject(procErr);
          }
        });

        pdfParser.on("pdfParser_dataError", err => {
          reject(err);
        });

        pdfParser.parseBuffer(buffer);
      });
    }

    if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const { value } = await mammoth.extractRawText({ buffer });
      return value;
    }

    if (mimeType === "text/plain") {
      return buffer.toString("utf8");
    }

    throw new Error("Unsupported file type. PDF / DOCX / TXT only.");
  } catch (error) {
    console.error("File parsing error:", error);
    throw new Error("Failed to parse file");
  }
}

export async function parseResumeFile(filePath) {
  const buffer = await fs.readFile(filePath);
  const ext = filePath.split(".").pop().toLowerCase();

  const mimeTypes = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    txt: "text/plain",
  };

  return parseFileBuffer(buffer, mimeTypes[ext]);
}
