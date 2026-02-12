import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { createTwoFactorToken, verifyTwoFactorToken } from "@/lib/two-factor";
import { sendTwoFactorCode } from "@/lib/email";
import { twoFactorVerifySchema } from "@/lib/validations";

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
    return NextResponse.json({ error: "2FA is not enabled" }, { status: 400 });
  }

  const body = await req.json();

  // Step 1: Send code
  if (body.sendCode) {
    const code = await createTwoFactorToken(token.id as string);
    await sendTwoFactorCode(user.email, code);
    return NextResponse.json({ sent: true });
  }

  // Step 2: Verify code and disable
  const parsed = twoFactorVerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid code format" }, { status: 400 });
  }

  const valid = await verifyTwoFactorToken(token.id as string, parsed.data.code);
  if (!valid) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: token.id as string },
    data: { twoFactorEnabled: false },
  });

  return NextResponse.json({ disabled: true });
}
