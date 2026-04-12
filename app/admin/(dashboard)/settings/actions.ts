"use server";

import { Prisma, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { resolveTenantIdForSessionUser, whereByTenantId } from "@/lib/tenant";

type ActionStatus = "idle" | "success" | "error";

export type SettingsActionState = {
  status: ActionStatus;
  message: string;
};

const settingsSchema = z.object({
  siteName: z.string().trim().min(2, "Tên website phải có ít nhất 2 ký tự.").max(120, "Tên website quá dài."),
  siteDomain: z
    .string()
    .trim()
    .min(4, "Tên miền không hợp lệ.")
    .max(120, "Tên miền quá dài.")
    .regex(/^(?:https?:\/\/)?[a-z0-9.-]+\.[a-z]{2,}(?:\/.*)?$/i, "Tên miền không hợp lệ."),
  siteTagline: z.string().trim().min(5, "Khẩu hiệu cần ít nhất 5 ký tự.").max(200, "Khẩu hiệu quá dài."),
  hotlineValue: z
    .string()
    .trim()
    .min(8, "Hotline không hợp lệ.")
    .max(20, "Hotline không hợp lệ.")
    .regex(/^[+0-9().\s-]+$/, "Hotline không hợp lệ."),
  hotlineDisplay: z.string().trim().min(8, "Hiển thị hotline không hợp lệ.").max(30, "Hiển thị hotline quá dài."),
  email: z.string().trim().email("Email không hợp lệ."),
  zaloNumber: z
    .string()
    .trim()
    .min(8, "Số Zalo không hợp lệ.")
    .max(20, "Số Zalo không hợp lệ.")
    .regex(/^[+0-9().\s-]+$/, "Số Zalo không hợp lệ."),
  servicePricingImageUrl: z
    .string()
    .trim()
    .max(500, "URL ảnh quá dài.")
    .refine((value) => value.length === 0 || /^https?:\/\/.+/i.test(value) || value.startsWith("/"), {
      message: "URL ảnh cần là link http(s) hoặc đường dẫn bắt đầu bằng /."
    }),
  servicePricingImageAlt: z.string().trim().max(300, "Mô tả ảnh quá dài.")
});

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

async function ensureAdminRole() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." };
  }

  if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.EDITOR) {
    return { error: "Bạn không có quyền cập nhật cài đặt." };
  }

  const tenantId = await resolveTenantIdForSessionUser(session.user);
  return { tenantId };
}

function success(message: string): SettingsActionState {
  return { status: "success", message };
}

function failure(message: string): SettingsActionState {
  return { status: "error", message };
}

type SettingPayload = {
  value: Prisma.InputJsonValue;
  description: string;
  groupKey: string;
  isPublic: boolean;
};

async function upsertSettingForTenant(
  tx: Prisma.TransactionClient,
  tenantId: string | null,
  key: string,
  payload: SettingPayload
) {
  const existing = await tx.siteSetting.findFirst({
    where: {
      key,
      ...(tenantId
        ? {
            OR: [{ tenantId }, { tenantId: null }]
          }
        : {})
    },
    select: { id: true, tenantId: true }
  });

  if (existing) {
    return tx.siteSetting.update({
      where: { id: existing.id },
      data: {
        tenantId: tenantId ?? existing.tenantId,
        value: payload.value,
        description: payload.description,
        groupKey: payload.groupKey,
        isPublic: payload.isPublic
      }
    });
  }

  return tx.siteSetting.create({
    data: {
      tenantId,
      key,
      value: payload.value,
      description: payload.description,
      groupKey: payload.groupKey,
      isPublic: payload.isPublic
    }
  });
}

export async function updateSiteSettingsAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const authError = await ensureAdminRole();
  if ("error" in authError) {
    return failure(authError.error ?? "Không đủ quyền cập nhật cài đặt.");
  }

  if (!process.env.DATABASE_URL) {
    return failure("Thiếu DATABASE_URL nên chưa thể lưu cài đặt.");
  }

  const parsed = settingsSchema.safeParse({
    siteName: String(formData.get("siteName") ?? ""),
    siteDomain: String(formData.get("siteDomain") ?? ""),
    siteTagline: String(formData.get("siteTagline") ?? ""),
    hotlineValue: String(formData.get("hotlineValue") ?? ""),
    hotlineDisplay: String(formData.get("hotlineDisplay") ?? ""),
    email: String(formData.get("email") ?? ""),
    zaloNumber: String(formData.get("zaloNumber") ?? ""),
    servicePricingImageUrl: String(formData.get("servicePricingImageUrl") ?? ""),
    servicePricingImageAlt: String(formData.get("servicePricingImageAlt") ?? "")
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Dữ liệu settings không hợp lệ.");
  }

  const siteDomain = normalizeDomain(parsed.data.siteDomain);
  const hotlineValue = normalizePhone(parsed.data.hotlineValue);
  const zaloNumber = normalizePhone(parsed.data.zaloNumber);
  const servicePricingImageUrl = parsed.data.servicePricingImageUrl.trim();
  const servicePricingImageAlt = parsed.data.servicePricingImageAlt.trim();

  try {
    await prisma.$transaction(async (tx) => {
      await upsertSettingForTenant(tx, authError.tenantId, "site_name", {
        value: { text: parsed.data.siteName } as Prisma.InputJsonValue,
        description: "Tên website công khai",
        groupKey: "general",
        isPublic: true
      });

      await upsertSettingForTenant(tx, authError.tenantId, "site_domain", {
        value: { value: siteDomain } as Prisma.InputJsonValue,
        description: "Tên miền website công khai",
        groupKey: "general",
        isPublic: true
      });

      await upsertSettingForTenant(tx, authError.tenantId, "site_tagline", {
        value: { text: parsed.data.siteTagline } as Prisma.InputJsonValue,
        description: "Khẩu hiệu website công khai",
        groupKey: "general",
        isPublic: true
      });

      await upsertSettingForTenant(tx, authError.tenantId, "hotline", {
        value: {
          value: hotlineValue,
          display: parsed.data.hotlineDisplay
        } as Prisma.InputJsonValue,
        description: "Số hotline chính",
        groupKey: "contact",
        isPublic: true
      });

      await upsertSettingForTenant(tx, authError.tenantId, "contact_email", {
        value: { value: parsed.data.email } as Prisma.InputJsonValue,
        description: "Email hỗ trợ công khai",
        groupKey: "contact",
        isPublic: true
      });

      await upsertSettingForTenant(tx, authError.tenantId, "zalo_hotline", {
        value: { value: zaloNumber } as Prisma.InputJsonValue,
        description: "Số Zalo hotline",
        groupKey: "contact",
        isPublic: true
      });

      await upsertSettingForTenant(tx, authError.tenantId, "service_pricing_image", {
        value: {
          url: servicePricingImageUrl,
          alt: servicePricingImageAlt
        } as Prisma.InputJsonValue,
        description: "Ảnh minh họa khung bảng giá trên các trang dịch vụ",
        groupKey: "service",
        isPublic: true
      });
    });

    const serviceSlugs = await prisma.servicePage.findMany({
      where: {
        ...whereByTenantId(authError.tenantId),
        isPublished: true
      },
      select: { slug: true }
    });

    revalidatePath("/", "layout");
    revalidatePath("/", "page");
    revalidatePath("/dich-vu", "page");
    serviceSlugs.forEach((item) => {
      revalidatePath(`/${item.slug}`, "page");
    });
    revalidatePath("/lien-he", "page");
    revalidatePath("/admincp/settings", "page");

    return success("Đã lưu cài đặt hệ thống.");
  } catch {
    return failure("Không thể lưu cài đặt.");
  }
}
