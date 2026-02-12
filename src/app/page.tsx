import { Suspense } from "react";
import { Header } from "@/components/dashboard/header";
import { AnalyticsKPICards } from "@/components/dashboard/analytics-kpi-cards";
import { TicketVolumeChart } from "@/components/dashboard/ticket-volume-chart";
import { StatusBreakdownChart } from "@/components/dashboard/status-breakdown-chart";
import { RecentActivityFeed } from "@/components/dashboard/recent-activity-feed";
import { prisma } from "@/lib/prisma";
import type { TicketStatus } from "@/lib/types";

async function getAnalytics() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [allTickets, statusCounts, totalCount, sentCount, recentTickets] =
    await Promise.all([
      prisma.ticket.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true, respondedAt: true },
      }),
      prisma.ticket.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: "sent" } }),
      prisma.ticket.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          subject: true,
          status: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),
    ]);

  // Volume by day
  const dayMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dayMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const t of allTickets) {
    const day = t.createdAt.toISOString().slice(0, 10);
    dayMap.set(day, (dayMap.get(day) || 0) + 1);
  }
  const volumeByDay = Array.from(dayMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  // Status breakdown
  const statusBreakdown = statusCounts.map((row) => ({
    status: row.status,
    count: row._count,
  }));

  // Avg response time
  const responded = allTickets.filter((t) => t.respondedAt);
  const avgResponseTimeSeconds =
    responded.length > 0
      ? responded.reduce(
          (sum, t) =>
            sum + (t.respondedAt!.getTime() - t.createdAt.getTime()) / 1000,
          0
        ) / responded.length
      : 0;

  // Recent activity
  const recentActivity = recentTickets.map((t) => ({
    id: t.id,
    firstName: t.firstName,
    lastName: t.lastName,
    subject: t.subject,
    status: t.status as TicketStatus,
    updatedAt: t.updatedAt.toISOString(),
  }));

  return {
    totalCount,
    newCount: allTickets.length,
    sentCount,
    avgResponseTimeSeconds,
    volumeByDay,
    statusBreakdown,
    recentActivity,
  };
}

export default async function DashboardPage() {
  const analytics = await getAnalytics();

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Overview of ticket activity and performance metrics
          </p>
        </div>

        <div className="space-y-6">
          <AnalyticsKPICards
            totalTickets={analytics.totalCount}
            newTickets={analytics.newCount}
            avgResponseTimeSeconds={analytics.avgResponseTimeSeconds}
            sentTickets={analytics.sentCount}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <TicketVolumeChart data={analytics.volumeByDay} />
            <StatusBreakdownChart data={analytics.statusBreakdown} />
          </div>

          <RecentActivityFeed items={analytics.recentActivity} />
        </div>
      </main>
    </div>
  );
}
