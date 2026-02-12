import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { createTwoFactorToken } from "@/lib/two-factor";
import { sendTwoFactorCode } from "@/lib/email";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: token.id as string },
    select: { email: true, twoFactorEnabled: true },
  });

  if (!user || !user.twoFactorEnabled) {
    return NextResponse.json({ error: "2FA not enabled" }, { status: 400 });
  }

  const code = await createTwoFactorToken(token.id as string);
  await sendTwoFactorCode(user.email, code);

  return NextResponse.json({ sent: true });
}
