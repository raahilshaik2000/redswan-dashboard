"use server";

import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTwoFactorToken } from "@/lib/two-factor";
import { sendTwoFactorCode } from "@/lib/email";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

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

    // Sign in with redirect: false to check credentials
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    // If signIn failed, it would have thrown an error
    // If we get here, login was successful

    // If 2FA enabled, send code
    if (user.twoFactorEnabled) {
      const code = await createTwoFactorToken(user.id);
      await sendTwoFactorCode(email, code);
      return { twoFactorRequired: true };
    }

    // For non-2FA users, redirect based on role
    const redirectUrl = user.role === "admin" || user.role === "ceo" ? "/" : "/contact-us";
    redirect(redirectUrl);
  } catch (error) {
    // If it's a redirect error, re-throw it (let it complete the redirect)
    if (error && typeof error === "object" && "digest" in error &&
        typeof error.digest === "string" && error.digest.startsWith("NEXT_REDIRECT")) {
      throw error;
    }

    if (error instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    console.error("Login error:", error);
    return { error: "An unexpected error occurred" };
  }
}
