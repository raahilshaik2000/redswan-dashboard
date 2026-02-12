import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: token.id as string },
    select: { id: true, email: true, name: true, twoFactorEnabled: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return NextResponse.json({ error: firstError.message }, { status: 400 });
  }

  const { name, currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: token.id as string },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // If changing password, verify current password
  if (newPassword && currentPassword) {
    const valid = await bcrypt.compare(currentPassword, user.hashedPassword);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }
  }

  const updateData: { name: string; hashedPassword?: string } = { name };
  if (newPassword) {
    updateData.hashedPassword = await bcrypt.hash(newPassword, 10);
  }

  await prisma.user.update({
    where: { id: token.id as string },
    data: updateData,
  });

  return NextResponse.json({ success: true });
}
