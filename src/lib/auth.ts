import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.hashedPassword);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          twoFactorEnabled: user.twoFactorEnabled,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.twoFactorEnabled = user.twoFactorEnabled ?? false;
        // On initial sign-in, 2FA is not yet verified
        token.twoFactorVerified = user.twoFactorEnabled ? false : true;
      }

      // Handle session.update() calls
      if (trigger === "update" && session) {
        if (session.twoFactorVerified !== undefined) {
          token.twoFactorVerified = session.twoFactorVerified;
        }
        if (session.twoFactorEnabled !== undefined) {
          token.twoFactorEnabled = session.twoFactorEnabled;
          // If disabling 2FA, ensure verified stays true
          if (!session.twoFactorEnabled) {
            token.twoFactorVerified = true;
          }
        }
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.twoFactorEnabled = token.twoFactorEnabled ?? false;
        session.user.twoFactorVerified = token.twoFactorVerified ?? true;
      }
      return session;
    },
  },
});
