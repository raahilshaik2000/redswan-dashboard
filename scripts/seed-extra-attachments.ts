import "dotenv/config";
import pg from "pg";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

async function main() {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();

  // Find existing property tokenization tickets by property name
  const extras: {
    propertyName: string;
    attachments: { fileName: string; fileType: string; fileUrl: string; fileSize: number }[];
  }[] = [
    {
      propertyName: "Marina Bay Tower",
      attachments: [
        { fileName: "valuation-report-marina-tower.pdf", fileType: "application/pdf", fileUrl: "/uploads/valuation-report-marina-tower.pdf", fileSize: 661 },
        { fileName: "floor-plans-marina-tower.pdf", fileType: "application/pdf", fileUrl: "/uploads/floor-plans-marina-tower.pdf", fileSize: 660 },
        { fileName: "marina-tower-exterior.jpg", fileType: "image/jpeg", fileUrl: "/uploads/marina-tower-exterior.jpg", fileSize: 149 },
      ],
    },
    {
      propertyName: "Alpine Luxury Resort",
      attachments: [
        { fileName: "title-deed-alpine-resort.pdf", fileType: "application/pdf", fileUrl: "/uploads/title-deed-alpine-resort.pdf", fileSize: 669 },
        { fileName: "alpine-resort-aerial.jpg", fileType: "image/jpeg", fileUrl: "/uploads/alpine-resort-aerial.jpg", fileSize: 149 },
      ],
    },
    {
      propertyName: "Dubai Business Plaza",
      attachments: [
        { fileName: "environmental-assessment-dubai.pdf", fileType: "application/pdf", fileUrl: "/uploads/environmental-assessment-dubai.pdf", fileSize: 668 },
        { fileName: "dubai-plaza-render.jpg", fileType: "image/jpeg", fileUrl: "/uploads/dubai-plaza-render.jpg", fileSize: 149 },
      ],
    },
    {
      propertyName: "Shibuya Tech Center",
      attachments: [
        { fileName: "tenancy-schedule-tokyo.pdf", fileType: "application/pdf", fileUrl: "/uploads/tenancy-schedule-tokyo.pdf", fileSize: 664 },
      ],
    },
  ];

  for (const entry of extras) {
    const res = await client.query(
      `SELECT id FROM "Ticket" WHERE "propertyName" = $1 LIMIT 1`,
      [entry.propertyName]
    );
    if (res.rows.length === 0) {
      console.log(`  Skipped: ${entry.propertyName} (not found)`);
      continue;
    }
    const ticketId = res.rows[0].id;

    for (const att of entry.attachments) {
      const attachId = `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      await client.query(
        `INSERT INTO "Attachment" (id, "fileName", "fileType", "fileUrl", "fileSize", "ticketId", "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [attachId, att.fileName, att.fileType, att.fileUrl, att.fileSize, ticketId]
      );
      console.log(`  Added ${att.fileName} -> ${entry.propertyName}`);
    }
  }

  console.log("\nDone!");
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
