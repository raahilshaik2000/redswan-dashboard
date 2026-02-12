import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      twoFactorEnabled: boolean;
      twoFactorVerified: boolean;
    };
  }

  interface User {
    twoFactorEnabled?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    twoFactorEnabled?: boolean;
    twoFactorVerified?: boolean;
  }
}
