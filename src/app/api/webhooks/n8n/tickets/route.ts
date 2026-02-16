import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { inboundTicketSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-webhook-secret");
  if (!secret || secret !== process.env.N8N_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = inboundTicketSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { attachments, ...ticketData } = parsed.data;

  const ticket = await prisma.ticket.create({
    data: {
      ...ticketData,
      status:
        ticketData.aiDraftResponse || ticketData.aiDraftSubject
          ? "pending_review"
          : "new",
      ...(attachments && attachments.length > 0
        ? { attachments: { create: attachments } }
        : {}),
    },
  });

  return NextResponse.json(
    { id: ticket.id, status: ticket.status },
    { status: 201 }
  );
}
