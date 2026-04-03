import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/admin/:path*",
        destination: "/admincp/:path*",
        permanent: false
      }
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
