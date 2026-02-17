import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TicketCategory } from "@/generated/prisma";
import type { TicketStats } from "@/lib/types";

export async function GET(request: NextRequest) {
  const categoryParam = request.nextUrl.searchParams.get("category");
  const where: Record<string, unknown> = {};
  if (categoryParam) where.category = categoryParam as TicketCategory;

  const counts = await prisma.ticket.groupBy({
    by: ["status"],
    where,
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

  return NextResponse.json(stats);
}
