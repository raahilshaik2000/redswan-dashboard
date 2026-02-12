import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TicketStatus } from "@/generated/prisma/enums";
import { generateCSV } from "@/lib/csv";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const status = params.get("status");
  const search = params.get("search");

  const where: Record<string, unknown> = {};
  if (status) where.status = status as TicketStatus;
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { subject: { contains: search, mode: "insensitive" } },
    ];
  }

  const tickets = await prisma.ticket.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "ID",
    "First Name",
    "Last Name",
    "Email",
    "Subject",
    "Status",
    "Created At",
    "Updated At",
    "Responded At",
  ];

  const rows = tickets.map((t) => [
    t.id,
    t.firstName,
    t.lastName,
    t.email,
    t.subject,
    t.status,
    t.createdAt.toISOString(),
    t.updatedAt.toISOString(),
    t.respondedAt?.toISOString() ?? "",
  ]);

  const csv = generateCSV(headers, rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="tickets-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
