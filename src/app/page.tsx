import { Suspense } from "react";
import { Header } from "@/components/dashboard/header";
import { AnalyticsKPICards } from "@/components/dashboard/analytics-kpi-cards";
import { CategoryOverviewCards } from "@/components/dashboard/category-overview-cards";
import { TicketVolumeChart } from "@/components/dashboard/ticket-volume-chart";
import { StatusBreakdownChart } from "@/components/dashboard/status-breakdown-chart";
import { RecentActivityFeed } from "@/components/dashboard/recent-activity-feed";
import { prisma } from "@/lib/prisma";
import type { TicketStatus, TicketCategory } from "@/lib/types";

async function getAnalytics() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    allTickets,
    statusCounts,
    totalCount,
    sentCount,
    categoryCounts,
    categoryNewCounts,
    recentTickets,
  ] = await Promise.all([
    prisma.ticket.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, respondedAt: true, category: true },
    }),
    prisma.ticket.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.ticket.count(),
    prisma.ticket.count({ where: { status: "sent" } }),
    prisma.ticket.groupBy({
      by: ["category"],
      _count: true,
    }),
    prisma.ticket.groupBy({
      by: ["category"],
      where: { status: "new" },
      _count: true,
    }),
    prisma.ticket.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        subject: true,
        propertyName: true,
        position: true,
        category: true,
        status: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
  ]);

  // Volume by day per category
  const categories: TicketCategory[] = [
    "contact_us",
    "property_tokenization",
    "job_application",
  ];
  const dayMap = new Map<
    string,
    { date: string; contact_us: number; property_tokenization: number; job_application: number }
  >();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dayMap.set(key, { date: key, contact_us: 0, property_tokenization: 0, job_application: 0 });
  }
  for (const t of allTickets) {
    const day = t.createdAt.toISOString().slice(0, 10);
    const entry = dayMap.get(day);
    if (entry && categories.includes(t.category as TicketCategory)) {
      entry[t.category as TicketCategory]++;
    }
  }
  const volumeByDay = Array.from(dayMap.values());

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

  // Per-category stats
  const categoryMap = Object.fromEntries(categories.map((c) => [c, { total: 0, new: 0 }]));
  for (const row of categoryCounts) {
    if (categoryMap[row.category]) categoryMap[row.category].total = row._count;
  }
  for (const row of categoryNewCounts) {
    if (categoryMap[row.category]) categoryMap[row.category].new = row._count;
  }

  // Recent activity with category
  const recentActivity = recentTickets.map((t) => ({
    id: t.id,
    firstName: t.firstName,
    lastName: t.lastName,
    subject: t.subject,
    propertyName: t.propertyName,
    position: t.position,
    category: t.category as TicketCategory,
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
    categoryStats: categoryMap as Record<TicketCategory, { total: number; new: number }>,
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
            Overview of all submissions across categories
          </p>
        </div>

        <div className="space-y-6">
          <AnalyticsKPICards
            totalTickets={analytics.totalCount}
            newTickets={analytics.newCount}
            avgResponseTimeSeconds={analytics.avgResponseTimeSeconds}
            sentTickets={analytics.sentCount}
          />

          <CategoryOverviewCards stats={analytics.categoryStats} />

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
