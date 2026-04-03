"use server";

import { Prisma, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
    .min(4, "Domain không hợp lệ.")
    .max(120, "Domain quá dài.")
    .regex(/^(?:https?:\/\/)?[a-z0-9.-]+\.[a-z]{2,}(?:\/.*)?$/i, "Domain không hợp lệ."),
  siteTagline: z.string().trim().min(5, "Tagline cần ít nhất 5 ký tự.").max(200, "Tagline quá dài."),
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
    .regex(/^[+0-9().\s-]+$/, "Số Zalo không hợp lệ.")
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

  return null;
}

function success(message: string): SettingsActionState {
  return { status: "success", message };
}

function failure(message: string): SettingsActionState {
  return { status: "error", message };
}

export async function updateSiteSettingsAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const authError = await ensureAdminRole();
  if (authError) {
    return failure(authError.error);
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
    zaloNumber: String(formData.get("zaloNumber") ?? "")
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Dữ liệu settings không hợp lệ.");
  }

  const siteDomain = normalizeDomain(parsed.data.siteDomain);
  const hotlineValue = normalizePhone(parsed.data.hotlineValue);
  const zaloNumber = normalizePhone(parsed.data.zaloNumber);

  try {
    await prisma.$transaction([
      prisma.siteSetting.upsert({
        where: { key: "site_name" },
        update: {
          value: { text: parsed.data.siteName } as Prisma.InputJsonValue,
          description: "Public website name",
          groupKey: "general",
          isPublic: true
        },
        create: {
          key: "site_name",
          value: { text: parsed.data.siteName } as Prisma.InputJsonValue,
          description: "Public website name",
          groupKey: "general",
          isPublic: true
        }
      }),
      prisma.siteSetting.upsert({
        where: { key: "site_domain" },
        update: {
          value: { value: siteDomain } as Prisma.InputJsonValue,
          description: "Public website domain",
          groupKey: "general",
          isPublic: true
        },
        create: {
          key: "site_domain",
          value: { value: siteDomain } as Prisma.InputJsonValue,
          description: "Public website domain",
          groupKey: "general",
          isPublic: true
        }
      }),
      prisma.siteSetting.upsert({
        where: { key: "site_tagline" },
        update: {
          value: { text: parsed.data.siteTagline } as Prisma.InputJsonValue,
          description: "Public website tagline",
          groupKey: "general",
          isPublic: true
        },
        create: {
          key: "site_tagline",
          value: { text: parsed.data.siteTagline } as Prisma.InputJsonValue,
          description: "Public website tagline",
          groupKey: "general",
          isPublic: true
        }
      }),
      prisma.siteSetting.upsert({
        where: { key: "hotline" },
        update: {
          value: {
            value: hotlineValue,
            display: parsed.data.hotlineDisplay
          } as Prisma.InputJsonValue,
          description: "Primary hotline number",
          groupKey: "contact",
          isPublic: true
        },
        create: {
          key: "hotline",
          value: {
            value: hotlineValue,
            display: parsed.data.hotlineDisplay
          } as Prisma.InputJsonValue,
          description: "Primary hotline number",
          groupKey: "contact",
          isPublic: true
        }
      }),
      prisma.siteSetting.upsert({
        where: { key: "contact_email" },
        update: {
          value: { value: parsed.data.email } as Prisma.InputJsonValue,
          description: "Public support email",
          groupKey: "contact",
          isPublic: true
        },
        create: {
          key: "contact_email",
          value: { value: parsed.data.email } as Prisma.InputJsonValue,
          description: "Public support email",
          groupKey: "contact",
          isPublic: true
        }
      }),
      prisma.siteSetting.upsert({
        where: { key: "zalo_hotline" },
        update: {
          value: { value: zaloNumber } as Prisma.InputJsonValue,
          description: "Zalo hotline number",
          groupKey: "contact",
          isPublic: true
        },
        create: {
          key: "zalo_hotline",
          value: { value: zaloNumber } as Prisma.InputJsonValue,
          description: "Zalo hotline number",
          groupKey: "contact",
          isPublic: true
        }
      })
    ]);

    revalidatePath("/", "layout");
    revalidatePath("/", "page");
    revalidatePath("/lien-he", "page");
    revalidatePath("/admincp/settings", "page");

    return success("Đã lưu cài đặt hệ thống.");
  } catch {
    return failure("Không thể lưu cài đặt.");
  }
}
