import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { verifyTwoFactorToken } from "@/lib/two-factor";
import { twoFactorVerifySchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = twoFactorVerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid code format" }, { status: 400 });
  }

  const valid = await verifyTwoFactorToken(token.id as string, parsed.data.code);
  if (!valid) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }

  return NextResponse.json({ verified: true });
}
