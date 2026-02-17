"use server";

import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTwoFactorToken } from "@/lib/two-factor";
import { sendTwoFactorCode } from "@/lib/email";
import { AuthError } from "next-auth";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    // Check if user has 2FA before signing in
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true, twoFactorEnabled: true },
    });

    if (!user) {
      return { error: "Invalid email or password" };
    }

    // If 2FA enabled, send code and signal client to redirect
    if (user.twoFactorEnabled) {
      // Verify credentials first
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      const code = await createTwoFactorToken(user.id);
      await sendTwoFactorCode(email, code);
      return { twoFactorRequired: true };
    }

    // For non-2FA users, let NextAuth handle the redirect
    const redirectUrl = user.role === "admin" || user.role === "ceo" ? "/" : "/contact-us";
    await signIn("credentials", {
      email,
      password,
      redirectTo: redirectUrl,
    });

    // This line won't be reached if signIn succeeds (it redirects)
    return { success: true, redirect: redirectUrl };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    return { error: "An unexpected error occurred" };
  }
}
