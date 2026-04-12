import { hash } from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

type TenantProvisionItem = {
  slug: string;
  name: string;
  domains: string[];
};

type AdminProvisionItem = {
  email: string;
  fullName: string;
  password: string;
};

const DEFAULT_STAGE1_TENANTS: TenantProvisionItem[] = [
  {
    slug: "taxininhbinh",
    name: "Taxi Ninh Binh",
    domains: ["taxininhbinh.com", "www.taxininhbinh.com"]
  },
  {
    slug: "taxigiabinh",
    name: "Taxi Gia Binh",
    domains: ["taxigiabinh.vn", "www.taxigiabinh.vn"]
  },
  {
    slug: "taxitamdao",
    name: "Taxi Tam Dao",
    domains: ["taxitamdao.com", "www.taxitamdao.com"]
  },
  {
    slug: "taxibacninh",
    name: "Taxi Bac Ninh",
    domains: ["taxibacninh.vn", "www.taxibacninh.vn"]
  }
];

function normalizeDomain(raw: string) {
  return raw
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "")
    .toLowerCase();
}

function parseCmsHost() {
  const raw = process.env.CMS_BASE_URL?.trim();
  if (!raw) {
    return "cms.30nice.vn";
  }

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return normalizeDomain(new URL(withProtocol).host);
  } catch {
    return "cms.30nice.vn";
  }
}

function parseTenantConfig(): TenantProvisionItem[] {
  const raw = process.env.STAGE1_TENANTS_JSON?.trim();
  if (!raw) {
    return DEFAULT_STAGE1_TENANTS;
  }

  try {
    const parsed = JSON.parse(raw) as Array<{
      slug?: string;
      name?: string;
      domains?: string[];
    }>;

    const items = parsed
      .map((item) => ({
        slug: String(item.slug ?? "").trim().toLowerCase(),
        name: String(item.name ?? "").trim(),
        domains: Array.isArray(item.domains)
          ? item.domains.map((domain) => normalizeDomain(String(domain))).filter(Boolean)
          : []
      }))
      .filter((item) => item.slug && item.name && item.domains.length > 0);

    return items.length > 0 ? items : DEFAULT_STAGE1_TENANTS;
  } catch {
    return DEFAULT_STAGE1_TENANTS;
  }
}

function parseAdminUsers(): AdminProvisionItem[] {
  const fromJson = process.env.ADMIN_BOOTSTRAP_USERS?.trim();
  if (fromJson) {
    try {
      const parsed = JSON.parse(fromJson) as Array<{
        email?: string;
        fullName?: string;
        password?: string;
      }>;

      const users = parsed
        .map((item) => ({
          email: String(item.email ?? "").trim().toLowerCase(),
          fullName: String(item.fullName ?? "").trim(),
          password: String(item.password ?? "")
        }))
        .filter((item) => item.email && item.fullName && item.password.length >= 6);

      if (users.length > 0) {
        return users;
      }
    } catch {
      // Ignore invalid JSON and fallback to env keys below.
    }
  }

  const adminTripPassword = process.env.BOOTSTRAP_ADMINTRIP_PASSWORD ?? "";
  const quanLyPassword = process.env.BOOTSTRAP_QUANLYCP_PASSWORD ?? "";

  const users = [
    {
      email: "info@30nice.vn",
      fullName: "Admin Trip",
      password: adminTripPassword
    },
    {
      email: "phamvanthuanjp@gmail.com",
      fullName: "Quan Ly CP",
      password: quanLyPassword
    }
  ].filter((item) => item.password.length >= 6);

  if (users.length !== 2) {
    throw new Error(
      "Thieu mat khau bootstrap admin. Vui long set BOOTSTRAP_ADMINTRIP_PASSWORD va BOOTSTRAP_QUANLYCP_PASSWORD (toi thieu 6 ky tu)."
    );
  }

  return users;
}

async function upsertStage1Tenants() {
  const cmsHost = parseCmsHost();
  const tenants = parseTenantConfig();
  const tenantIdsBySlug = new Map<string, string>();

  for (const tenantInput of tenants) {
    const tenant = await prisma.tenant.upsert({
      where: { slug: tenantInput.slug },
      update: {
        name: tenantInput.name,
        cmsDomain: cmsHost,
        isActive: true
      },
      create: {
        slug: tenantInput.slug,
        name: tenantInput.name,
        cmsDomain: cmsHost,
        isActive: true
      }
    });

    tenantIdsBySlug.set(tenant.slug, tenant.id);

    const normalizedDomains = [...new Set(tenantInput.domains.map((domain) => normalizeDomain(domain)).filter(Boolean))];
    for (const [index, domain] of normalizedDomains.entries()) {
      await prisma.tenantDomain.upsert({
        where: { domain },
        update: {
          tenantId: tenant.id,
          isPrimary: index === 0,
          isActive: true
        },
        create: {
          tenantId: tenant.id,
          domain,
          isPrimary: index === 0,
          isActive: true
        }
      });
    }
  }

  return {
    cmsHost,
    tenantIdsBySlug
  };
}

async function upsertAdminUsers(defaultTenantId: string | undefined) {
  const adminUsers = parseAdminUsers();
  const result: Array<{ email: string; id: string }> = [];

  for (const admin of adminUsers) {
    const passwordHash = await hash(admin.password, 12);
    const user = await prisma.user.upsert({
      where: { email: admin.email },
      update: {
        fullName: admin.fullName,
        passwordHash,
        role: UserRole.ADMIN,
        isActive: true
      },
      create: {
        email: admin.email,
        fullName: admin.fullName,
        passwordHash,
        role: UserRole.ADMIN,
        isActive: true,
        tenantId: defaultTenantId ?? null
      }
    });

    result.push({ email: user.email, id: user.id });
  }

  return result;
}

async function main() {
  const { cmsHost, tenantIdsBySlug } = await upsertStage1Tenants();
  const defaultTenantId = tenantIdsBySlug.get("taxininhbinh");
  const admins = await upsertAdminUsers(defaultTenantId);

  console.log(
    JSON.stringify(
      {
        ok: true,
        cmsHost,
        tenants: Array.from(tenantIdsBySlug.entries()).map(([slug, id]) => ({ slug, id })),
        admins
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error("Stage 1 provision failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
