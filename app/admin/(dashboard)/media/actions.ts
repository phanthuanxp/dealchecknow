"use server";

import { del } from "@vercel/blob";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { isVercelBlobUrl, parseOptionalInt, toSlug } from "@/lib/media";
import prisma from "@/lib/prisma";
import { resolveTenantIdForSessionUser } from "@/lib/tenant";

type ActionStatus = "idle" | "success" | "error";

export type MediaActionState = {
  status: ActionStatus;
  message: string;
};

const groupKeySchema = z
  .string()
  .trim()
  .min(2, "Nhóm ảnh phải có ít nhất 2 ký tự.")
  .max(60, "Nhóm ảnh quá dài.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Nhóm ảnh chỉ gồm chữ thường, số và dấu gạch ngang."
  );

const mediaUrlSchema = z
  .string()
  .trim()
  .min(1, "URL ảnh không được để trống.")
  .max(2000, "URL ảnh quá dài.")
  .refine(
    (value) => value.startsWith("/") || /^https?:\/\/.+/i.test(value),
    "URL ảnh phải là link https:// hoặc đường dẫn nội bộ bắt đầu bằng /."
  );

const mediaSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Mã ảnh phải có ít nhất 2 ký tự.")
    .max(120, "Mã ảnh quá dài.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Mã ảnh chỉ gồm chữ thường, số và dấu gạch ngang."
    ),
  title: z.string().trim().min(2, "Tiêu đề ảnh phải có ít nhất 2 ký tự.").max(160, "Tiêu đề ảnh quá dài."),
  url: mediaUrlSchema,
  altText: z.string().trim().max(300, "Alt text quá dài."),
  groupKey: groupKeySchema,
  sortOrder: z.coerce.number().int().min(-999).max(9999),
  isActive: z.boolean(),
  width: z.coerce.number().int().min(1).max(12000).nullable(),
  height: z.coerce.number().int().min(1).max(12000).nullable()
});

const updateMediaSchema = mediaSchema.extend({
  id: z.string().trim().min(1, "Thiếu ID ảnh.")
});

const deleteMediaSchema = z.object({
  id: z.string().trim().min(1, "Thiếu ID ảnh.")
});

function success(message: string): MediaActionState {
  return { status: "success", message };
}

function failure(message: string): MediaActionState {
  return { status: "error", message };
}

async function ensureEditorRole() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." };
  }

  if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.EDITOR) {
    return { error: "Bạn không có quyền quản lý thư viện ảnh." };
  }

  const tenantId = await resolveTenantIdForSessionUser(session.user);
  return { tenantId };
}

async function resolveUniqueCode(baseCode: string, currentId?: string) {
  let candidate = baseCode;
  let suffix = 1;

  while (candidate) {
    const existing = await prisma.mediaAsset.findUnique({ where: { code: candidate } });
    if (!existing || existing.id === currentId) {
      return candidate;
    }
    suffix += 1;
    candidate = `${baseCode}-${suffix}`.slice(0, 120);
  }

  return `media-${Date.now()}`;
}

function revalidateMediaPaths() {
  revalidatePath("/admincp/media", "page");
  revalidatePath("/admincp/blocks", "page");
  revalidatePath("/", "page");
}

export async function createMediaAction(
  _prev: MediaActionState,
  formData: FormData
): Promise<MediaActionState> {
  const authError = await ensureEditorRole();
  if ("error" in authError) {
    return failure(authError.error ?? "Không đủ quyền thao tác thư viện ảnh.");
  }

  if (!process.env.DATABASE_URL) {
    return failure("Thiếu DATABASE_URL nên chưa thể lưu ảnh.");
  }

  const width = parseOptionalInt(formData.get("width"));
  const height = parseOptionalInt(formData.get("height"));

  const parsed = mediaSchema.safeParse({
    code: toSlug(String(formData.get("code") ?? "") || String(formData.get("title") ?? "")),
    title: String(formData.get("title") ?? ""),
    url: String(formData.get("url") ?? ""),
    altText: String(formData.get("altText") ?? ""),
    groupKey: toSlug(String(formData.get("groupKey") ?? ""), "general"),
    sortOrder: String(formData.get("sortOrder") ?? "0"),
    isActive: formData.get("isActive") === "on",
    width,
    height
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Dữ liệu ảnh không hợp lệ.");
  }

  try {
    const code = await resolveUniqueCode(parsed.data.code);
    await prisma.mediaAsset.create({
      data: {
        tenantId: authError.tenantId,
        code,
        title: parsed.data.title,
        url: parsed.data.url,
        altText: parsed.data.altText || null,
        groupKey: parsed.data.groupKey,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive,
        width: parsed.data.width,
        height: parsed.data.height
      }
    });

    revalidateMediaPaths();
    return success("Đã thêm ảnh vào thư viện.");
  } catch {
    return failure("Không thể thêm ảnh mới.");
  }
}

export async function updateMediaAction(
  _prev: MediaActionState,
  formData: FormData
): Promise<MediaActionState> {
  const authError = await ensureEditorRole();
  if ("error" in authError) {
    return failure(authError.error ?? "Không đủ quyền thao tác thư viện ảnh.");
  }

  if (!process.env.DATABASE_URL) {
    return failure("Thiếu DATABASE_URL nên chưa thể cập nhật ảnh.");
  }

  const width = parseOptionalInt(formData.get("width"));
  const height = parseOptionalInt(formData.get("height"));

  const parsed = updateMediaSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    code: toSlug(String(formData.get("code") ?? "") || String(formData.get("title") ?? "")),
    title: String(formData.get("title") ?? ""),
    url: String(formData.get("url") ?? ""),
    altText: String(formData.get("altText") ?? ""),
    groupKey: toSlug(String(formData.get("groupKey") ?? ""), "general"),
    sortOrder: String(formData.get("sortOrder") ?? "0"),
    isActive: formData.get("isActive") === "on",
    width,
    height
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Dữ liệu ảnh không hợp lệ.");
  }

  try {
    const existingMedia = await prisma.mediaAsset.findFirst({
      where: {
        id: parsed.data.id,
        ...(authError.tenantId
          ? {
              OR: [{ tenantId: authError.tenantId }, { tenantId: null }]
            }
          : {})
      },
      select: {
        id: true,
        tenantId: true
      }
    });

    if (!existingMedia) {
      return failure("KhÃ´ng tÃ¬m tháº¥y áº£nh cáº§n cáº­p nháº­t.");
    }

    const code = await resolveUniqueCode(parsed.data.code, parsed.data.id);
    await prisma.mediaAsset.update({
      where: { id: existingMedia.id },
      data: {
        tenantId: authError.tenantId ?? existingMedia.tenantId,
        code,
        title: parsed.data.title,
        url: parsed.data.url,
        altText: parsed.data.altText || null,
        groupKey: parsed.data.groupKey,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive,
        width: parsed.data.width,
        height: parsed.data.height
      }
    });

    revalidateMediaPaths();
    return success("Đã cập nhật ảnh.");
  } catch {
    return failure("Không thể cập nhật ảnh.");
  }
}

export async function deleteMediaAction(
  _prev: MediaActionState,
  formData: FormData
): Promise<MediaActionState> {
  const authError = await ensureEditorRole();
  if ("error" in authError) {
    return failure(authError.error ?? "Không đủ quyền thao tác thư viện ảnh.");
  }

  if (!process.env.DATABASE_URL) {
    return failure("Thiếu DATABASE_URL nên chưa thể xóa ảnh.");
  }

  const parsed = deleteMediaSchema.safeParse({
    id: String(formData.get("id") ?? "")
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "ID ảnh không hợp lệ.");
  }

  try {
    const media = await prisma.mediaAsset.findFirst({
      where: {
        id: parsed.data.id,
        ...(authError.tenantId
          ? {
              OR: [{ tenantId: authError.tenantId }, { tenantId: null }]
            }
          : {})
      },
      select: { id: true, url: true }
    });

    if (!media) {
      return failure("Không tìm thấy ảnh cần xóa.");
    }

    await prisma.mediaAsset.delete({
      where: { id: media.id }
    });

    if (process.env.BLOB_READ_WRITE_TOKEN && isVercelBlobUrl(media.url)) {
      try {
        await del(media.url, { token: process.env.BLOB_READ_WRITE_TOKEN });
      } catch {
        // Bỏ qua lỗi xóa blob để tránh làm hỏng luồng xóa dữ liệu SQL.
      }
    }

    revalidateMediaPaths();
    return success("Đã xóa ảnh khỏi thư viện.");
  } catch {
    return failure("Không thể xóa ảnh.");
  }
}
