import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TicketStatusBadge } from "./ticket-status-badge";
import { Mail, MapPin, Calendar } from "lucide-react";
import type { Ticket } from "@/lib/types";

export function TicketDetailCard({ ticket }: { ticket: Ticket }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {ticket.firstName} {ticket.lastName}
          </CardTitle>
          <TicketStatusBadge status={ticket.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{ticket.email}</span>
          </div>
          {ticket.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{ticket.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{new Date(ticket.createdAt).toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Subject</h3>
          <p className="text-sm">{ticket.subject}</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Message</h3>
          <div className="rounded-md bg-muted/50 p-3 text-sm whitespace-pre-wrap">
            {ticket.message}
          </div>
        </div>

        {ticket.n8nExecutionId && (
          <div className="text-xs text-muted-foreground">
            n8n Execution: {ticket.n8nExecutionId}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
