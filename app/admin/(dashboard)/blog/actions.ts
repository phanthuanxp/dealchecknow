"use server";

import { PublishStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

type ActionStatus = "idle" | "success" | "error";

export type BlogActionState = {
  status: ActionStatus;
  message: string;
};

const blogSchema = z.object({
  title: z.string().trim().min(6, "Tiêu đề phải có ít nhất 6 ký tự.").max(220, "Tiêu đề quá dài."),
  slug: z.string().trim().max(180, "Slug quá dài."),
  excerpt: z.string().trim().max(400, "Mô tả ngắn quá dài."),
  content: z.string().trim().min(20, "Nội dung bài viết quá ngắn.").max(60000, "Nội dung bài viết quá dài."),
  coverImageUrl: z.string().trim().max(1000, "URL ảnh đại diện quá dài."),
  categoryId: z.string().trim().min(1, "Vui lòng chọn danh mục."),
  seoTitle: z.string().trim().max(220, "Meta title quá dài."),
  seoDescription: z.string().trim().max(320, "Meta description quá dài."),
  status: z.nativeEnum(PublishStatus),
  publishedAt: z.string().trim().max(30, "Ngày đăng không hợp lệ.")
});

const updateBlogSchema = blogSchema.extend({
  id: z.string().trim().min(1)
});

const deleteBlogSchema = z.object({
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
    .slice(0, 180);
}

type EnsureEditorRoleResult = { ok: true; userId: string } | { ok: false; error: string };

async function ensureEditorRole(): Promise<EnsureEditorRoleResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." };
  }

  if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.EDITOR) {
    return { ok: false, error: "Bạn không có quyền thao tác bài blog." };
  }

  return { ok: true, userId: session.user.id };
}

function parseVietnamDateTimeLocal(value: string): Date | null {
  if (!value) {
    return null;
  }

  const matched = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!matched) {
    return null;
  }

  const year = Number(matched[1]);
  const month = Number(matched[2]);
  const day = Number(matched[3]);
  const hour = Number(matched[4]);
  const minute = Number(matched[5]);

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    Number.isNaN(hour) ||
    Number.isNaN(minute)
  ) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, day, hour - 7, minute, 0));
}

function resolveOptionalUrl(value: string) {
  if (!value.trim()) {
    return null;
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

async function resolveUniquePostSlug(baseSlug: string, currentId?: string) {
  let candidate = baseSlug;
  let suffix = 1;

  while (candidate) {
    const existing = await prisma.blogPost.findUnique({
      where: { slug: candidate },
      select: { id: true }
    });

    if (!existing || existing.id === currentId) {
      return candidate;
    }

    suffix += 1;
    candidate = `${baseSlug}-${suffix}`.slice(0, 180);
  }

  return `bai-viet-${Date.now()}`;
}

function success(message: string): BlogActionState {
  return { status: "success", message };
}

function failure(message: string): BlogActionState {
  return { status: "error", message };
}

function revalidateBlogPaths(slug?: string, previousSlug?: string) {
  revalidatePath("/admincp/blog", "page");
  revalidatePath("/admincp/blog/new", "page");
  revalidatePath("/admincp/categories", "page");
  revalidatePath("/blog", "page");
  if (slug) {
    revalidatePath(`/blog/${slug}`, "page");
  }
  if (previousSlug) {
    revalidatePath(`/blog/${previousSlug}`, "page");
  }
}

export async function createBlogPostAction(
  _prev: BlogActionState,
  formData: FormData
): Promise<BlogActionState> {
  const authResult = await ensureEditorRole();
  if (!authResult.ok) {
    return failure(authResult.error);
  }

  if (!process.env.DATABASE_URL) {
    return failure("Thiếu DATABASE_URL nên chưa thể lưu bài blog.");
  }

  const parsed = blogSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    excerpt: String(formData.get("excerpt") ?? ""),
    content: String(formData.get("content") ?? ""),
    coverImageUrl: String(formData.get("coverImageUrl") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    seoTitle: String(formData.get("seoTitle") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
    status: String(formData.get("status") ?? PublishStatus.DRAFT),
    publishedAt: String(formData.get("publishedAt") ?? "")
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Dữ liệu bài viết không hợp lệ.");
  }

  const normalizedSlug = toSlug(parsed.data.slug || parsed.data.title);
  if (!normalizedSlug) {
    return failure("Không thể tạo slug hợp lệ từ tiêu đề bài viết.");
  }

  const parsedPublishDate = parsed.data.publishedAt
    ? parseVietnamDateTimeLocal(parsed.data.publishedAt)
    : null;
  if (parsed.data.publishedAt && !parsedPublishDate) {
    return failure("Ngày đăng không đúng định dạng.");
  }

  const coverImageUrl = resolveOptionalUrl(parsed.data.coverImageUrl);
  if (parsed.data.coverImageUrl && !coverImageUrl) {
    return failure("URL ảnh đại diện không hợp lệ. Chỉ chấp nhận http/https.");
  }

  try {
    const category = await prisma.blogCategory.findUnique({
      where: { id: parsed.data.categoryId },
      select: { id: true }
    });
    if (!category) {
      return failure("Danh mục đã chọn không tồn tại.");
    }

    const slug = await resolveUniquePostSlug(normalizedSlug);
    const isPublished = parsed.data.status === PublishStatus.PUBLISHED;
    const publishedAt = isPublished ? parsedPublishDate ?? new Date() : parsedPublishDate;

    await prisma.blogPost.create({
      data: {
        title: parsed.data.title,
        slug,
        excerpt: parsed.data.excerpt || null,
        content: parsed.data.content,
        coverImageUrl,
        categoryId: parsed.data.categoryId,
        seoTitle: parsed.data.seoTitle || null,
        seoDescription: parsed.data.seoDescription || null,
        status: parsed.data.status,
        publishedAt,
        authorId: authResult.userId,
        tags: []
      }
    });

    revalidateBlogPaths(slug);
    return success("Đã tạo bài blog mới.");
  } catch {
    return failure("Không thể tạo bài blog. Vui lòng thử lại.");
  }
}

export async function updateBlogPostAction(
  _prev: BlogActionState,
  formData: FormData
): Promise<BlogActionState> {
  const authResult = await ensureEditorRole();
  if (!authResult.ok) {
    return failure(authResult.error);
  }

  const parsed = updateBlogSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    excerpt: String(formData.get("excerpt") ?? ""),
    content: String(formData.get("content") ?? ""),
    coverImageUrl: String(formData.get("coverImageUrl") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    seoTitle: String(formData.get("seoTitle") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
    status: String(formData.get("status") ?? PublishStatus.DRAFT),
    publishedAt: String(formData.get("publishedAt") ?? "")
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Dữ liệu bài viết không hợp lệ.");
  }

  const normalizedSlug = toSlug(parsed.data.slug || parsed.data.title);
  if (!normalizedSlug) {
    return failure("Không thể tạo slug hợp lệ từ tiêu đề bài viết.");
  }

  const parsedPublishDate = parsed.data.publishedAt
    ? parseVietnamDateTimeLocal(parsed.data.publishedAt)
    : null;
  if (parsed.data.publishedAt && !parsedPublishDate) {
    return failure("Ngày đăng không đúng định dạng.");
  }

  const coverImageUrl = resolveOptionalUrl(parsed.data.coverImageUrl);
  if (parsed.data.coverImageUrl && !coverImageUrl) {
    return failure("URL ảnh đại diện không hợp lệ. Chỉ chấp nhận http/https.");
  }

  try {
    const [existingPost, category] = await Promise.all([
      prisma.blogPost.findUnique({
        where: { id: parsed.data.id },
        select: { id: true, slug: true }
      }),
      prisma.blogCategory.findUnique({
        where: { id: parsed.data.categoryId },
        select: { id: true }
      })
    ]);

    if (!existingPost) {
      return failure("Bài viết không tồn tại.");
    }

    if (!category) {
      return failure("Danh mục đã chọn không tồn tại.");
    }

    const slug = await resolveUniquePostSlug(normalizedSlug, parsed.data.id);
    const isPublished = parsed.data.status === PublishStatus.PUBLISHED;
    const publishedAt = isPublished ? parsedPublishDate ?? new Date() : parsedPublishDate;

    await prisma.blogPost.update({
      where: { id: parsed.data.id },
      data: {
        title: parsed.data.title,
        slug,
        excerpt: parsed.data.excerpt || null,
        content: parsed.data.content,
        coverImageUrl,
        categoryId: parsed.data.categoryId,
        seoTitle: parsed.data.seoTitle || null,
        seoDescription: parsed.data.seoDescription || null,
        status: parsed.data.status,
        publishedAt
      }
    });

    revalidateBlogPaths(slug, existingPost.slug);
    return success("Đã cập nhật bài blog.");
  } catch {
    return failure("Không thể cập nhật bài blog.");
  }
}

export async function deleteBlogPostAction(
  _prev: BlogActionState,
  formData: FormData
): Promise<BlogActionState> {
  const authResult = await ensureEditorRole();
  if (!authResult.ok) {
    return failure(authResult.error);
  }

  const parsed = deleteBlogSchema.safeParse({
    id: String(formData.get("id") ?? "")
  });

  if (!parsed.success) {
    return failure("ID bài viết không hợp lệ.");
  }

  try {
    const existingPost = await prisma.blogPost.findUnique({
      where: { id: parsed.data.id },
      select: { slug: true }
    });

    if (!existingPost) {
      return failure("Bài viết không tồn tại.");
    }

    await prisma.blogPost.delete({
      where: { id: parsed.data.id }
    });

    revalidateBlogPaths(undefined, existingPost.slug);
    return success("Đã xóa bài blog.");
  } catch {
    return failure("Không thể xóa bài blog.");
  }
}
