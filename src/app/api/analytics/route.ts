import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [allTickets, statusCounts, recentTickets] = await Promise.all([
    prisma.ticket.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, respondedAt: true },
    }),
    prisma.ticket.groupBy({
      by: ["status"],
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
            sum +
            (t.respondedAt!.getTime() - t.createdAt.getTime()) / 1000,
          0
        ) / responded.length
      : 0;

  // Recent activity
  const recentActivity = recentTickets.map((t) => ({
    id: t.id,
    firstName: t.firstName,
    lastName: t.lastName,
    subject: t.subject,
    propertyName: t.propertyName,
    position: t.position,
    category: t.category,
    status: t.status,
    updatedAt: t.updatedAt.toISOString(),
  }));

  return NextResponse.json({
    volumeByDay,
    statusBreakdown,
    avgResponseTimeSeconds,
    recentActivity,
  });
}
