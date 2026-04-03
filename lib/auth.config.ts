import type { NextAuthConfig } from "next-auth";

const authConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [],
  pages: {
    signIn: "/admin/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7
  },
  callbacks: {
    authorized({ auth, request }) {
      const pathname = request.nextUrl.pathname;
      const isAdminPath = pathname.startsWith("/admin");
      const isLoginPath = pathname.startsWith("/admin/login");

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
