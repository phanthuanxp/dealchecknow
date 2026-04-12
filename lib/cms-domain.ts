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

function normalizeCmsBaseUrl(raw: string | undefined) {
  if (!raw) {
    return null;
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(withProtocol);
  } catch {
    return null;
  }
}

function normalizeHost(raw: string | null | undefined) {
  if (!raw) {
    return "";
  }

  return raw
    .split(",")[0]
    .trim()
    .toLowerCase();
}

export function isRedirectEnabled() {
  return parseBooleanEnv(process.env.CMS_ADMIN_REDIRECT_ENABLED, false);
}

export function shouldApplyCmsNoindex() {
  return parseBooleanEnv(process.env.CMS_NOINDEX_ENABLED, true);
}

export function shouldApplyCmsSecurityHeaders() {
  return parseBooleanEnv(process.env.CMS_SECURITY_HEADERS_ENABLED, true);
}

export function isCmsLoginRateLimitEnabled() {
  return parseBooleanEnv(process.env.CMS_LOGIN_RATE_LIMIT_ENABLED, true);
}

export function getCmsLoginRateLimitMaxAttempts() {
  const raw = Number(process.env.CMS_LOGIN_RATE_LIMIT_MAX_ATTEMPTS ?? "20");
  if (!Number.isFinite(raw) || raw <= 0) {
    return 20;
  }
  return Math.floor(raw);
}

export function getCmsLoginRateLimitWindowSeconds() {
  const raw = Number(process.env.CMS_LOGIN_RATE_LIMIT_WINDOW_SECONDS ?? "300");
  if (!Number.isFinite(raw) || raw <= 0) {
    return 300;
  }
  return Math.floor(raw);
}

export function isAdminPath(pathname: string) {
  return ADMIN_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isLoginRateLimitPath(pathname: string) {
  return LOGIN_RATE_LIMIT_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function getCmsHost() {
  const cmsBaseUrl = normalizeCmsBaseUrl(process.env.CMS_BASE_URL);
  return cmsBaseUrl ? normalizeHost(cmsBaseUrl.host) : "";
}

export function getRequestHost(request: { headers: Headers }) {
  return normalizeHost(request.headers.get("x-forwarded-host") ?? request.headers.get("host"));
}

export function isCmsRequestHost(request: { headers: Headers }) {
  const requestHost = getRequestHost(request);
  const cmsHost = getCmsHost();
  return Boolean(requestHost && cmsHost && requestHost === cmsHost);
}

function normalizeIp(raw: string | null | undefined) {
  if (!raw) {
    return "";
  }

  const first = raw
    .split(",")[0]
    .trim()
    .replace(/^\[|\]$/g, "");

  if (!first) {
    return "";
  }

  const colonCount = (first.match(/:/g) ?? []).length;
  if (colonCount === 1 && first.includes(".")) {
    return first.split(":")[0].trim();
  }

  return first;
}

export function getClientIpFromHeaders(headers: Headers) {
  const forwardedFor = normalizeIp(headers.get("x-forwarded-for"));
  if (forwardedFor) {
    return forwardedFor;
  }

  const realIp = normalizeIp(headers.get("x-real-ip"));
  if (realIp) {
    return realIp;
  }

  return "";
}

function getAllowedIpSet() {
  const raw = process.env.CMS_ADMIN_ALLOWED_IPS?.trim();
  if (!raw) {
    return null;
  }

  const list = raw
    .split(",")
    .map((item) => normalizeIp(item))
    .filter(Boolean);

  if (list.length === 0) {
    return null;
  }

  return new Set(list);
}

export function isCmsAdminIpAllowed(request: { nextUrl: { pathname: string }; headers: Headers }) {
  if (!isCmsRequestHost(request) || !isAdminPath(request.nextUrl.pathname)) {
    return true;
  }

  const allowedIps = getAllowedIpSet();
  if (!allowedIps) {
    return true;
  }

  const clientIp = getClientIpFromHeaders(request.headers);
  if (!clientIp) {
    return false;
  }

  return allowedIps.has(clientIp);
}

export function getCmsAdminRedirectUrl(request: {
  nextUrl: { pathname: string; search: string };
  headers: Headers;
}) {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  if (!isRedirectEnabled()) {
    return null;
  }

  if (!isAdminPath(request.nextUrl.pathname)) {
    return null;
  }

  const cmsBaseUrl = normalizeCmsBaseUrl(process.env.CMS_BASE_URL);
  if (!cmsBaseUrl) {
    return null;
  }

  const requestHost = getRequestHost(request);
  const cmsHost = normalizeHost(cmsBaseUrl.host);

  if (!requestHost || requestHost === cmsHost) {
    return null;
  }

  return new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, cmsBaseUrl);
}
