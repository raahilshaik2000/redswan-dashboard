import { z } from "zod";

const ticketCategoryEnum = z.enum([
  "contact_us",
  "property_tokenization",
  "job_application",
]);

const attachmentSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  fileUrl: z.string().url(),
  fileSize: z.number().int().positive().optional(),
});

export const inboundTicketSchema = z.object({
  category: ticketCategoryEnum.optional().default("contact_us"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  location: z.string().optional().default(""),
  subject: z.string().optional().default(""),
  message: z.string().optional().default(""),
  phoneNumber: z.string().optional(),
  propertyName: z.string().optional(),
  propertyAddress: z.string().optional(),
  country: z.string().optional(),
  linkedinUrl: z.string().optional(),
  position: z.string().optional(),
  aiDraftSubject: z.string().optional().default(""),
  aiDraftResponse: z.string().optional().default(""),
  n8nExecutionId: z.string().optional().default(""),
  attachments: z.array(attachmentSchema).optional(),
});

export const updateTicketSchema = z.object({
  finalSubject: z.string().optional(),
  finalResponse: z.string().optional(),
  status: z
    .enum(["new", "pending_review", "approved", "sent", "archived"])
    .optional(),
});

export const noteSchema = z.object({
  content: z.string().min(1, "Note content is required").max(2000),
});

export const updateProfileSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword && !data.currentPassword) return false;
      return true;
    },
    { message: "Current password is required to set a new password", path: ["currentPassword"] }
  )
  .refine(
    (data) => {
      if (data.newPassword && data.newPassword.length < 8) return false;
      return true;
    },
    { message: "New password must be at least 8 characters", path: ["newPassword"] }
  )
  .refine(
    (data) => {
      if (data.newPassword && data.newPassword !== data.confirmPassword) return false;
      return true;
    },
    { message: "Passwords do not match", path: ["confirmPassword"] }
  );

export const twoFactorVerifySchema = z.object({
  code: z.string().length(6).regex(/^\d{6}$/, "Code must be 6 digits"),
});

export const ticketQuerySchema = z.object({
  status: z
    .enum(["new", "pending_review", "approved", "sent", "archived"])
    .optional(),
  category: ticketCategoryEnum.optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});
