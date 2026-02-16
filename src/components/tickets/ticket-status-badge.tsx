import { Badge } from "@/components/ui/badge";
import type { TicketStatus } from "@/lib/types";

const statusConfig: Record<TicketStatus, { label: string; className: string }> = {
  new: {
    label: "New",
    className: "bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25",
  },
  pending_review: {
    label: "Pending Review",
    className: "bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25",
  },
  approved: {
    label: "Approved",
    className: "bg-green-500/15 text-green-400 hover:bg-green-500/25",
  },
  sent: {
    label: "Sent",
    className: "bg-purple-500/15 text-purple-400 hover:bg-purple-500/25",
  },
  archived: {
    label: "Archived",
    className: "bg-zinc-500/15 text-zinc-400 hover:bg-zinc-500/25",
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
