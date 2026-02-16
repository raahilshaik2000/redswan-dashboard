import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TicketStatusBadge } from "@/components/tickets/ticket-status-badge";
import { CATEGORY_CONFIG } from "@/lib/category-config";
import type { TicketStatus, TicketCategory } from "@/lib/types";

interface ActivityItem {
  id: string;
  firstName: string;
  lastName: string;
  subject: string;
  propertyName: string | null;
  position: string | null;
  category: TicketCategory;
  status: TicketStatus;
  updatedAt: string;
}

const CATEGORY_BADGE_STYLES: Record<TicketCategory, string> = {
  contact_us: "bg-cyan-500/15 text-cyan-400",
  property_tokenization: "bg-orange-500/15 text-orange-400",
  job_application: "bg-purple-500/15 text-purple-400",
};

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

  function getSubline(item: ActivityItem): string {
    if (item.category === "property_tokenization" && item.propertyName)
      return item.propertyName;
    if (item.category === "job_application" && item.position)
      return item.position;
    return item.subject;
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
            {items.map((item) => {
              const config = CATEGORY_CONFIG[item.category];
              return (
                <Link
                  key={item.id}
                  href={`/${config.slug}/${item.id}`}
                  className="flex items-center justify-between rounded-md p-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {item.firstName} {item.lastName}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${CATEGORY_BADGE_STYLES[item.category]}`}
                      >
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {getSubline(item)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <TicketStatusBadge status={item.status} />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {timeAgo(item.updatedAt)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
