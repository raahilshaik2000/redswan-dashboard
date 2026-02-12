import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Inbox, Eye, CheckCircle, Send } from "lucide-react";
import type { TicketStats } from "@/lib/types";
import type { LucideIcon } from "lucide-react";

interface StatCard {
  title: string;
  key: keyof TicketStats;
  icon: LucideIcon;
  color: string;
}

const cards: StatCard[] = [
  { title: "Total Tickets", key: "total", icon: Inbox, color: "text-muted-foreground" },
  { title: "New", key: "new", icon: Inbox, color: "text-blue-500" },
  { title: "Pending Review", key: "pending_review", icon: Eye, color: "text-amber-500" },
  { title: "Sent", key: "sent", icon: Send, color: "text-purple-500" },
];

export function TicketsHeader({ stats }: { stats: TicketStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.key}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats[card.key]}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
