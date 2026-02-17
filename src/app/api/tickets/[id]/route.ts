import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateTicketSchema } from "@/lib/validations";
import { TicketStatus } from "@/generated/prisma/client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ticket = await prisma.ticket.findUnique({ where: { id } });

  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  return NextResponse.json(ticket);
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  new: ["pending_review", "archived"],
  pending_review: ["approved", "new", "archived"],
  approved: ["sent", "pending_review"],
  sent: ["archived"],
  archived: ["new"],
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = updateTicketSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  if (parsed.data.status) {
    const allowed = VALID_TRANSITIONS[ticket.status] || [];
    if (!allowed.includes(parsed.data.status)) {
      return NextResponse.json(
        {
          error: `Cannot transition from "${ticket.status}" to "${parsed.data.status}"`,
        },
        { status: 422 }
      );
    }
  }

  const shouldSetRespondedAt =
    parsed.data.status &&
    (parsed.data.status === "approved" || parsed.data.status === "sent") &&
    !ticket.respondedAt;

  const updated = await prisma.ticket.update({
    where: { id },
    data: {
      ...(parsed.data.finalSubject !== undefined && {
        finalSubject: parsed.data.finalSubject,
      }),
      ...(parsed.data.finalResponse !== undefined && {
        finalResponse: parsed.data.finalResponse,
      }),
      ...(parsed.data.status && {
        status: parsed.data.status as TicketStatus,
      }),
      ...(shouldSetRespondedAt && {
        respondedAt: new Date(),
      }),
    },
  });

  return NextResponse.json(updated);
}
