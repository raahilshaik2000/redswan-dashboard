import { Suspense } from "react";
import { Header } from "@/components/dashboard/header";
import { TicketsLiveWrapper } from "@/components/tickets/tickets-live-wrapper";
import { prisma } from "@/lib/prisma";
import { TicketStatus as PrismaTicketStatus } from "@/generated/prisma/enums";
import { CATEGORY_CONFIG } from "@/lib/category-config";
import type { TicketStats, TicketListItem } from "@/lib/types";

const CATEGORY = "job_application" as const;
const config = CATEGORY_CONFIG[CATEGORY];

async function getStats(): Promise<TicketStats> {
  const counts = await prisma.ticket.groupBy({
    by: ["status"],
    where: { category: CATEGORY },
    _count: true,
  });

  const stats: TicketStats = {
    total: 0,
    new: 0,
    pending_review: 0,
    approved: 0,
    sent: 0,
    archived: 0,
  };

  for (const row of counts) {
    stats[row.status] = row._count;
    stats.total += row._count;
  }

  return stats;
}

async function getTickets(status?: string, search?: string, page = 1, limit = 25) {
  const where: Record<string, unknown> = { category: CATEGORY };
  if (status) where.status = status as PrismaTicketStatus;
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { position: { contains: search, mode: "insensitive" } },
    ];
  }

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        subject: true,
        position: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.ticket.count({ where }),
  ]);

  return {
    tickets: tickets.map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
    })) as TicketListItem[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export default async function JobApplicantsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const status = params.status;
  const search = params.search;
  const page = params.page ? parseInt(params.page, 10) : 1;

  const [stats, ticketData] = await Promise.all([
    getStats(),
    getTickets(status, search, page),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">{config.label}</h2>
          <p className="text-sm text-muted-foreground">{config.subtitle}</p>
        </div>

        <Suspense fallback={<div>Loading tickets...</div>}>
          <TicketsLiveWrapper
            initialStats={stats}
            initialTickets={ticketData.tickets}
            initialPagination={ticketData.pagination}
            currentStatus={status}
            currentSearch={search}
            category={CATEGORY}
          />
        </Suspense>
      </main>
    </div>
  );
}
