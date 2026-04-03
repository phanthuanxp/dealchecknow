import type { NextAuthConfig } from "next-auth";

const authSecret = process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim();
const fallbackAuthSecret = "taxininhbinh-change-this-auth-secret-in-vercel-now";

if (!authSecret && process.env.NODE_ENV === "production") {
  console.warn("AUTH_SECRET chưa được cấu hình. Đang dùng fallback secret tạm thời.");
}

const authConfig = {
  secret: authSecret || fallbackAuthSecret,
  trustHost: true,
  providers: [],
  pages: {
    signIn: "/admincp/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7
  },
  callbacks: {
    authorized({ auth, request }) {
      const pathname = request.nextUrl.pathname;
      const isAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/admincp");
      const isLoginPath = pathname.startsWith("/admin/login") || pathname.startsWith("/admincp/login");

      if (!isAdminPath) {
        return true;
      }

      if (isLoginPath) {
        return true;
      }

      return Boolean(auth?.user);
    }
  }
} satisfies NextAuthConfig;

export default authConfig;
