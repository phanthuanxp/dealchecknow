import type { Metadata } from "next";

import { getPublicSiteSettings } from "@/lib/site-settings";

type OpenGraphType = "website" | "article";

export type SeoContext = {
  siteUrl: string;
  siteName: string;
  hotline: string;
  email: string;
  zaloNumber: string;
  serviceArea: string[];
};

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  openGraphType?: OpenGraphType;
  imageUrl?: string;
  noIndex?: boolean;
};

type ArticleMetadataInput = {
  title: string;
  description: string;
  path: string;
  publishedTime?: string | null;
  modifiedTime?: string | null;
  category?: string;
  imageUrl?: string;
};

export type BreadcrumbItem = {
  name: string;
  path: string;
};

const FALLBACK_SITE_URL = "https://taxininhbinh.com";
const FALLBACK_SITE_NAME = "Taxi Ninh Bình";
const FALLBACK_EMAIL = "info@taxininhbinh.com";
const FALLBACK_HOTLINE = "0345076789";
const DEFAULT_OG_IMAGE = "/opengraph-image.png";

const DEFAULT_SERVICE_AREAS = [
  "Ninh Bình",
  "Tam Cốc",
  "Tràng An",
  "Bái Đính",
  "Hoa Lư",
  "Hà Nội",
  "Sân bay Nội Bài"
];

function normalizeSiteUrl(raw: string | undefined | null) {
  if (!raw) {
    return FALLBACK_SITE_URL;
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return FALLBACK_SITE_URL;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    return url.toString().replace(/\/$/, "");
  } catch {
    return FALLBACK_SITE_URL;
  }
}

function normalizePath(path: string) {
  const trimmed = path.trim();
  if (!trimmed || trimmed === "/") {
    return "/";
  }
  return `/${trimmed.replace(/^\/+/, "").replace(/\/+$/, "")}`;
}

function toAbsoluteUrl(siteUrl: string, path: string) {
  const normalizedPath = normalizePath(path);
  return normalizedPath === "/" ? siteUrl : `${siteUrl}${normalizedPath}`;
}

function sanitizePhone(raw: string) {
  const cleaned = raw.replace(/[^\d+]/g, "");
  return cleaned || FALLBACK_HOTLINE;
}

export function getBaseSiteUrl() {
  return normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
}

export async function getSeoContext(): Promise<SeoContext> {
  const settings = await getPublicSiteSettings();
  const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || settings.siteUrl);

  return {
    siteUrl,
    siteName: settings.siteName || FALLBACK_SITE_NAME,
    hotline: sanitizePhone(settings.hotlineValue || FALLBACK_HOTLINE),
    email: settings.email || FALLBACK_EMAIL,
    zaloNumber: sanitizePhone(settings.zaloNumber || settings.hotlineValue || FALLBACK_HOTLINE),
    serviceArea: DEFAULT_SERVICE_AREAS
  };
}

export async function createPageMetadata(input: PageMetadataInput): Promise<Metadata> {
  const seo = await getSeoContext();
  const canonical = toAbsoluteUrl(seo.siteUrl, input.path);
  const imageUrl = input.imageUrl ? toAbsoluteUrl(seo.siteUrl, input.imageUrl) : toAbsoluteUrl(seo.siteUrl, DEFAULT_OG_IMAGE);

  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: {
      canonical
    },
    openGraph: {
      type: input.openGraphType ?? "website",
      url: canonical,
      title: input.title,
      description: input.description,
      siteName: seo.siteName,
      locale: "vi_VN",
      images: [{ url: imageUrl }]
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [imageUrl]
    },
    robots: input.noIndex
      ? {
          index: false,
          follow: false
        }
      : undefined
  };
}

export async function createArticleMetadata(input: ArticleMetadataInput): Promise<Metadata> {
  const seo = await getSeoContext();
  const canonical = toAbsoluteUrl(seo.siteUrl, input.path);
  const imageUrl = input.imageUrl ? toAbsoluteUrl(seo.siteUrl, input.imageUrl) : toAbsoluteUrl(seo.siteUrl, DEFAULT_OG_IMAGE);

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical
    },
    openGraph: {
      type: "article",
      url: canonical,
      title: input.title,
      description: input.description,
      siteName: seo.siteName,
      locale: "vi_VN",
      publishedTime: input.publishedTime ?? undefined,
      modifiedTime: input.modifiedTime ?? input.publishedTime ?? undefined,
      section: input.category ?? undefined,
      images: [{ url: imageUrl }]
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [imageUrl]
    }
  };
}

export function createOrganizationSchema(seo: SeoContext) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${seo.siteUrl}#organization`,
    name: seo.siteName,
    url: seo.siteUrl,
    email: seo.email,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: `+84${seo.hotline.replace(/^\+?84/, "").replace(/^0/, "")}`,
        contactType: "customer service",
        areaServed: "VN",
        availableLanguage: ["vi"]
      }
    ]
  };
}

export function createTaxiServiceSchema(seo: SeoContext) {
  return {
    "@context": "https://schema.org",
    "@type": "TaxiService",
    "@id": `${seo.siteUrl}#taxi-service`,
    name: seo.siteName,
    url: seo.siteUrl,
    telephone: seo.hotline,
    email: seo.email,
    areaServed: seo.serviceArea,
    serviceType: [
      "Taxi nội tỉnh Ninh Bình",
      "Taxi Ninh Bình đi Hà Nội",
      "Taxi Ninh Bình đi sân bay Nội Bài",
      "Thuê xe du lịch Ninh Bình"
    ],
    provider: {
      "@id": `${seo.siteUrl}#organization`
    }
  };
}

export function createWebSiteSchema(seo: SeoContext) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${seo.siteUrl}#website`,
    url: seo.siteUrl,
    name: seo.siteName,
    publisher: {
      "@id": `${seo.siteUrl}#organization`
    }
  };
}

export function createFaqPageSchema(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}

export function createBreadcrumbSchema(siteUrl: string, items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(siteUrl, item.path)
    }))
  };
}

export function createArticleSchema(input: {
  siteUrl: string;
  siteName: string;
  title: string;
  description: string;
  path: string;
  publishedTime: string;
  modifiedTime?: string;
  category?: string;
  imageUrl?: string | null;
}) {
  const canonical = toAbsoluteUrl(input.siteUrl, input.path);
  const imageUrl = input.imageUrl
    ? toAbsoluteUrl(input.siteUrl, input.imageUrl)
    : toAbsoluteUrl(input.siteUrl, DEFAULT_OG_IMAGE);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    datePublished: input.publishedTime,
    dateModified: input.modifiedTime ?? input.publishedTime,
    mainEntityOfPage: canonical,
    articleSection: input.category,
    author: {
      "@type": "Organization",
      name: input.siteName
    },
    publisher: {
      "@type": "Organization",
      "@id": `${input.siteUrl}#organization`,
      name: input.siteName,
      url: input.siteUrl
    },
    image: imageUrl
  };
}
