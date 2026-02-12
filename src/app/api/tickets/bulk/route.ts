import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bulkSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one ticket ID is required"),
  action: z.enum(["archive"]),
});

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const parsed = bulkSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { ids, action } = parsed.data;

  if (action === "archive") {
    // Only archive tickets that are in a valid state to be archived
    const result = await prisma.ticket.updateMany({
      where: {
        id: { in: ids },
        status: { in: ["new", "sent"] },
      },
      data: { status: "archived" },
    });

    return NextResponse.json({ updated: result.count });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
