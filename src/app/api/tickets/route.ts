import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ticketQuerySchema } from "@/lib/validations";
import { TicketStatus, TicketCategory } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = ticketQuerySchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { status, category, page, limit } = parsed.data;
  const where: Record<string, unknown> = {};
  if (status) where.status = status as TicketStatus;
  if (category) where.category = category as TicketCategory;

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      select: {
        id: true,
        category: true,
        firstName: true,
        lastName: true,
        email: true,
        subject: true,
        status: true,
        createdAt: true,
        propertyName: true,
        position: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.ticket.count({ where }),
  ]);

  return NextResponse.json({
    tickets,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
