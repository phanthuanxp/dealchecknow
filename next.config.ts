import type { NextConfig } from "next";

const legacyServiceRedirectMap: Record<string, string> = {
  "taxi-ninh-binh-di-ha-noi": "/taxi-ninh-binh-ha-noi",
  "taxi-ninh-binh-di-san-bay-noi-bai": "/taxi-ninh-binh-noi-bai",
  "taxi-ha-noi-di-ninh-binh": "/taxi-ha-noi-ninh-binh",
  "taxi-noi-bai-di-ninh-binh": "/taxi-noi-bai-ninh-binh",
  "taxi-ha-noi-ninh-binh": "/taxi-ha-noi-ninh-binh",
  "taxi-noi-bai-ninh-binh": "/taxi-noi-bai-ninh-binh",
  "taxi-ninh-binh-ha-noi": "/taxi-ninh-binh-ha-noi",
  "taxi-ninh-binh-noi-bai": "/taxi-ninh-binh-noi-bai"
};

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    const legacyServiceRedirects = Object.entries(legacyServiceRedirectMap).map(
      ([legacySlug, destination]) => ({
        source: `/dich-vu/${legacySlug}`,
        destination,
        permanent: true
      })
    );

    return [
      // Admin backward compatibility
      {
        source: "/admin/:path*",
        destination: "/admincp/:path*",
        permanent: false
      },
      {
        source: "/admincp/websites/:path*",
        destination: "/admincp/settings",
        permanent: false
      },
      {
        source: "/admincp/integrations/:path*",
        destination: "/admincp/settings",
        permanent: false
      },

      // SEO-safe permanent redirects for legacy service URLs.
      // Additional legacy slugs are handled in app/(public)/dich-vu/[legacySlug]/page.tsx
      ...legacyServiceRedirects
    ];
  },
  async rewrites() {
    return [
      {
        source: "/admincp/:path*",
        destination: "/admin/:path*"
      }
    ];
  }
};

export default nextConfig;
