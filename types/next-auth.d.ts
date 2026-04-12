import { UserRole } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: UserRole;
    tenantId?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      tenantId?: string | null;
    } & Session["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    tenantId?: string | null;
  }
}
