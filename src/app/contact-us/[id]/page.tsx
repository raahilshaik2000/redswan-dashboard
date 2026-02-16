import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import { TicketDetailCard } from "@/components/tickets/ticket-detail-card";
import { ResponseEditor } from "@/components/tickets/response-editor";
import { TicketNotes } from "@/components/tickets/ticket-notes";
import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import { CATEGORY_CONFIG } from "@/lib/category-config";
import type { Ticket } from "@/lib/types";

const CATEGORY = "contact_us" as const;
const config = CATEGORY_CONFIG[CATEGORY];

export default async function ContactUsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { attachments: true },
  });
  if (!ticket) notFound();

  const serialized: Ticket = {
    ...ticket,
    respondedAt: ticket.respondedAt?.toISOString() ?? null,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    attachments: ticket.attachments.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main className="mx-auto max-w-7xl px-6 py-6">
        <Link
          href={`/${config.slug}`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {config.label}
        </Link>

        <div className="grid gap-6 lg:grid-cols-2">
          <TicketDetailCard ticket={serialized} category={CATEGORY} />
          <ResponseEditor ticket={serialized} />
        </div>

        <TicketNotes ticketId={id} />
      </main>
    </div>
  );
}
