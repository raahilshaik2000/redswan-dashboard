import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TicketStatusBadge } from "@/components/tickets/ticket-status-badge";
import type { TicketStatus } from "@/lib/types";

interface ActivityItem {
  id: string;
  firstName: string;
  lastName: string;
  subject: string;
  status: TicketStatus;
  updatedAt: string;
}

export function RecentActivityFeed({ items }: { items: ActivityItem[] }) {
  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No recent activity
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/tickets/${item.id}`}
                className="flex items-center justify-between rounded-md p-2 hover:bg-muted/50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {item.firstName} {item.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.subject}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <TicketStatusBadge status={item.status} />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {timeAgo(item.updatedAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
