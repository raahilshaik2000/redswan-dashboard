import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ticket = await prisma.ticket.findUnique({ where: { id } });

  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  if (ticket.status !== "pending_review") {
    return NextResponse.json(
      { error: `Cannot approve ticket with status "${ticket.status}". Must be "pending_review".` },
      { status: 422 }
    );
  }

  const subjectToSend = ticket.finalSubject || ticket.aiDraftSubject;
  const bodyToSend = ticket.finalResponse || ticket.aiDraftResponse;
  if (!bodyToSend) {
    return NextResponse.json(
      { error: "No response to send. Edit the response first." },
      { status: 422 }
    );
  }

  // Call n8n webhook to send the email
  const webhookUrl = process.env.N8N_SEND_EMAIL_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json(
      { error: "N8N_SEND_EMAIL_WEBHOOK_URL is not configured" },
      { status: 500 }
    );
  }

  try {
    const n8nResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": process.env.N8N_WEBHOOK_SECRET || "",
      },
      body: JSON.stringify({
        ticketId: ticket.id,
        to: ticket.email,
        firstName: ticket.firstName,
        lastName: ticket.lastName,
        subject: subjectToSend || `Re: ${ticket.subject}`,
        body: bodyToSend,
      }),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      return NextResponse.json(
        { error: "Failed to send via n8n", details: errorText },
        { status: 502 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to reach n8n webhook", details: String(error) },
      { status: 502 }
    );
  }

  const updated = await prisma.ticket.update({
    where: { id },
    data: {
      status: "sent",
      finalSubject: subjectToSend || `Re: ${ticket.subject}`,
      finalResponse: bodyToSend,
      respondedAt: ticket.respondedAt ?? new Date(),
    },
  });

  return NextResponse.json(updated);
}
