"use server";

import { Prisma, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createServiceSlug } from "@/lib/services";
import { resolveTenantIdForSessionUser } from "@/lib/tenant";

type ActionStatus = "idle" | "success" | "error";

export type ServiceActionState = {
  status: ActionStatus;
  message: string;
};

type EditorGuard = { tenantId: string | null } | { error: string };

type ServiceMutationData = {
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
  contentBlocks: Prisma.ServicePageUncheckedCreateInput["contentBlocks"];
  pricingTable: Array<{ vehicle: string; price: string; note: string }>;
  faqItems: Array<{ question: string; answer: string }>;
  routeBenefits: string[];
  pickupLocations: string[];
  dropoffLocations: string[];
  trustHighlights: string[];
  relatedServiceSlugs: string[];
  legacySlugs: string[];
  sortOrder: number;
  isPublished: boolean;
  canonicalUrl: string | null;
};

const baseServiceSchema = z.object({
  title: z.string().trim().min(3, "Tiêu đề phải có ít nhất 3 ký tự.").max(180, "Tiêu đề quá dài."),
  slug: z.string().trim().max(180, "Slug quá dài."),
  shortDescription: z
    .string()
    .trim()
    .min(20, "Mô tả ngắn phải có ít nhất 20 ký tự.")
    .max(1200, "Mô tả ngắn quá dài."),
  metaTitle: z.string().trim().max(180, "Meta title quá dài."),
  metaDescription: z.string().trim().max(320, "Meta description quá dài."),
  h1: z.string().trim().max(180, "H1 quá dài."),
  heroTitle: z.string().trim().max(180, "Hero title quá dài."),
  heroDescription: z.string().trim().max(2000, "Hero description quá dài."),
  featuredImage: z.string().trim().max(500, "URL ảnh quá dài."),
  mainContent: z.string().trim().min(30, "Nội dung chính cần ít nhất 30 ký tự.").max(30000, "Nội dung quá dài."),
  pricingTableText: z.string().trim().max(20000, "Bảng giá quá dài."),
  faqItemsText: z.string().trim().max(30000, "FAQ quá dài."),
  routeBenefitsText: z.string().trim().max(10000, "Danh sách lợi ích quá dài."),
  pickupLocationsText: z.string().trim().max(10000, "Danh sách điểm đón quá dài."),
  dropoffLocationsText: z.string().trim().max(10000, "Danh sách điểm trả quá dài."),
  trustHighlightsText: z.string().trim().max(10000, "Danh sách cam kết quá dài."),
  legacySlugsText: z.string().trim().max(5000, "Danh sách slug cũ quá dài."),
  canonicalUrl: z.string().trim().max(500, "Canonical URL quá dài."),
  sortOrder: z.coerce.number().int().min(-999).max(9999),
  isPublished: z.boolean(),
  relatedServiceSlugs: z.array(z.string().trim().min(1).max(180)).default([])
});

const createServiceSchema = baseServiceSchema;

const updateServiceSchema = baseServiceSchema.extend({
  id: z.string().trim().min(1, "Thiếu ID dịch vụ.")
});

const deleteServiceSchema = z.object({
  id: z.string().trim().min(1, "Thiếu ID dịch vụ.")
});

const INITIAL_SUCCESS: ServiceActionState = {
  status: "success",
  message: "Đã lưu dịch vụ."
};

function failure(message: string): ServiceActionState {
  return { status: "error", message };
}

function splitTextToList(value: string) {
  return value
    .split(/\r?\n|,/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parsePricingTable(value: string) {
  if (!value.trim()) {
    return [] as Array<{ vehicle: string; price: string; note: string }>;
  }

  return value
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [vehicleRaw, priceRaw, noteRaw] = line.split("|").map((item) => item?.trim() ?? "");
      return {
        vehicle: vehicleRaw,
        price: priceRaw,
        note: noteRaw
      };
    })
    .filter((item) => item.vehicle.length > 0 && item.price.length > 0);
}

function parseFaqItems(value: string) {
  if (!value.trim()) {
    return [] as Array<{ question: string; answer: string }>;
  }

  return value
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [questionRaw, answerRaw] = line.split("|").map((item) => item?.trim() ?? "");
      return {
        question: questionRaw,
        answer: answerRaw
      };
    })
    .filter((item) => item.question.length > 0 && item.answer.length > 0);
}

function normalizeMediaUrl(value: string) {
  if (!value) {
    return null;
  }

  if (value.startsWith("/") || /^https?:\/\/.+/i.test(value)) {
    return value;
  }

  return null;
}

function normalizeCanonical(value: string, slug: string) {
  if (!value) {
    return null;
  }

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

async function ensureEditorRole(): Promise<EditorGuard> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." };
  }

  if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.EDITOR) {
    return { error: "Bạn không có quyền thao tác dịch vụ." };
  }

  const tenantId = await resolveTenantIdForSessionUser(session.user);
  return { tenantId };
}

async function resolveUniqueSlug(
  baseSlug: string,
  tenantId: string | null,
  currentId?: string
) {
  let suffix = 0;

  while (suffix < 300) {
    const candidate = suffix === 0 ? baseSlug : `${baseSlug}-${suffix + 1}`.slice(0, 180);
    const existing = await prisma.servicePage.findFirst({
      where: {
        slug: candidate,
        ...(tenantId
          ? {
              OR: [{ tenantId }, { tenantId: null }]
            }
          : {})
      }
    });
    if (!existing || existing.id === currentId) {
      return candidate;
    }
    suffix += 1;
  }

  return `${baseSlug}-${Date.now()}`.slice(0, 180);
}

function revalidateServicePaths(slug: string, legacySlugs: string[], previousSlug?: string | null) {
  revalidatePath("/", "page");
  revalidatePath("/dich-vu", "page");
  revalidatePath("/admincp/services", "page");
  revalidatePath(`/${slug}`, "page");
  revalidatePath("/sitemap.xml");

  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/${previousSlug}`, "page");
  }

  legacySlugs.forEach((legacySlug) => {
    revalidatePath(`/dich-vu/${legacySlug}`, "page");
  });
}

function buildServiceData(
  parsed: z.infer<typeof baseServiceSchema>,
  slug: string
): ServiceMutationData {
  const pricingTable = parsePricingTable(parsed.pricingTableText);
  const faqItems = parseFaqItems(parsed.faqItemsText);
  const featuredImage = normalizeMediaUrl(parsed.featuredImage);

  if (parsed.featuredImage && !featuredImage) {
    throw new Error("URL ảnh đại diện cần bắt đầu bằng http(s):// hoặc /");
  }

  const relatedServiceSlugs = Array.from(
    new Set(
      parsed.relatedServiceSlugs
        .map((item) => createServiceSlug(item))
        .filter(Boolean)
        .filter((item) => item !== slug)
    )
  );

  const legacySlugs = Array.from(
    new Set(
      splitTextToList(parsed.legacySlugsText)
        .map((item) => createServiceSlug(item))
        .filter(Boolean)
        .filter((item) => item !== slug)
    )
  );

  return {
    title: parsed.title,
    slug,
    shortDescription: parsed.shortDescription,
    metaTitle: parsed.metaTitle || null,
    metaDescription: parsed.metaDescription || null,
    h1: parsed.h1 || null,
    heroTitle: parsed.heroTitle || null,
    heroDescription: parsed.heroDescription || null,
    featuredImage,
    mainContent: parsed.mainContent || null,
    contentBlocks: Prisma.JsonNull,
    pricingTable,
    faqItems,
    routeBenefits: splitTextToList(parsed.routeBenefitsText),
    pickupLocations: splitTextToList(parsed.pickupLocationsText),
    dropoffLocations: splitTextToList(parsed.dropoffLocationsText),
    trustHighlights: splitTextToList(parsed.trustHighlightsText),
    relatedServiceSlugs,
    legacySlugs,
    sortOrder: parsed.sortOrder,
    isPublished: parsed.isPublished,
    canonicalUrl: normalizeCanonical(parsed.canonicalUrl, slug)
  };
}

export async function createServiceAction(
  _prev: ServiceActionState,
  formData: FormData
): Promise<ServiceActionState> {
  const guard = await ensureEditorRole();
  if ("error" in guard) {
    return failure(guard.error);
  }

  if (!process.env.DATABASE_URL) {
    return failure("Thiếu DATABASE_URL nên chưa thể lưu dịch vụ.");
  }

  const parsed = createServiceSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    shortDescription: String(formData.get("shortDescription") ?? ""),
    metaTitle: String(formData.get("metaTitle") ?? ""),
    metaDescription: String(formData.get("metaDescription") ?? ""),
    h1: String(formData.get("h1") ?? ""),
    heroTitle: String(formData.get("heroTitle") ?? ""),
    heroDescription: String(formData.get("heroDescription") ?? ""),
    featuredImage: String(formData.get("featuredImage") ?? ""),
    mainContent: String(formData.get("mainContent") ?? ""),
    pricingTableText: String(formData.get("pricingTableText") ?? ""),
    faqItemsText: String(formData.get("faqItemsText") ?? ""),
    routeBenefitsText: String(formData.get("routeBenefitsText") ?? ""),
    pickupLocationsText: String(formData.get("pickupLocationsText") ?? ""),
    dropoffLocationsText: String(formData.get("dropoffLocationsText") ?? ""),
    trustHighlightsText: String(formData.get("trustHighlightsText") ?? ""),
    legacySlugsText: String(formData.get("legacySlugsText") ?? ""),
    canonicalUrl: String(formData.get("canonicalUrl") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? "0"),
    isPublished: formData.get("isPublished") === "on",
    relatedServiceSlugs: formData.getAll("relatedServiceSlugs").map((item) => String(item))
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Dữ liệu dịch vụ không hợp lệ.");
  }

  const generatedSlug = createServiceSlug(parsed.data.slug || parsed.data.title);
  if (!generatedSlug) {
    return failure("Không thể tạo slug hợp lệ. Vui lòng nhập lại tiêu đề.");
  }

  try {
    const slug = await resolveUniqueSlug(generatedSlug, guard.tenantId);
    const serviceData = buildServiceData(parsed.data, slug);

    const created = await prisma.servicePage.create({
      data: {
        ...serviceData,
        tenantId: guard.tenantId
      }
    });

    revalidateServicePaths(created.slug, created.legacySlugs);

    return {
      ...INITIAL_SUCCESS,
      message: "Đã tạo trang dịch vụ mới."
    };
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Không thể tạo trang dịch vụ.");
  }
}

export async function updateServiceAction(
  _prev: ServiceActionState,
  formData: FormData
): Promise<ServiceActionState> {
  const guard = await ensureEditorRole();
  if ("error" in guard) {
    return failure(guard.error);
  }

  if (!process.env.DATABASE_URL) {
    return failure("Thiếu DATABASE_URL nên chưa thể lưu dịch vụ.");
  }

  const parsed = updateServiceSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    shortDescription: String(formData.get("shortDescription") ?? ""),
    metaTitle: String(formData.get("metaTitle") ?? ""),
    metaDescription: String(formData.get("metaDescription") ?? ""),
    h1: String(formData.get("h1") ?? ""),
    heroTitle: String(formData.get("heroTitle") ?? ""),
    heroDescription: String(formData.get("heroDescription") ?? ""),
    featuredImage: String(formData.get("featuredImage") ?? ""),
    mainContent: String(formData.get("mainContent") ?? ""),
    pricingTableText: String(formData.get("pricingTableText") ?? ""),
    faqItemsText: String(formData.get("faqItemsText") ?? ""),
    routeBenefitsText: String(formData.get("routeBenefitsText") ?? ""),
    pickupLocationsText: String(formData.get("pickupLocationsText") ?? ""),
    dropoffLocationsText: String(formData.get("dropoffLocationsText") ?? ""),
    trustHighlightsText: String(formData.get("trustHighlightsText") ?? ""),
    legacySlugsText: String(formData.get("legacySlugsText") ?? ""),
    canonicalUrl: String(formData.get("canonicalUrl") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? "0"),
    isPublished: formData.get("isPublished") === "on",
    relatedServiceSlugs: formData.getAll("relatedServiceSlugs").map((item) => String(item))
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Dữ liệu dịch vụ không hợp lệ.");
  }

  try {
    const existing = await prisma.servicePage.findFirst({
      where: {
        id: parsed.data.id,
        ...(guard.tenantId
          ? {
              OR: [{ tenantId: guard.tenantId }, { tenantId: null }]
            }
          : {})
      }
    });

    if (!existing) {
      return failure("Không tìm thấy dịch vụ cần cập nhật.");
    }

    const generatedSlug = createServiceSlug(parsed.data.slug || parsed.data.title || existing.slug);
    if (!generatedSlug) {
      return failure("Không thể tạo slug hợp lệ. Vui lòng nhập lại tiêu đề.");
    }

    const slug = await resolveUniqueSlug(generatedSlug, guard.tenantId, existing.id);
    const serviceData = buildServiceData(parsed.data, slug);

    const updated = await prisma.servicePage.update({
      where: { id: existing.id },
      data: {
        ...serviceData,
        tenantId: guard.tenantId ?? existing.tenantId ?? null
      }
    });

    revalidateServicePaths(updated.slug, updated.legacySlugs, existing.slug);

    return {
      ...INITIAL_SUCCESS,
      message: "Đã cập nhật trang dịch vụ."
    };
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Không thể cập nhật trang dịch vụ.");
  }
}

export async function deleteServiceAction(
  _prev: ServiceActionState,
  formData: FormData
): Promise<ServiceActionState> {
  const guard = await ensureEditorRole();
  if ("error" in guard) {
    return failure(guard.error);
  }

  if (!process.env.DATABASE_URL) {
    return failure("Thiếu DATABASE_URL nên chưa thể xóa dịch vụ.");
  }

  const parsed = deleteServiceSchema.safeParse({
    id: String(formData.get("id") ?? "")
  });

  if (!parsed.success) {
    return failure("Không xác định được dịch vụ cần xóa.");
  }

  try {
    const existing = await prisma.servicePage.findFirst({
      where: {
        id: parsed.data.id,
        ...(guard.tenantId
          ? {
              OR: [{ tenantId: guard.tenantId }, { tenantId: null }]
            }
          : {})
      }
    });

    if (!existing) {
      return failure("Không tìm thấy dịch vụ cần xóa.");
    }

    await prisma.servicePage.delete({
      where: { id: existing.id }
    });

    revalidateServicePaths(existing.slug, existing.legacySlugs, existing.slug);

    return {
      status: "success",
      message: "Đã xóa trang dịch vụ."
    };
  } catch {
    return failure("Không thể xóa trang dịch vụ.");
  }
}
