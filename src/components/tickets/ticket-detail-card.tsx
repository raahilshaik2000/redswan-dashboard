import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TicketStatusBadge } from "./ticket-status-badge";
import {
  Mail,
  MapPin,
  Calendar,
  Phone,
  Building,
  Globe,
  Linkedin,
  Briefcase,
} from "lucide-react";
import { AttachmentList } from "./attachment-list";
import type { Ticket, TicketCategory } from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/category-config";

interface TicketDetailCardProps {
  ticket: Ticket;
  category?: TicketCategory;
}

export function TicketDetailCard({ ticket, category }: TicketDetailCardProps) {
  const config = category ? CATEGORY_CONFIG[category] : CATEGORY_CONFIG.contact_us;
  const fields = config.detailFields;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-5xl">
            {ticket.firstName} {ticket.lastName}
          </CardTitle>
          <TicketStatusBadge status={ticket.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          {fields.includes("email") && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{ticket.email}</span>
            </div>
          )}
          {fields.includes("location") && ticket.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{ticket.location}</span>
            </div>
          )}
          {fields.includes("phoneNumber") && ticket.phoneNumber && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{ticket.phoneNumber}</span>
            </div>
          )}
          {fields.includes("propertyName") && ticket.propertyName && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building className="h-4 w-4" />
              <span>{ticket.propertyName}</span>
            </div>
          )}
          {fields.includes("propertyAddress") && ticket.propertyAddress && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{ticket.propertyAddress}</span>
            </div>
          )}
          {fields.includes("country") && ticket.country && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>{ticket.country}</span>
            </div>
          )}
          {fields.includes("linkedinUrl") && ticket.linkedinUrl && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Linkedin className="h-4 w-4" />
              <a
                href={ticket.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                {ticket.linkedinUrl}
              </a>
            </div>
          )}
          {fields.includes("position") && ticket.position && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span>{ticket.position}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{new Date(ticket.createdAt).toLocaleString()}</span>
          </div>
        </div>

        {fields.includes("subject") && ticket.subject && (
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Subject</h3>
            <p className="text-sm">{ticket.subject}</p>
          </div>
        )}

        {fields.includes("message") && ticket.message && (
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Message</h3>
            <div className="rounded-md bg-muted/50 p-3 text-sm whitespace-pre-wrap">
              {ticket.message}
            </div>
          </div>
        )}

        {fields.includes("attachments") &&
          ticket.attachments &&
          ticket.attachments.length > 0 && (
            <AttachmentList attachments={ticket.attachments} />
          )}
      </CardContent>
    </Card>
  );
}
