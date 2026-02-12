import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export function generateSixDigitCode(): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  return code;
}

export async function createTwoFactorToken(userId: string) {
  const code = generateSixDigitCode();
  const hashedCode = await bcrypt.hash(code, 10);

  // Invalidate old unused tokens
  await prisma.twoFactorToken.updateMany({
    where: { userId, used: false },
    data: { used: true },
  });

  await prisma.twoFactorToken.create({
    data: {
      userId,
      hashedCode,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    },
  });

  return code;
}

export async function verifyTwoFactorToken(
  userId: string,
  code: string
): Promise<boolean> {
  const token = await prisma.twoFactorToken.findFirst({
    where: {
      userId,
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!token) return false;

  const valid = await bcrypt.compare(code, token.hashedCode);
  if (!valid) return false;

  await prisma.twoFactorToken.update({
    where: { id: token.id },
    data: { used: true },
  });

  return true;
}
