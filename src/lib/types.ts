export type TicketStatus =
  | "new"
  | "pending_review"
  | "approved"
  | "sent"
  | "archived";

export type TicketCategory =
  | "contact_us"
  | "property_tokenization"
  | "job_application";

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileSize: number | null;
  ticketId: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  category: TicketCategory;
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  subject: string;
  message: string;
  phoneNumber: string | null;
  propertyName: string | null;
  propertyAddress: string | null;
  country: string | null;
  linkedinUrl: string | null;
  position: string | null;
  aiDraftSubject: string;
  aiDraftResponse: string;
  finalSubject: string;
  finalResponse: string;
  status: TicketStatus;
  n8nExecutionId: string;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
  attachments?: Attachment[];
}

export interface TicketListItem {
  id: string;
  category: TicketCategory;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  status: TicketStatus;
  createdAt: string;
  propertyName?: string | null;
  position?: string | null;
}

export interface TicketStats {
  total: number;
  new: number;
  pending_review: number;
  approved: number;
  sent: number;
  archived: number;
}

export interface InboundTicketPayload {
  category?: TicketCategory;
  firstName: string;
  lastName: string;
  email: string;
  location?: string;
  subject?: string;
  message?: string;
  phoneNumber?: string;
  propertyName?: string;
  propertyAddress?: string;
  country?: string;
  linkedinUrl?: string;
  position?: string;
  aiDraftSubject?: string;
  aiDraftResponse?: string;
  n8nExecutionId?: string;
  attachments?: {
    fileName: string;
    fileType: string;
    fileUrl: string;
    fileSize?: number;
  }[];
}

export interface UpdateTicketPayload {
  finalSubject?: string;
  finalResponse?: string;
  status?: TicketStatus;
}

export interface Note {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  ticketId: string;
  createdAt: string;
}

export interface AnalyticsData {
  volumeByDay: { date: string; count: number }[];
  statusBreakdown: { status: string; count: number }[];
  avgResponseTimeSeconds: number;
  recentActivity: {
    id: string;
    firstName: string;
    lastName: string;
    subject: string;
    status: TicketStatus;
    updatedAt: string;
  }[];
}
