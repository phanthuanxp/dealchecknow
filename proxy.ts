import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import authConfig from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

type LoginRateEntry = {
  count: number;
  resetAt: number;
};

const loginRateStore = new Map<string, LoginRateEntry>();
const ADMIN_PATH_PREFIXES = ["/admin", "/admincp"];
const LOGIN_RATE_LIMIT_PATH_PREFIXES = ["/admin/login", "/admincp/login", "/api/auth"];

function parseBooleanEnv(value: string | undefined, defaultValue: boolean) {
  if (!value) {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }
  return defaultValue;
}

function isAdminPath(pathname: string) {
  return ADMIN_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isLoginRateLimitPath(pathname: string) {
  return LOGIN_RATE_LIMIT_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function getClientIpFromHeaders(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  return "";
}

function isLoginRateLimitEnabled() {
  return parseBooleanEnv(process.env.ADMIN_LOGIN_RATE_LIMIT_ENABLED, true);
}

function getLoginRateLimitMaxAttempts() {
  const raw = Number(process.env.ADMIN_LOGIN_RATE_LIMIT_MAX_ATTEMPTS ?? "20");
  if (!Number.isFinite(raw) || raw <= 0) {
    return 20;
  }
  return Math.floor(raw);
}

function getLoginRateLimitWindowSeconds() {
  const raw = Number(process.env.ADMIN_LOGIN_RATE_LIMIT_WINDOW_SECONDS ?? "300");
  if (!Number.isFinite(raw) || raw <= 0) {
    return 300;
  }
  return Math.floor(raw);
}

function shouldApplyAdminNoIndex() {
  return parseBooleanEnv(process.env.ADMIN_NOINDEX_ENABLED, true);
}

function shouldApplyAdminSecurityHeaders() {
  return parseBooleanEnv(process.env.ADMIN_SECURITY_HEADERS_ENABLED, true);
}

function checkLoginRateLimit(request: { nextUrl: { pathname: string }; method: string; headers: Headers }) {
  if (!isLoginRateLimitEnabled()) {
    return null;
  }

  if (request.method.toUpperCase() !== "POST") {
    return null;
  }

  if (!isLoginRateLimitPath(request.nextUrl.pathname)) {
    return null;
  }

  const ip = getClientIpFromHeaders(request.headers);
  if (!ip) {
    return null;
  }

  const now = Date.now();
  const windowMs = getLoginRateLimitWindowSeconds() * 1000;
  const maxAttempts = getLoginRateLimitMaxAttempts();
  const key = `${ip}:${request.nextUrl.pathname}`;

  const existing = loginRateStore.get(key);
  if (!existing || existing.resetAt <= now) {
    loginRateStore.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (existing.count >= maxAttempts) {
    return Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
  }

  existing.count += 1;
  loginRateStore.set(key, existing);
  return null;
}

function applyCmsHeaders(response: NextResponse, pathname: string) {
  const isProtectedPath = isAdminPath(pathname) || isLoginRateLimitPath(pathname);
  if (!isProtectedPath) {
    return;
  }

  if (shouldApplyAdminNoIndex()) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet, noimageindex");
  }

  if (!shouldApplyAdminSecurityHeaders()) {
    return;
  }

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "same-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Cache-Control", "no-store");
}

export default auth((request) => {
  const retryAfterSeconds = checkLoginRateLimit(request);
  if (retryAfterSeconds !== null) {
    return NextResponse.json(
      {
        message: "Too many login attempts. Please try again later."
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds)
        }
      }
    );
  }

  const response = NextResponse.next();
  applyCmsHeaders(response, request.nextUrl.pathname);
  return response;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff|woff2|ttf|eot)$).*)"
  ]
};
