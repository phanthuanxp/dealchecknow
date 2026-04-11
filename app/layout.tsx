import type { Metadata, Viewport } from "next";
import "./globals.css";

import { getBaseSiteUrl } from "@/lib/seo";

const siteUrl = getBaseSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Taxi Ninh Bình",
    template: "%s | Taxi Ninh Bình"
  },
  description:
    "Dịch vụ taxi và xe du lịch Ninh Bình an toàn, đúng giờ, hỗ trợ 24/7. Hotline 0345 07 6789.",
  keywords: [
    "taxi ninh bình",
    "xe du lịch ninh bình",
    "đặt xe ninh bình",
    "taxininhbinh.com"
  ],
  alternates: {
    canonical: siteUrl
  },
  openGraph: {
    title: "Taxi Ninh Bình",
    description:
      "Dịch vụ taxi và xe du lịch Ninh Bình an toàn, đúng giờ, hỗ trợ 24/7.",
    url: siteUrl,
    siteName: "Taxi Ninh Bình",
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: `${siteUrl}/opengraph-image.svg`
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Taxi Ninh Bình",
    description:
      "Dịch vụ taxi và xe du lịch Ninh Bình an toàn, đúng giờ, hỗ trợ 24/7.",
    images: [`${siteUrl}/opengraph-image.svg`]
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f766e"
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
