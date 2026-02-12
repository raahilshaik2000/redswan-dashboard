export type TicketStatus =
  | "new"
  | "pending_review"
  | "approved"
  | "sent"
  | "archived";

export interface Ticket {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  subject: string;
  message: string;
  aiDraftSubject: string;
  aiDraftResponse: string;
  finalSubject: string;
  finalResponse: string;
  status: TicketStatus;
  n8nExecutionId: string;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  status: TicketStatus;
  createdAt: string;
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
  firstName: string;
  lastName: string;
  email: string;
  location?: string;
  subject: string;
  message: string;
  aiDraftSubject?: string;
  aiDraftResponse?: string;
  n8nExecutionId?: string;
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
