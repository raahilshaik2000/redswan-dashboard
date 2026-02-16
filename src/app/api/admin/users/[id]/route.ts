import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { UserRole } from "@/generated/prisma/enums";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { role } = body as { role?: string };

  if (!role || !["admin", "ceo", "employee"].includes(role)) {
    return NextResponse.json(
      { error: "Invalid role. Must be 'admin', 'ceo', or 'employee'" },
      { status: 400 }
    );
  }

  // Prevent self-demotion
  if (id === session.user.id && role !== "admin") {
    return NextResponse.json(
      { error: "You cannot demote yourself" },
      { status: 403 }
    );
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role: role as UserRole },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  return NextResponse.json({ user });
}
