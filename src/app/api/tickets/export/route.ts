import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TicketStatus, TicketCategory } from "@/generated/prisma/client";
import { generateCSV } from "@/lib/csv";
import { CATEGORY_CONFIG } from "@/lib/category-config";
import type { TicketCategory as TC } from "@/lib/types";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const status = params.get("status");
  const search = params.get("search");
  const category = params.get("category") as TC | null;

  const where: Record<string, unknown> = {};
  if (status) where.status = status as TicketStatus;
  if (category) where.category = category as TicketCategory;
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

  const baseHeaders = [
    "ID",
    "First Name",
    "Last Name",
    "Email",
    "Status",
    "Created At",
    "Updated At",
    "Responded At",
  ];

  const config = category ? CATEGORY_CONFIG[category] : null;
  const extraHeaders = config ? config.extraCsvHeaders : ["Subject", "Location"];
  const extraKeys = config ? config.extraCsvKeys : ["subject", "location"];

  const headers = [...baseHeaders, ...extraHeaders];

  const rows = tickets.map((t) => {
    const base = [
      t.id,
      t.firstName,
      t.lastName,
      t.email,
      t.status,
      t.createdAt.toISOString(),
      t.updatedAt.toISOString(),
      t.respondedAt?.toISOString() ?? "",
    ];
    const extra = extraKeys.map(
      (key) => (t as Record<string, unknown>)[key]?.toString() ?? ""
    );
    return [...base, ...extra];
  });

  const csv = generateCSV(headers, rows);
  const fileName = config
    ? `${config.slug}-${new Date().toISOString().slice(0, 10)}.csv`
    : `tickets-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
