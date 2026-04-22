import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";
import { ROUTE_LANDINGS } from "@/lib/route-landings";
import { resolveTenantForCurrentRequest, whereByTenantId } from "@/lib/tenant";

export type ServicePricingRow = {
  vehicle: string;
  price: string;
  note: string;
};

export type ServiceFaqRow = {
  question: string;
  answer: string;
};

export type PublicServicePage = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  heroTitle: string;
  heroDescription: string;
  featuredImage: string | null;
  mainContent: string;
  contentBlocks: Prisma.JsonValue | null;
  pricingTable: ServicePricingRow[];
  faqItems: ServiceFaqRow[];
  routeBenefits: string[];
  pickupLocations: string[];
  dropoffLocations: string[];
  trustHighlights: string[];
  relatedServiceSlugs: string[];
  legacySlugs: string[];
  sortOrder: number;
  isPublished: boolean;
  canonicalUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ServiceListItem = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  featuredImage: string | null;
  sortOrder: number;
  isPublished: boolean;
  keyword: string;
  href: string;
  canonicalPath: string;
  updatedAt: Date;
};

let serviceTableReadyPromise: Promise<boolean> | null = null;

function asRecord(value: Prisma.JsonValue | null | undefined): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

function toPricingRows(value: Prisma.JsonValue | null | undefined): ServicePricingRow[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const record = asRecord(item as Prisma.JsonValue);
      const vehicle = typeof record?.vehicle === "string" ? record.vehicle.trim() : "";
      const price = typeof record?.price === "string" ? record.price.trim() : "";
      const note = typeof record?.note === "string" ? record.note.trim() : "";

      if (!vehicle || !price) {
        return null;
      }

      return {
        vehicle,
        price,
        note
      };
    })
    .filter((item): item is ServicePricingRow => Boolean(item));
}

function toFaqRows(value: Prisma.JsonValue | null | undefined): ServiceFaqRow[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const record = asRecord(item as Prisma.JsonValue);
      const question = typeof record?.question === "string" ? record.question.trim() : "";
      const answer = typeof record?.answer === "string" ? record.answer.trim() : "";

      if (!question || !answer) {
        return null;
      }

      return {
        question,
        answer
      };
    })
    .filter((item): item is ServiceFaqRow => Boolean(item));
}

function normalizeCanonicalUrl(raw: string | null | undefined, slug: string) {
  if (!raw || !raw.trim()) {
    return null;
  }

  const value = raw.trim();

  if (value.startsWith("/")) {
    return value;
  }

  try {
    const parsed = new URL(value);
    return parsed.toString();
  } catch {
    return `/${slug}`;
  }
}

function getFallbackServices(): PublicServicePage[] {
  return ROUTE_LANDINGS.map((item, index) => ({
    id: `fallback-${item.slug}`,
    title: item.h1,
    slug: item.slug,
    shortDescription: item.intro,
    metaTitle: item.pageTitle,
    metaDescription: item.metaDescription,
    h1: item.h1,
    heroTitle: item.h1,
    heroDescription: item.intro,
    featuredImage: null,
    mainContent: item.longFormSections.map((section) => `${section.heading}\n${section.body}`).join("\n\n"),
    contentBlocks: null,
    pricingTable: item.pricing.map((row) => ({
      vehicle: row.vehicle,
      price: row.price,
      note: row.note
    })),
    faqItems: item.faqs.map((row) => ({
      question: row.question,
      answer: row.answer
    })),
    routeBenefits: item.trustHighlights,
    pickupLocations: item.pickupPoints,
    dropoffLocations: item.dropoffPoints,
    trustHighlights: item.trustHighlights,
    relatedServiceSlugs: ROUTE_LANDINGS.filter((route) => route.slug !== item.slug).map((route) => route.slug),
    legacySlugs: [],
    sortOrder: index + 1,
    isPublished: true,
    canonicalUrl: null,
    createdAt: new Date(0),
    updatedAt: new Date(0)
  }));
}

async function hasServicePageTable() {
  if (!process.env.DATABASE_URL) {
    return false;
  }

  if (!serviceTableReadyPromise) {
    serviceTableReadyPromise = prisma
      .$queryRaw<Array<{ table_exists: boolean }>>`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name = 'ServicePage'
        ) AS table_exists
      `
      .then((rows) => Boolean(rows[0]?.table_exists))
      .catch(() => false);
  }

  return serviceTableReadyPromise;
}

function mapServiceRecordToPublic(record: {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  metaTitle: string | null;
  metaDescription: string | null;
  h1: string | null;
  heroTitle: string | null;
  heroDescription: string | null;
  featuredImage: string | null;
  mainContent: string | null;
  contentBlocks: Prisma.JsonValue | null;
  pricingTable: Prisma.JsonValue | null;
  faqItems: Prisma.JsonValue | null;
  routeBenefits: string[];
  pickupLocations: string[];
  dropoffLocations: string[];
  trustHighlights: string[];
  relatedServiceSlugs: string[];
  legacySlugs: string[];
  sortOrder: number;
  isPublished: boolean;
  canonicalUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}): PublicServicePage {
  return {
    id: record.id,
    title: record.title,
    slug: record.slug,
    shortDescription: record.shortDescription,
    metaTitle: record.metaTitle?.trim() || record.title,
    metaDescription: record.metaDescription?.trim() || record.shortDescription,
    h1: record.h1?.trim() || record.title,
    heroTitle: record.heroTitle?.trim() || record.h1?.trim() || record.title,
    heroDescription: record.heroDescription?.trim() || record.shortDescription,
    featuredImage: record.featuredImage?.trim() || null,
    mainContent: record.mainContent?.trim() || record.shortDescription,
    contentBlocks: record.contentBlocks,
    pricingTable: toPricingRows(record.pricingTable),
    faqItems: toFaqRows(record.faqItems),
    routeBenefits: toStringArray(record.routeBenefits),
    pickupLocations: toStringArray(record.pickupLocations),
    dropoffLocations: toStringArray(record.dropoffLocations),
    trustHighlights: toStringArray(record.trustHighlights),
    relatedServiceSlugs: toStringArray(record.relatedServiceSlugs),
    legacySlugs: toStringArray(record.legacySlugs),
    sortOrder: record.sortOrder,
    isPublished: record.isPublished,
    canonicalUrl: normalizeCanonicalUrl(record.canonicalUrl, record.slug),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
}

export function resolveServiceCanonicalPath(service: Pick<PublicServicePage, "slug" | "canonicalUrl">) {
  if (!service.canonicalUrl) {
    return `/${service.slug}`;
  }

  if (service.canonicalUrl.startsWith("/")) {
    return service.canonicalUrl;
  }

  try {
    const parsed = new URL(service.canonicalUrl);
    return parsed.pathname || `/${service.slug}`;
  } catch {
    return `/${service.slug}`;
  }
}

function toListItem(service: PublicServicePage): ServiceListItem {
  const canonicalPath = resolveServiceCanonicalPath(service);

  return {
    id: service.id,
    slug: service.slug,
    title: service.title,
    shortDescription: service.shortDescription,
    featuredImage: service.featuredImage,
    sortOrder: service.sortOrder,
    isPublished: service.isPublished,
    keyword: service.slug.replace(/-/g, " "),
    href: canonicalPath,
    canonicalPath,
    updatedAt: service.updatedAt
  };
}

async function getDbServices(options: { publishedOnly: boolean; tenantId: string | null }) {
  let records = await prisma.servicePage.findMany({
    where: {
      ...whereByTenantId(options.tenantId),
      ...(options.publishedOnly ? { isPublished: true } : {})
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
  });

  if (options.tenantId && records.length === 0) {
    records = await prisma.servicePage.findMany({
      where: {
        tenantId: null,
        ...(options.publishedOnly ? { isPublished: true } : {})
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
    });
  }

  return records.map(mapServiceRecordToPublic);
}

export async function getPublishedServices(): Promise<PublicServicePage[]> {
  const fallback = getFallbackServices();

  if (!(await hasServicePageTable())) {
    return fallback;
  }

  try {
    const tenant = await resolveTenantForCurrentRequest();
    const rows = await getDbServices({ publishedOnly: true, tenantId: tenant?.id ?? null });
    if (rows.length === 0) {
      return fallback;
    }
    return rows;
  } catch {
    return fallback;
  }
}

export async function getAllServices(): Promise<PublicServicePage[]> {
  const fallback = getFallbackServices();

  if (!(await hasServicePageTable())) {
    return fallback;
  }

  try {
    const tenant = await resolveTenantForCurrentRequest();
    const rows = await getDbServices({ publishedOnly: false, tenantId: tenant?.id ?? null });
    if (rows.length === 0) {
      return fallback;
    }
    return rows;
  } catch {
    return fallback;
  }
}

export async function getPublishedServiceBySlug(slug: string): Promise<PublicServicePage | null> {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) {
    return null;
  }

  if (!(await hasServicePageTable())) {
    return getFallbackServices().find((service) => service.slug === normalizedSlug) ?? null;
  }

  try {
    const tenant = await resolveTenantForCurrentRequest();
    const tenantId = tenant?.id ?? null;

    let record = await prisma.servicePage.findFirst({
      where: {
        ...whereByTenantId(tenantId),
        isPublished: true,
        OR: [{ slug: normalizedSlug }, { legacySlugs: { has: normalizedSlug } }]
      }
    });

    if (!record && tenantId) {
      record = await prisma.servicePage.findFirst({
        where: {
          tenantId: null,
          isPublished: true,
          OR: [{ slug: normalizedSlug }, { legacySlugs: { has: normalizedSlug } }]
        }
      });
    }

    if (!record) {
      return getFallbackServices().find((service) => service.slug === normalizedSlug) ?? null;
    }

    return mapServiceRecordToPublic(record);
  } catch {
    return getFallbackServices().find((service) => service.slug === normalizedSlug) ?? null;
  }
}

export async function getServiceById(id: string): Promise<PublicServicePage | null> {
  if (!(await hasServicePageTable())) {
    return getFallbackServices().find((service) => service.id === id) ?? null;
  }

  try {
    const tenant = await resolveTenantForCurrentRequest();
    const tenantId = tenant?.id ?? null;

    let record = await prisma.servicePage.findFirst({
      where: {
        id,
        ...whereByTenantId(tenantId)
      }
    });

    if (!record && tenantId) {
      record = await prisma.servicePage.findFirst({
        where: {
          id,
          tenantId: null
        }
      });
    }

    if (!record) {
      return null;
    }

    return mapServiceRecordToPublic(record);
  } catch {
    return null;
  }
}

export async function getServiceListings(options?: { includeDraft?: boolean }): Promise<ServiceListItem[]> {
  const services = options?.includeDraft ? await getAllServices() : await getPublishedServices();

  return services
    .filter((service) => (options?.includeDraft ? true : service.isPublished))
    .map(toListItem)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getServiceSlugsForSitemap(): Promise<Array<{ slug: string; updatedAt: Date }>> {
  if (!(await hasServicePageTable())) {
    return getFallbackServices().map((service) => ({
      slug: service.slug,
      updatedAt: service.updatedAt
    }));
  }

  try {
    const tenant = await resolveTenantForCurrentRequest();
    const tenantId = tenant?.id ?? null;

    let rows = await prisma.servicePage.findMany({
      where: {
        ...whereByTenantId(tenantId),
        isPublished: true
      },
      select: {
        slug: true,
        updatedAt: true
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
    });

    if (tenantId && rows.length === 0) {
      rows = await prisma.servicePage.findMany({
        where: { tenantId: null, isPublished: true },
        select: {
          slug: true,
          updatedAt: true
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
      });
    }

    if (rows.length === 0) {
      return getFallbackServices().map((service) => ({
        slug: service.slug,
        updatedAt: service.updatedAt
      }));
    }

    return rows;
  } catch {
    return getFallbackServices().map((service) => ({
      slug: service.slug,
      updatedAt: service.updatedAt
    }));
  }
}

export async function getServicePathsForSitemap(): Promise<Array<{ path: string; updatedAt: Date }>> {
  const services = await getPublishedServices();
  const dedup = new Map<string, Date>();

  for (const service of services) {
    const path = resolveServiceCanonicalPath(service);
    if (!path.startsWith("/")) {
      continue;
    }

    const existing = dedup.get(path);
    if (!existing || existing.getTime() < service.updatedAt.getTime()) {
      dedup.set(path, service.updatedAt);
    }
  }

  return [...dedup.entries()]
    .map(([path, updatedAt]) => ({ path, updatedAt }))
    .sort((a, b) => a.path.localeCompare(b.path));
}

export function createServiceSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}
