import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_TENANT_SLUG = process.env.DEFAULT_TENANT_SLUG?.trim() || process.env.TENANT_SLUG?.trim() || "taxininhbinh";
const DEFAULT_TENANT_NAME = process.env.DEFAULT_TENANT_NAME?.trim() || "Taxi Ninh Binh";

function normalizeDomain(raw: string) {
  return raw
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "")
    .toLowerCase();
}

function parseDomains(): string[] {
  const fromEnv = (process.env.BACKFILL_TENANT_DOMAINS || "")
    .split(",")
    .map((item) => normalizeDomain(item))
    .filter(Boolean);

  const fromSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? (() => {
        try {
          const url = new URL(process.env.NEXT_PUBLIC_SITE_URL);
          return [normalizeDomain(url.host)];
        } catch {
          return [];
        }
      })()
    : [];

  const fallback = ["taxininhbinh.com", "www.taxininhbinh.com"];

  return [...new Set([...fromEnv, ...fromSiteUrl, ...fallback])];
}

async function main() {
  const domains = parseDomains();

  const tenant = await prisma.tenant.upsert({
    where: { slug: DEFAULT_TENANT_SLUG },
    update: {
      name: DEFAULT_TENANT_NAME,
      isActive: true
    },
    create: {
      slug: DEFAULT_TENANT_SLUG,
      name: DEFAULT_TENANT_NAME,
      isActive: true
    }
  });

  for (const [index, domain] of domains.entries()) {
    await prisma.tenantDomain.upsert({
      where: { domain },
      update: {
        tenantId: tenant.id,
        isActive: true,
        isPrimary: index === 0
      },
      create: {
        tenantId: tenant.id,
        domain,
        isPrimary: index === 0,
        isActive: true
      }
    });
  }

  const result = {
    user: await prisma.user.updateMany({
      where: { tenantId: null },
      data: { tenantId: tenant.id }
    }),
    siteSection: await prisma.siteSection.updateMany({
      where: { tenantId: null },
      data: { tenantId: tenant.id }
    }),
    pageBlock: await prisma.pageBlock.updateMany({
      where: { tenantId: null },
      data: { tenantId: tenant.id }
    }),
    blogCategory: await prisma.blogCategory.updateMany({
      where: { tenantId: null },
      data: { tenantId: tenant.id }
    }),
    blogPost: await prisma.blogPost.updateMany({
      where: { tenantId: null },
      data: { tenantId: tenant.id }
    }),
    faq: await prisma.faq.updateMany({
      where: { tenantId: null },
      data: { tenantId: tenant.id }
    }),
    testimonial: await prisma.testimonial.updateMany({
      where: { tenantId: null },
      data: { tenantId: tenant.id }
    }),
    pricingItem: await prisma.pricingItem.updateMany({
      where: { tenantId: null },
      data: { tenantId: tenant.id }
    }),
    quoteRequest: await prisma.quoteRequest.updateMany({
      where: { tenantId: null },
      data: { tenantId: tenant.id }
    }),
    contactMessage: await prisma.contactMessage.updateMany({
      where: { tenantId: null },
      data: { tenantId: tenant.id }
    }),
    siteSetting: await prisma.siteSetting.updateMany({
      where: { tenantId: null },
      data: { tenantId: tenant.id }
    }),
    mediaAsset: await prisma.mediaAsset.updateMany({
      where: { tenantId: null },
      data: { tenantId: tenant.id }
    }),
    servicePage: await prisma.servicePage.updateMany({
      where: { tenantId: null },
      data: { tenantId: tenant.id }
    })
  };

  console.log("Tenant backfill completed");
  console.log(
    JSON.stringify(
      {
        tenant: {
          id: tenant.id,
          slug: tenant.slug,
          name: tenant.name
        },
        domains,
        updated: Object.fromEntries(
          Object.entries(result).map(([key, value]) => [key, value.count])
        )
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error("Tenant backfill failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
