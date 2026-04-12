import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";
import { resolveTenantForCurrentRequest, whereByTenantId } from "@/lib/tenant";

export type PublicSiteSettings = {
  siteName: string;
  siteDomain: string;
  siteUrl: string;
  tagline: string;
  hotlineValue: string;
  hotlineDisplay: string;
  hotlineTel: string;
  email: string;
  zaloNumber: string;
  zaloUrl: string;
  servicePricingImageUrl: string;
  servicePricingImageAlt: string;
};

const fallbackSettings: PublicSiteSettings = {
  siteName: "Taxi Ninh Bình",
  siteDomain: "taxininhbinh.com",
  siteUrl: "https://taxininhbinh.com",
  tagline: "Taxi & xe du lịch an toàn, đúng giờ",
  hotlineValue: "0345076789",
  hotlineDisplay: "0345 07 6789",
  hotlineTel: "tel:0345076789",
  email: "info@taxininhbinh.com",
  zaloNumber: "0345076789",
  zaloUrl: "https://zalo.me/0345076789",
  servicePricingImageUrl: "/images/services/service-ha-noi.webp",
  servicePricingImageAlt: "Xe taxi Ninh Binh phuc vu chuyen tuyen an toan"
};

function asRecord(value: Prisma.JsonValue | null | undefined): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function getString(record: Record<string, unknown> | null, key: string): string | undefined {
  const raw = record?.[key];
  if (typeof raw !== "string") {
    return undefined;
  }

  const value = raw.trim();
  return value.length > 0 ? value : undefined;
}

function normalizePhone(value: string) {
  return value.replace(/[\s().-]+/g, "");
}

function normalizeDomain(value: string) {
  return value
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "")
    .toLowerCase();
}

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  if (!process.env.DATABASE_URL) {
    return fallbackSettings;
  }

  try {
    const tenant = await resolveTenantForCurrentRequest();
    const settingKeys = [
      "site_name",
      "site_domain",
      "site_tagline",
      "hotline",
      "contact_email",
      "zalo_hotline",
      "service_pricing_image"
    ];

    let rows = await prisma.siteSetting.findMany({
      where: {
        ...whereByTenantId(tenant?.id ?? null),
        key: { in: settingKeys }
      }
    });

    if (tenant?.id && rows.length === 0) {
      rows = await prisma.siteSetting.findMany({
        where: {
          tenantId: null,
          key: { in: settingKeys }
        }
      });
    }

    const map = new Map(rows.map((row) => [row.key, row]));
    const siteName =
      getString(asRecord(map.get("site_name")?.value), "text") ??
      getString(asRecord(map.get("site_name")?.value), "value") ??
      fallbackSettings.siteName;
    const domainValue =
      getString(asRecord(map.get("site_domain")?.value), "value") ??
      getString(asRecord(map.get("site_domain")?.value), "text") ??
      fallbackSettings.siteDomain;
    const siteDomain = normalizeDomain(domainValue);
    const siteUrl = `https://${siteDomain}`;
    const tagline =
      getString(asRecord(map.get("site_tagline")?.value), "text") ??
      fallbackSettings.tagline;

    const hotlineRecord = asRecord(map.get("hotline")?.value);
    const hotlineRaw =
      getString(hotlineRecord, "value") ??
      getString(hotlineRecord, "text") ??
      fallbackSettings.hotlineValue;
    const hotlineValue = normalizePhone(hotlineRaw);
    const hotlineDisplay =
      getString(hotlineRecord, "display") ??
      fallbackSettings.hotlineDisplay;
    const hotlineTel = `tel:${hotlineValue}`;

    const email =
      getString(asRecord(map.get("contact_email")?.value), "value") ??
      getString(asRecord(map.get("contact_email")?.value), "text") ??
      fallbackSettings.email;

    const zaloRaw =
      getString(asRecord(map.get("zalo_hotline")?.value), "value") ??
      getString(asRecord(map.get("zalo_hotline")?.value), "text") ??
      hotlineValue;
    const zaloNumber = normalizePhone(zaloRaw);
    const zaloUrl = `https://zalo.me/${zaloNumber}`;
    const servicePricingImageRecord = asRecord(map.get("service_pricing_image")?.value);
    const servicePricingImageUrl =
      getString(servicePricingImageRecord, "url") ??
      getString(servicePricingImageRecord, "value") ??
      fallbackSettings.servicePricingImageUrl;
    const servicePricingImageAlt =
      getString(servicePricingImageRecord, "alt") ??
      fallbackSettings.servicePricingImageAlt;

    return {
      siteName,
      siteDomain,
      siteUrl,
      tagline,
      hotlineValue,
      hotlineDisplay,
      hotlineTel,
      email,
      zaloNumber,
      zaloUrl,
      servicePricingImageUrl,
      servicePricingImageAlt
    };
  } catch {
    return fallbackSettings;
  }
}
