import type { TicketCategory } from "./types";

export interface CategoryConfig {
  label: string;
  slug: string;
  subtitle: string;
  tableTitle: string;
  tableDescription: string;
  /** Which optional fields to show on the detail page */
  detailFields: string[];
  /** Column header to replace "Subject" in the table, or null to keep "Subject" */
  listColumn: { key: string; label: string } | null;
  /** Extra CSV headers for export */
  extraCsvHeaders: string[];
  /** Extra CSV field keys (matching Ticket field names) */
  extraCsvKeys: string[];
}

export const CATEGORY_CONFIG: Record<TicketCategory, CategoryConfig> = {
  contact_us: {
    label: "Contact Us",
    slug: "contact-us",
    subtitle: "Manage contact form inquiries and AI-drafted responses",
    tableTitle: "Contact Submissions",
    tableDescription: "Review and respond to contact form inquiries",
    detailFields: ["email", "location", "subject", "message"],
    listColumn: null,
    extraCsvHeaders: ["Location", "Subject"],
    extraCsvKeys: ["location", "subject"],
  },
  property_tokenization: {
    label: "Property Tokenization",
    slug: "property-tokenization",
    subtitle: "Manage property tokenization requests",
    tableTitle: "Tokenization Requests",
    tableDescription: "Review property tokenization submissions",
    detailFields: [
      "email",
      "phoneNumber",
      "propertyName",
      "propertyAddress",
      "country",
      "message",
      "attachments",
    ],
    listColumn: { key: "propertyName", label: "Property" },
    extraCsvHeaders: ["Phone", "Property Name", "Property Address", "Country"],
    extraCsvKeys: ["phoneNumber", "propertyName", "propertyAddress", "country"],
  },
  job_application: {
    label: "Job Applicants",
    slug: "job-applicants",
    subtitle: "Manage job applications and candidate submissions",
    tableTitle: "Job Applications",
    tableDescription: "Review candidate applications",
    detailFields: [
      "email",
      "phoneNumber",
      "linkedinUrl",
      "position",
      "message",
      "attachments",
    ],
    listColumn: { key: "position", label: "Position" },
    extraCsvHeaders: ["Phone", "LinkedIn", "Position"],
    extraCsvKeys: ["phoneNumber", "linkedinUrl", "position"],
  },
};

export function getCategoryBySlug(slug: string): TicketCategory | undefined {
  for (const [category, config] of Object.entries(CATEGORY_CONFIG)) {
    if (config.slug === slug) return category as TicketCategory;
  }
  return undefined;
}
