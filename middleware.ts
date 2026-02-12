import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic =
    pathname === "/login" ||
    pathname === "/login/verify" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/webhooks");

  if (isPublic) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2FA redirect: if user has 2FA enabled but hasn't verified yet
  if (token.twoFactorEnabled && !token.twoFactorVerified) {
    const verifyUrl = new URL("/login/verify", req.url);
    return NextResponse.redirect(verifyUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
