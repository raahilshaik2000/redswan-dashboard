import "dotenv/config";
import bcrypt from "bcryptjs";
import pg from "pg";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

async function main() {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();

  // --- Seed user ---
  const email = "mycrescentai@gmail.com";
  const password = "heyhey123$";
  const hashedPassword = await bcrypt.hash(password, 12);
  const name = "Raahil";
  const userId = `user_${Date.now()}`;

  await client.query(
    `INSERT INTO "User" (id, email, "hashedPassword", name, role, "createdAt")
     VALUES ($1, $2, $3, $4, 'admin', NOW())
     ON CONFLICT (email) DO UPDATE SET "hashedPassword" = $3, name = $4, role = 'admin'`,
    [userId, email, hashedPassword, name]
  );
  console.log(`User seeded: ${email}`);

  // --- Seed property tokenization tickets ---
  const propertyTickets = [
    {
      firstName: "James",
      lastName: "Wong",
      email: "james.wong@marinacorp.sg",
      phoneNumber: "+65 9123 4567",
      propertyName: "Marina Bay Tower",
      propertyAddress: "12 Marina Boulevard, Singapore 018982",
      country: "Singapore",
      message: "We'd like to tokenize our 45-story commercial complex in the Marina Bay area. The building has full occupancy with long-term corporate tenants. Looking to tokenize 40% of the equity.",
      status: "pending_review",
      pdf: "property-docs-marina-tower.pdf",
    },
    {
      firstName: "Lukas",
      lastName: "Meier",
      email: "lukas.meier@alpineresorts.ch",
      phoneNumber: "+41 79 234 5678",
      propertyName: "Alpine Luxury Resort",
      propertyAddress: "Bahnhofstrasse 42, 8001 Zurich, Switzerland",
      country: "Switzerland",
      message: "Interested in partial tokenization of our 200-room luxury resort property. The resort generates CHF 18M annual revenue. We're exploring tokenizing 25% to fund an expansion wing.",
      status: "new",
      pdf: "property-docs-alpine-resort.pdf",
    },
    {
      firstName: "Fatima",
      lastName: "Al-Rashid",
      email: "fatima@dubaiproperties.ae",
      phoneNumber: "+971 50 987 6543",
      propertyName: "Dubai Business Plaza",
      propertyAddress: "Sheikh Zayed Road, DIFC, Dubai, UAE",
      country: "United Arab Emirates",
      message: "Requesting tokenization for our mixed-use development in DIFC. The property includes 30 floors of premium office space and 8 floors of retail. Currently valued at AED 450M.",
      status: "approved",
      pdf: "property-docs-dubai-plaza.pdf",
    },
    {
      firstName: "Charlotte",
      lastName: "Whitfield",
      email: "c.whitfield@kensingtonestates.co.uk",
      phoneNumber: "+44 7700 123456",
      propertyName: "Kensington House",
      propertyAddress: "14 Kensington Palace Gardens, London W8 4QP, UK",
      country: "United Kingdom",
      message: "Heritage residential building with 24 luxury apartments. Grade II listed. We want to explore tokenization options while preserving the building's historical character. Estimated value GBP 85M.",
      status: "sent",
      pdf: "property-docs-london-house.pdf",
    },
    {
      firstName: "Takeshi",
      lastName: "Nakamura",
      email: "t.nakamura@shibuyatech.jp",
      phoneNumber: "+81 90 8765 4321",
      propertyName: "Shibuya Tech Center",
      propertyAddress: "1-2-3 Shibuya, Shibuya-ku, Tokyo 150-0002, Japan",
      country: "Japan",
      message: "Modern office tower in Shibuya catering to tech companies. 18 floors, 95% occupancy. Looking to tokenize 30% to raise capital for smart building upgrades. Annual NOI of JPY 1.2B.",
      status: "new",
      pdf: "property-docs-tokyo-center.pdf",
    },
  ];

  // --- Seed job application tickets ---
  const jobTickets = [
    {
      firstName: "Sarah",
      lastName: "Chen",
      email: "sarah.chen@gmail.com",
      phoneNumber: "+1 415 555 0142",
      linkedinUrl: "https://linkedin.com/in/sarahchen-dev",
      position: "Senior Full-Stack Engineer",
      message: "I'm a full-stack engineer with 5 years of experience building scalable web applications. Most recently at Stripe where I led the payments dashboard team. Proficient in React, Node.js, and PostgreSQL. Excited about RedSwan's mission in real estate tokenization.",
      status: "pending_review",
      pdf: "resume-sarah-chen.pdf",
    },
    {
      firstName: "Marcus",
      lastName: "Johnson",
      email: "marcus.johnson@outlook.com",
      phoneNumber: "+1 212 555 0198",
      linkedinUrl: "https://linkedin.com/in/marcusjohnson-pm",
      position: "Product Manager",
      message: "Product manager with 7 years in fintech. Previously at Coinbase and Square, where I shipped products used by 2M+ users. I bring deep experience in compliance-heavy product environments and would love to help shape RedSwan's tokenization platform.",
      status: "new",
      pdf: "resume-marcus-johnson.pdf",
    },
    {
      firstName: "Elena",
      lastName: "Rodriguez",
      email: "elena.r@protonmail.com",
      phoneNumber: "+34 612 345 678",
      linkedinUrl: "https://linkedin.com/in/elenarodriguez-ux",
      position: "UX Designer",
      message: "UX designer with 4 years designing enterprise SaaS applications. I specialize in complex data visualization and making financial products accessible. Portfolio includes work for Bloomberg Terminal and Revolut Business.",
      status: "approved",
      pdf: "resume-elena-rodriguez.pdf",
    },
    {
      firstName: "David",
      lastName: "Kim",
      email: "david.kim@yahoo.com",
      phoneNumber: "+82 10 9876 5432",
      linkedinUrl: "https://linkedin.com/in/davidkim-data",
      position: "Data Analyst",
      message: "Data analyst with 3 years in business intelligence, specializing in real estate market analytics. Experienced with Python, SQL, Tableau, and building predictive models for property valuation. Currently finishing my MS in Data Science at Seoul National University.",
      status: "new",
      pdf: "resume-david-kim.pdf",
    },
    {
      firstName: "Priya",
      lastName: "Patel",
      email: "priya.patel@gmail.com",
      phoneNumber: "+91 98765 43210",
      linkedinUrl: "https://linkedin.com/in/priyapatel-mktg",
      position: "Marketing Specialist",
      message: "Digital marketing specialist with 6 years of experience, including 3 years in proptech. Led growth campaigns at PropertyGuru that increased lead generation by 180%. Strong background in SEO, content marketing, and paid acquisition for B2B SaaS.",
      status: "sent",
      pdf: "resume-priya-patel.pdf",
    },
  ];

  // Insert property tokenization tickets
  for (const t of propertyTickets) {
    const ticketId = `ticket_pt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const daysAgo = Math.floor(Math.random() * 14) + 1;
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    await client.query(
      `INSERT INTO "Ticket" (id, category, "firstName", "lastName", email, "phoneNumber", "propertyName", "propertyAddress", country, message, subject, location, status, "aiDraftSubject", "aiDraftResponse", "finalSubject", "finalResponse", "n8nExecutionId", "createdAt", "updatedAt")
       VALUES ($1, 'property_tokenization', $2, $3, $4, $5, $6, $7, $8, $9, '', '', $10, '', '', '', '', '', $11, $11)`,
      [ticketId, t.firstName, t.lastName, t.email, t.phoneNumber, t.propertyName, t.propertyAddress, t.country, t.message, t.status, createdAt.toISOString()]
    );

    const attachId = `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await client.query(
      `INSERT INTO "Attachment" (id, "fileName", "fileType", "fileUrl", "fileSize", "ticketId", "createdAt")
       VALUES ($1, $2, 'application/pdf', $3, $4, $5, $6)`,
      [attachId, t.pdf, `/uploads/${t.pdf}`, 682, ticketId, createdAt.toISOString()]
    );

    console.log(`  Property ticket: ${t.propertyName} (${t.status})`);
  }

  // Insert job application tickets
  for (const t of jobTickets) {
    const ticketId = `ticket_ja_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const daysAgo = Math.floor(Math.random() * 14) + 1;
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    await client.query(
      `INSERT INTO "Ticket" (id, category, "firstName", "lastName", email, "phoneNumber", "linkedinUrl", position, message, subject, location, status, "aiDraftSubject", "aiDraftResponse", "finalSubject", "finalResponse", "n8nExecutionId", "createdAt", "updatedAt")
       VALUES ($1, 'job_application', $2, $3, $4, $5, $6, $7, $8, '', '', $9, '', '', '', '', '', $10, $10)`,
      [ticketId, t.firstName, t.lastName, t.email, t.phoneNumber, t.linkedinUrl, t.position, t.message, t.status, createdAt.toISOString()]
    );

    const attachId = `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await client.query(
      `INSERT INTO "Attachment" (id, "fileName", "fileType", "fileUrl", "fileSize", "ticketId", "createdAt")
       VALUES ($1, $2, 'application/pdf', $3, $4, $5, $6)`,
      [attachId, t.pdf, `/uploads/${t.pdf}`, 670, ticketId, createdAt.toISOString()]
    );

    console.log(`  Job application: ${t.firstName} ${t.lastName} - ${t.position} (${t.status})`);
  }

  console.log("\nSeeding complete!");
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
