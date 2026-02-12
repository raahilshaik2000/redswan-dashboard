import "dotenv/config";
import pg from "pg";

const tickets = [
  {
    firstName: "Sarah",
    lastName: "Mitchell",
    email: "sarah.mitchell@outlook.com",
    location: "Austin, TX",
    subject: "Issue with recent property appraisal",
    message: "Hi, I recently received my property appraisal report and I believe the valuation is significantly lower than expected. Could you please review the comparable properties used and provide clarification?",
    aiDraftSubject: "RE: Issue with recent property appraisal",
    aiDraftResponse: "Dear Sarah,\n\nThank you for reaching out regarding your property appraisal. I understand your concern about the valuation. I'd be happy to review the comparable properties used in the assessment and provide a detailed breakdown. Could you share your property address and the appraisal report number so I can look into this?\n\nBest regards,\nRedSwan Team",
    status: "pending_review",
  },
  {
    firstName: "James",
    lastName: "Carter",
    email: "jcarter@gmail.com",
    location: "Denver, CO",
    subject: "Request for investment portfolio update",
    message: "Hello, I'd like to get an updated summary of my current real estate investment portfolio including any recent changes in asset values.",
    aiDraftSubject: "RE: Request for investment portfolio update",
    aiDraftResponse: "Dear James,\n\nThank you for your request. I'll prepare an updated portfolio summary reflecting the latest asset valuations. You can expect to receive this within 2 business days. Please let me know if you need anything specific included.\n\nBest regards,\nRedSwan Team",
    status: "new",
  },
  {
    firstName: "Emily",
    lastName: "Nguyen",
    email: "emily.nguyen@company.io",
    location: "San Francisco, CA",
    subject: "Tokenization process timeline",
    message: "Can you provide an estimated timeline for the tokenization of the commercial property we discussed last week? We need to align our internal schedules.",
    aiDraftSubject: "RE: Tokenization process timeline",
    aiDraftResponse: "Dear Emily,\n\nThank you for following up. The tokenization process for your commercial property typically takes 4-6 weeks from document submission. I'll send over a detailed timeline with milestones by end of day tomorrow.\n\nBest regards,\nRedSwan Team",
    status: "approved",
  },
  {
    firstName: "Michael",
    lastName: "Brooks",
    email: "m.brooks@realestatepro.com",
    location: "Miami, FL",
    subject: "Inquiry about listing a new property",
    message: "I'm interested in listing a luxury condo in downtown Miami on your platform. What are the requirements and fees involved?",
    aiDraftSubject: "RE: Inquiry about listing a new property",
    aiDraftResponse: "Dear Michael,\n\nThank you for your interest in listing with RedSwan. For luxury properties, we require a professional appraisal, property documentation, and legal clearance. Our listing fee is 2.5% of the tokenized value. I'd love to schedule a call to walk you through the full process.\n\nBest regards,\nRedSwan Team",
    status: "sent",
  },
  {
    firstName: "Priya",
    lastName: "Sharma",
    email: "priya.s@techventures.com",
    location: "New York, NY",
    subject: "Dividend distribution question",
    message: "Hi, I noticed my Q4 dividend payment hasn't been deposited yet. Can you check on the status of this?",
    aiDraftSubject: "RE: Dividend distribution question",
    aiDraftResponse: "Dear Priya,\n\nThank you for bringing this to our attention. I'm looking into your Q4 dividend distribution now. There was a minor processing delay affecting some accounts. I'll have an update for you within 24 hours.\n\nBest regards,\nRedSwan Team",
    status: "new",
  },
  {
    firstName: "David",
    lastName: "Kim",
    email: "david.kim@investor.net",
    location: "Seattle, WA",
    subject: "Account verification documents",
    message: "I submitted my KYC documents two weeks ago but haven't received confirmation. Please advise on the status.",
    aiDraftSubject: "RE: Account verification documents",
    aiDraftResponse: "Dear David,\n\nI apologize for the delay. I've escalated your KYC verification and it should be completed within the next 48 hours. You'll receive an email confirmation once approved.\n\nBest regards,\nRedSwan Team",
    status: "pending_review",
  },
  {
    firstName: "Rachel",
    lastName: "Thompson",
    email: "rachel.t@gmail.com",
    location: "Chicago, IL",
    subject: "Property tour scheduling",
    message: "I'd like to schedule an in-person tour of the warehouse property listed at 450 Industrial Blvd. Is next Tuesday available?",
    aiDraftSubject: "RE: Property tour scheduling",
    aiDraftResponse: "Dear Rachel,\n\nThank you for your interest! Next Tuesday works perfectly. I've tentatively blocked 2:00 PM for your tour at 450 Industrial Blvd. Please confirm and I'll send over the details.\n\nBest regards,\nRedSwan Team",
    status: "approved",
  },
  {
    firstName: "Alex",
    lastName: "Rodriguez",
    email: "alex.rod@outlook.com",
    location: "Phoenix, AZ",
    subject: "Transfer of token ownership",
    message: "I need to transfer my property tokens to a family trust. What's the process for changing ownership on the platform?",
    aiDraftSubject: "RE: Transfer of token ownership",
    aiDraftResponse: "Dear Alex,\n\nToken ownership transfers are supported through our platform. You'll need to provide the trust documentation and complete a transfer request form. I'll email you the required documents shortly.\n\nBest regards,\nRedSwan Team",
    status: "new",
  },
  {
    firstName: "Lisa",
    lastName: "Patel",
    email: "lisa.patel@financecorp.com",
    location: "Boston, MA",
    subject: "Annual tax documentation request",
    message: "Could you send me the tax documentation for all my property investments for the 2025 fiscal year? I need them for my accountant.",
    aiDraftSubject: "RE: Annual tax documentation request",
    aiDraftResponse: "Dear Lisa,\n\nOf course! Your 2025 tax documents are being compiled and will be available for download in your account dashboard by February 15th. I'll notify you as soon as they're ready.\n\nBest regards,\nRedSwan Team",
    status: "archived",
  },
  {
    firstName: "Tom",
    lastName: "Wallace",
    email: "twallace@protonmail.com",
    location: "Portland, OR",
    subject: "Platform login issues",
    message: "I've been locked out of my account after multiple failed login attempts. Can you help me regain access?",
    aiDraftSubject: "RE: Platform login issues",
    aiDraftResponse: "Dear Tom,\n\nI'm sorry for the inconvenience. I've unlocked your account and sent a password reset link to your registered email. If you continue to experience issues, please let me know.\n\nBest regards,\nRedSwan Team",
    status: "sent",
  },
];

async function main() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  for (let i = 0; i < tickets.length; i++) {
    const t = tickets[i];
    const id = `ticket_sample_${Date.now()}_${i}`;
    // Stagger createdAt so they have different timestamps
    const createdAt = new Date(Date.now() - (tickets.length - i) * 3600000).toISOString();

    await client.query(
      `INSERT INTO "Ticket" (id, "firstName", "lastName", email, location, subject, message, "aiDraftSubject", "aiDraftResponse", status, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)`,
      [id, t.firstName, t.lastName, t.email, t.location, t.subject, t.message, t.aiDraftSubject, t.aiDraftResponse, t.status, createdAt]
    );
  }

  console.log(`Inserted ${tickets.length} sample tickets`);
  await client.end();
}

main();
