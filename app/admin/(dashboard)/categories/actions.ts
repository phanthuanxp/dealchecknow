"use server";

import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

type ActionStatus = "idle" | "success" | "error";

export type CategoryActionState = {
  status: ActionStatus;
  message: string;
};

const categorySchema = z.object({
  name: z.string().trim().min(2, "Tên danh mục phải có ít nhất 2 ký tự.").max(120, "Tên danh mục quá dài."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug phải có ít nhất 2 ký tự.")
    .max(140, "Slug quá dài.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang."),
  description: z.string().trim().max(400, "Mô tả quá dài."),
  sortOrder: z.coerce.number().int().min(-999).max(9999),
  isActive: z.boolean()
});

const updateCategorySchema = categorySchema.extend({
  id: z.string().trim().min(1)
});

const deleteCategorySchema = z.object({
  id: z.string().trim().min(1)
});

function toSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
}

type EnsureEditorRoleResult = { ok: true } | { ok: false; error: string };

async function ensureEditorRole(): Promise<EnsureEditorRoleResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." };
  }

  if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.EDITOR) {
    return { ok: false, error: "Bạn không có quyền thao tác danh mục." };
  }

  return { ok: true };
}

function success(message: string): CategoryActionState {
  return { status: "success", message };
}

function failure(message: string): CategoryActionState {
  return { status: "error", message };
}

async function resolveUniqueCategorySlug(baseSlug: string, currentId?: string) {
  let candidate = baseSlug;
  let suffix = 1;

  while (candidate) {
    const existing = await prisma.blogCategory.findUnique({
      where: { slug: candidate },
      select: { id: true }
    });

    if (!existing || existing.id === currentId) {
      return candidate;
    }

    suffix += 1;
    candidate = `${baseSlug}-${suffix}`.slice(0, 140);
  }

  return `danh-muc-${Date.now()}`;
}

function revalidateCategoryPaths() {
  revalidatePath("/admincp/categories", "page");
  revalidatePath("/admincp/blog", "page");
  revalidatePath("/admincp/blog/new", "page");
  revalidatePath("/blog", "page");
}

export async function createCategoryAction(
  _prev: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const authResult = await ensureEditorRole();
  if (!authResult.ok) {
    return failure(authResult.error);
  }

  if (!process.env.DATABASE_URL) {
    return failure("Thiếu DATABASE_URL nên chưa thể lưu danh mục.");
  }

  const rawSlug = String(formData.get("slug") ?? "");
  const parsed = categorySchema.safeParse({
    name: String(formData.get("name") ?? ""),
    slug: toSlug(rawSlug || String(formData.get("name") ?? "")),
    description: String(formData.get("description") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? "0"),
    isActive: formData.get("isActive") === "on"
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Dữ liệu danh mục không hợp lệ.");
  }

  try {
    const slug = await resolveUniqueCategorySlug(parsed.data.slug);

    await prisma.blogCategory.create({
      data: {
        name: parsed.data.name,
        slug,
        description: parsed.data.description || null,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive
      }
    });

    revalidateCategoryPaths();
    return success("Đã tạo danh mục mới.");
  } catch {
    return failure("Không thể tạo danh mục. Vui lòng thử lại.");
  }
}

export async function updateCategoryAction(
  _prev: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const authResult = await ensureEditorRole();
  if (!authResult.ok) {
    return failure(authResult.error);
  }

  const rawSlug = String(formData.get("slug") ?? "");
  const parsed = updateCategorySchema.safeParse({
    id: String(formData.get("id") ?? ""),
    name: String(formData.get("name") ?? ""),
    slug: toSlug(rawSlug || String(formData.get("name") ?? "")),
    description: String(formData.get("description") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? "0"),
    isActive: formData.get("isActive") === "on"
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Dữ liệu danh mục không hợp lệ.");
  }

  try {
    const slug = await resolveUniqueCategorySlug(parsed.data.slug, parsed.data.id);

    await prisma.blogCategory.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        slug,
        description: parsed.data.description || null,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive
      }
    });

    revalidateCategoryPaths();
    return success("Đã cập nhật danh mục.");
  } catch {
    return failure("Không thể cập nhật danh mục.");
  }
}

export async function deleteCategoryAction(
  _prev: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const authResult = await ensureEditorRole();
  if (!authResult.ok) {
    return failure(authResult.error);
  }

  const parsed = deleteCategorySchema.safeParse({
    id: String(formData.get("id") ?? "")
  });

  if (!parsed.success) {
    return failure("ID danh mục không hợp lệ.");
  }

  try {
    const postCount = await prisma.blogPost.count({
      where: { categoryId: parsed.data.id }
    });

    if (postCount > 0) {
      return failure("Không thể xóa vì danh mục vẫn còn bài viết.");
    }

    await prisma.blogCategory.delete({
      where: { id: parsed.data.id }
    });

    revalidateCategoryPaths();
    return success("Đã xóa danh mục.");
  } catch {
    return failure("Không thể xóa danh mục.");
  }
}
