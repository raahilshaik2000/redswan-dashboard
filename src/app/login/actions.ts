"use server";

import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTwoFactorToken } from "@/lib/two-factor";
import { sendTwoFactorCode } from "@/lib/email";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    // Check if user exists and verify credentials manually
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        role: true,
        twoFactorEnabled: true,
        hashedPassword: true
      },
    });

    if (!user) {
      return { error: "Invalid email or password" };
    }

    // Verify password before proceeding
    const validPassword = await bcrypt.compare(password, user.hashedPassword);
    if (!validPassword) {
      return { error: "Invalid email or password" };
    }

    // If 2FA enabled, send code and return (don't sign in yet)
    if (user.twoFactorEnabled) {
      const code = await createTwoFactorToken(user.id);
      await sendTwoFactorCode(email, code);
      return { twoFactorRequired: true };
    }

    // For non-2FA users, let NextAuth handle the full sign-in and redirect
    const redirectUrl = user.role === "admin" || user.role === "ceo" ? "/" : "/contact-us";
    await signIn("credentials", {
      email,
      password,
      redirectTo: redirectUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    console.error("Login error:", error);
    throw error; // Re-throw to allow NextAuth redirects to complete
  }
}
