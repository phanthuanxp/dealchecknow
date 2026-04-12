const ADMIN_PATH_PREFIXES = ["/admin", "/admincp"];

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

function isAdminPath(pathname: string) {
  return ADMIN_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function getCmsAdminRedirectUrl(request: {
  nextUrl: { pathname: string; search: string };
  headers: Headers;
}) {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  if (!isAdminPath(request.nextUrl.pathname)) {
    return null;
  }

  const cmsBaseUrl = normalizeCmsBaseUrl(process.env.CMS_BASE_URL);
  if (!cmsBaseUrl) {
    return null;
  }

  const requestHost = normalizeHost(request.headers.get("x-forwarded-host") ?? request.headers.get("host"));
  const cmsHost = normalizeHost(cmsBaseUrl.host);

  if (!requestHost || requestHost === cmsHost) {
    return null;
  }

  return new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, cmsBaseUrl);
}
