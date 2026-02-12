import { Badge } from "@/components/ui/badge";
import type { TicketStatus } from "@/lib/types";

const statusConfig: Record<TicketStatus, { label: string; className: string }> = {
  new: {
    label: "New",
    className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  },
  pending_review: {
    label: "Pending Review",
    className: "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
  },
  sent: {
    label: "Sent",
    className: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
  },
  archived: {
    label: "Archived",
    className: "bg-zinc-500/10 text-zinc-500 hover:bg-zinc-500/20",
  },
};

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  );
}
