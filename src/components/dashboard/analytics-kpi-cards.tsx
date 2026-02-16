import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Inbox, Sparkles, Clock, Send } from "lucide-react";

interface AnalyticsKPICardsProps {
  totalTickets: number;
  newTickets: number;
  avgResponseTimeSeconds: number;
  sentTickets: number;
}

function formatDuration(seconds: number): string {
  if (seconds === 0) return "N/A";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function AnalyticsKPICards({
  totalTickets,
  newTickets,
  avgResponseTimeSeconds,
  sentTickets,
}: AnalyticsKPICardsProps) {
  const cards = [
    {
      title: "Total Tickets",
      value: totalTickets,
      icon: Inbox,
      color: "text-muted-foreground",
    },
    {
      title: "New (30d)",
      value: newTickets,
      icon: Sparkles,
      color: "text-cyan-400",
    },
    {
      title: "Avg Response Time",
      value: formatDuration(avgResponseTimeSeconds),
      icon: Clock,
      color: "text-yellow-400",
    },
    {
      title: "Sent",
      value: sentTickets,
      icon: Send,
      color: "text-purple-400",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
