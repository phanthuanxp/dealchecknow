import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import authConfig from "@/lib/auth.config";
import { getCmsAdminRedirectUrl } from "@/lib/cms-domain";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const cmsRedirectUrl = getCmsAdminRedirectUrl(request);
  if (cmsRedirectUrl) {
    return NextResponse.redirect(cmsRedirectUrl, 307);
  }
});

export const config = { matcher: ["/admin/:path*", "/admincp/:path*"] };
