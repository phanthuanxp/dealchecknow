import { put } from "@vercel/blob";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { getFileExtension, toSlug } from "@/lib/media";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_UPLOAD_SIZE_BYTES = 8 * 1024 * 1024;

const uploadSchema = z.object({
  title: z.string().trim().min(2, "Tiêu đề ảnh phải có ít nhất 2 ký tự.").max(160, "Tiêu đề ảnh quá dài."),
  code: z.string().trim().max(120, "Mã ảnh quá dài.").optional(),
  altText: z.string().trim().max(300, "Alt text quá dài."),
  groupKey: z
    .string()
    .trim()
    .min(2, "Nhóm ảnh phải có ít nhất 2 ký tự.")
    .max(60, "Nhóm ảnh quá dài.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Nhóm ảnh chỉ gồm chữ thường, số và dấu gạch ngang."
    ),
  sortOrder: z.coerce.number().int().min(-999).max(9999),
  isActive: z.boolean(),
  width: z.coerce.number().int().min(1).max(12000).nullable(),
  height: z.coerce.number().int().min(1).max(12000).nullable()
});

function parseOptionalInt(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) {
    return null;
  }

  const numberValue = Number(text);
  if (!Number.isFinite(numberValue)) {
    return Number.NaN;
  }

  return numberValue;
}

async function resolveUniqueCode(baseCode: string) {
  let candidate = baseCode;
  let suffix = 1;

  while (candidate) {
    const existing = await prisma.mediaAsset.findUnique({ where: { code: candidate } });
    if (!existing) {
      return candidate;
    }
    suffix += 1;
    candidate = `${baseCode}-${suffix}`.slice(0, 120);
  }

  return `media-${Date.now()}`;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      {
        success: false,
        message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
      },
      { status: 401 }
    );
  }

  if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.EDITOR) {
    return NextResponse.json(
      {
        success: false,
        message: "Bạn không có quyền tải ảnh lên thư viện."
      },
      { status: 403 }
    );
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      {
        success: false,
        message: "Thiếu DATABASE_URL nên chưa thể lưu ảnh."
      },
      { status: 500 }
    );
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Thiếu BLOB_READ_WRITE_TOKEN. Vui lòng cấu hình Vercel Blob trước khi tải ảnh."
      },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size <= 0) {
    return NextResponse.json(
      {
        success: false,
        message: "Vui lòng chọn file ảnh hợp lệ."
      },
      { status: 400 }
    );
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      {
        success: false,
        message: "Chỉ hỗ trợ tải file hình ảnh."
      },
      { status: 400 }
    );
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return NextResponse.json(
      {
        success: false,
        message: "File quá lớn. Vui lòng chọn ảnh nhỏ hơn 8MB."
      },
      { status: 400 }
    );
  }

  const parsed = uploadSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    code: String(formData.get("code") ?? "").trim() || undefined,
    altText: String(formData.get("altText") ?? ""),
    groupKey: toSlug(String(formData.get("groupKey") ?? ""), "general"),
    sortOrder: String(formData.get("sortOrder") ?? "0"),
    isActive: formData.get("isActive") === "on",
    width: parseOptionalInt(formData.get("width")),
    height: parseOptionalInt(formData.get("height"))
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Thông tin upload không hợp lệ."
      },
      { status: 400 }
    );
  }

  try {
    const sanitizedCode = toSlug(parsed.data.code ?? parsed.data.title);
    const code = await resolveUniqueCode(sanitizedCode);
    const extension = getFileExtension(file);
    const pathname = `media/${parsed.data.groupKey}/${code}-${Date.now()}.${extension}`;

    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    const created = await prisma.mediaAsset.create({
      data: {
        code,
        title: parsed.data.title,
        url: blob.url,
        altText: parsed.data.altText || null,
        groupKey: parsed.data.groupKey,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive,
        width: parsed.data.width,
        height: parsed.data.height
      },
      select: {
        id: true,
        code: true,
        title: true,
        url: true,
        altText: true,
        groupKey: true
      }
    });

    revalidatePath("/admincp/media", "page");
    revalidatePath("/admincp/blocks", "page");
    revalidatePath("/", "page");

    return NextResponse.json(
      {
        success: true,
        message: "Đã tải ảnh lên Vercel Blob và lưu vào SQL.",
        asset: created
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload media failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Không thể tải ảnh lên. Vui lòng thử lại."
      },
      { status: 500 }
    );
  }
}
