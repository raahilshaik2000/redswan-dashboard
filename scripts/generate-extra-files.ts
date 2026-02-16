import fs from "fs";
import path from "path";

const UPLOADS_DIR = path.join(__dirname, "..", "public", "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ─── PDF Generation (reuses same raw PDF approach as generate-pdfs.ts) ───

interface PdfFile {
  filename: string;
  text: string;
}

const pdfFiles: PdfFile[] = [
  {
    filename: "valuation-report-marina-tower.pdf",
    text: "Valuation Report - Marina Bay Tower - Estimated Value: SGD 620M",
  },
  {
    filename: "floor-plans-marina-tower.pdf",
    text: "Floor Plans - Marina Bay Tower - 45 Floors, 180,000 sqft total",
  },
  {
    filename: "title-deed-alpine-resort.pdf",
    text: "Title Deed - Alpine Luxury Resort - Registered Owner: Alpine Resorts AG",
  },
  {
    filename: "environmental-assessment-dubai.pdf",
    text: "Environmental Impact Assessment - Dubai Business Plaza - Approved 2024",
  },
  {
    filename: "tenancy-schedule-tokyo.pdf",
    text: "Tenancy Schedule - Shibuya Tech Center - 18 Tenants, 95% Occupancy",
  },
];

function generatePdf(text: string): string {
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

  const offsets: number[] = [];
  let pdf = "";

  pdf += "%PDF-1.4\n";

  offsets.push(pdf.length);
  pdf += "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";

  offsets.push(pdf.length);
  pdf += "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";

  offsets.push(pdf.length);
  pdf +=
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n";

  offsets.push(pdf.length);
  pdf += `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${stream}\nendstream\nendobj\n`;

  offsets.push(pdf.length);
  pdf +=
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";

  const xrefOffset = pdf.length;
  pdf += "xref\n";
  pdf += `0 ${offsets.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }

  pdf += "trailer\n";
  pdf += `<< /Size ${offsets.length + 1} /Root 1 0 R >>\n`;
  pdf += "startxref\n";
  pdf += `${xrefOffset}\n`;
  pdf += "%%EOF\n";

  return pdf;
}

// ─── JPEG Generation (minimal valid JFIF 1x1 red pixel) ───

interface JpegFile {
  filename: string;
}

const jpegFiles: JpegFile[] = [
  { filename: "marina-tower-exterior.jpg" },
  { filename: "alpine-resort-aerial.jpg" },
  { filename: "dubai-plaza-render.jpg" },
];

function generateMinimalJpeg(): Buffer {
  // Minimal valid JPEG: 1x1 pixel, red-ish color
  // This is a hand-crafted minimal JFIF JPEG with a single 1x1 pixel.
  // Structure: SOI, APP0 (JFIF), DQT, SOF0, DHT (DC luminance), DHT (DC chrominance), SOS, scan data, EOI
  const bytes: number[] = [
    // SOI (Start of Image)
    0xff, 0xd8,

    // APP0 - JFIF marker
    0xff, 0xe0,
    0x00, 0x10, // Length = 16
    0x4a, 0x46, 0x49, 0x46, 0x00, // "JFIF\0"
    0x01, 0x01, // Version 1.1
    0x00, // Aspect ratio units: no units
    0x00, 0x01, // X density = 1
    0x00, 0x01, // Y density = 1
    0x00, 0x00, // No thumbnail

    // DQT - Define Quantization Table (simplified, all 1s for minimal size)
    0xff, 0xdb,
    0x00, 0x43, // Length = 67
    0x00, // Table 0, 8-bit precision
    // 64 quantization values (all 1 for simplicity)
    ...new Array(64).fill(0x01),

    // SOF0 - Start of Frame (Baseline DCT)
    0xff, 0xc0,
    0x00, 0x0b, // Length = 11
    0x08, // 8-bit precision
    0x00, 0x01, // Height = 1
    0x00, 0x01, // Width = 1
    0x01, // 1 component (grayscale for simplicity)
    0x01, // Component ID = 1
    0x11, // Sampling factors: 1x1
    0x00, // Quantization table 0

    // DHT - Define Huffman Table (DC, table 0)
    0xff, 0xc4,
    0x00, 0x1f, // Length = 31
    0x00, // DC table, ID 0
    // Number of codes of each length 1-16
    0x00, 0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01,
    0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    // Values
    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b,

    // SOS - Start of Scan
    0xff, 0xda,
    0x00, 0x08, // Length = 8
    0x01, // 1 component
    0x01, // Component 1
    0x00, // DC table 0, AC table 0
    0x00, 0x3f, 0x00, // Spectral selection & successive approx

    // Scan data: encode DC coefficient 0 (black pixel)
    // Using Huffman code for value 0: should be category 0 = bit pattern from table
    0x7f, 0x54, // Minimal encoded data (padded)

    // EOI (End of Image)
    0xff, 0xd9,
  ];

  return Buffer.from(bytes);
}

// ─── Generate all files ───

console.log("Generating extra files...\n");

console.log("--- PDFs ---");
for (const file of pdfFiles) {
  const pdfContent = generatePdf(file.text);
  const filePath = path.join(UPLOADS_DIR, file.filename);
  fs.writeFileSync(filePath, pdfContent, "ascii");
  console.log(`  Created: ${file.filename} (${pdfContent.length} bytes)`);
}

console.log("\n--- JPEGs ---");
const jpegBuffer = generateMinimalJpeg();
for (const file of jpegFiles) {
  const filePath = path.join(UPLOADS_DIR, file.filename);
  fs.writeFileSync(filePath, jpegBuffer);
  console.log(`  Created: ${file.filename} (${jpegBuffer.length} bytes)`);
}

console.log(`\nDone! Generated ${pdfFiles.length} PDFs and ${jpegFiles.length} JPEGs in ${UPLOADS_DIR}`);
