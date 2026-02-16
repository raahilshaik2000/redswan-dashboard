import fs from "fs";
import path from "path";

const UPLOADS_DIR = path.join(__dirname, "..", "public", "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

interface PdfFile {
  filename: string;
  text: string;
}

const files: PdfFile[] = [
  // Resumes
  {
    filename: "resume-sarah-chen.pdf",
    text: "Resume - Sarah Chen, Software Engineer, 5 years experience in full-stack development",
  },
  {
    filename: "resume-marcus-johnson.pdf",
    text: "Resume - Marcus Johnson, Product Manager, 7 years in tech product management",
  },
  {
    filename: "resume-elena-rodriguez.pdf",
    text: "Resume - Elena Rodriguez, UX Designer, 4 years designing enterprise applications",
  },
  {
    filename: "resume-david-kim.pdf",
    text: "Resume - David Kim, Data Analyst, 3 years in business intelligence",
  },
  {
    filename: "resume-priya-patel.pdf",
    text: "Resume - Priya Patel, Marketing Specialist, 6 years in digital marketing",
  },
  // Property documents
  {
    filename: "property-docs-marina-tower.pdf",
    text: "Property Document - Marina Bay Tower, Singapore, 45-story commercial complex",
  },
  {
    filename: "property-docs-alpine-resort.pdf",
    text: "Property Document - Alpine Luxury Resort, Zurich, Switzerland, 200-room hotel",
  },
  {
    filename: "property-docs-dubai-plaza.pdf",
    text: "Property Document - Dubai Business Plaza, UAE, Mixed-use development",
  },
  {
    filename: "property-docs-london-house.pdf",
    text: "Property Document - Kensington House, London, UK, Heritage residential building",
  },
  {
    filename: "property-docs-tokyo-center.pdf",
    text: "Property Document - Shibuya Tech Center, Tokyo, Japan, Office tower",
  },
];

function generatePdf(text: string): string {
  // Break text into lines of ~60 chars for readability on the page
  const lines: string[] = [];
  const words = text.split(" ");
  let currentLine = "";
  for (const word of words) {
    if (currentLine.length + word.length + 1 > 60) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = currentLine ? `${currentLine} ${word}` : word;
    }
  }
  if (currentLine) lines.push(currentLine);

  // Build text stream operators
  // Start at (72, 720) near the top of the page and move down 20 units per line
  const textOperators = lines
    .map((line, i) => {
      const escaped = line
        .replace(/\\/g, "\\\\")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)");
      if (i === 0) {
        return `1 0 0 1 72 720 Tm\n(${escaped}) Tj`;
      }
      return `0 -20 Td\n(${escaped}) Tj`;
    })
    .join("\n");

  const stream = `BT\n/F1 14 Tf\n${textOperators}\nET`;
  const streamLength = stream.length;

  // Build the PDF structure, tracking byte offsets for the xref table
  const offsets: number[] = [];
  let pdf = "";

  // Header
  pdf += "%PDF-1.4\n";

  // Object 1: Catalog
  offsets.push(pdf.length);
  pdf += "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";

  // Object 2: Pages
  offsets.push(pdf.length);
  pdf += "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";

  // Object 3: Page
  offsets.push(pdf.length);
  pdf +=
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n";

  // Object 4: Content stream
  offsets.push(pdf.length);
  pdf += `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${stream}\nendstream\nendobj\n`;

  // Object 5: Font
  offsets.push(pdf.length);
  pdf +=
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";

  // Cross-reference table
  const xrefOffset = pdf.length;
  pdf += "xref\n";
  pdf += `0 ${offsets.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }

  // Trailer
  pdf += "trailer\n";
  pdf += `<< /Size ${offsets.length + 1} /Root 1 0 R >>\n`;
  pdf += "startxref\n";
  pdf += `${xrefOffset}\n`;
  pdf += "%%EOF\n";

  return pdf;
}

console.log("Generating PDF files...\n");

for (const file of files) {
  const pdfContent = generatePdf(file.text);
  const filePath = path.join(UPLOADS_DIR, file.filename);
  fs.writeFileSync(filePath, pdfContent, "ascii");
  console.log(`  Created: ${file.filename} (${pdfContent.length} bytes)`);
}

console.log(`\nDone! Generated ${files.length} PDF files in ${UPLOADS_DIR}`);
