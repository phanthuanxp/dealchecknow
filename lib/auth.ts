import { compare } from "bcryptjs";
import { UserRole } from "@prisma/client";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import authConfig from "@/lib/auth.config";
import prisma from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100)
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Admin login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        const parsedCredentials = credentialsSchema.safeParse(credentials);
        if (!parsedCredentials.success) {
          return null;
        }

        if (!process.env.DATABASE_URL) {
          return null;
        }

        try {
          const email = parsedCredentials.data.email.toLowerCase().trim();
          const user = await prisma.user.findUnique({
            where: { email }
          });

          if (!user || !user.isActive) {
            return null;
          }

          const passwordMatched = await compare(parsedCredentials.data.password, user.passwordHash);
          if (!passwordMatched) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
            role: user.role,
            tenantId: user.tenantId
          };
        } catch {
          return null;
        }
      }
    })
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = (user as { role?: UserRole }).role ?? UserRole.EDITOR;
        token.tenantId = (user as { tenantId?: string | null }).tenantId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as UserRole | undefined) ?? UserRole.EDITOR;
        session.user.tenantId =
          typeof token.tenantId === "string" && token.tenantId.trim().length > 0
            ? token.tenantId
            : null;
      }
      return session;
    }
  }
});
