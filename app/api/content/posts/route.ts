import { PublishStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { resolveTenantForRequest } from "@/lib/tenant";

const payloadSchema = z.object({
  title: z.string().trim().min(6).max(220),
  slug: z.string().trim().min(3).max(180),
  excerpt: z.string().trim().max(500).optional().nullable(),
  content: z.string().trim().min(20).max(60000),
  seoTitle: z.string().trim().max(220).optional().nullable(),
  seoDescription: z.string().trim().max(320).optional().nullable(),
  featuredImageUrl: z.string().url().optional().nullable(),
  category: z.string().trim().max(120).optional().nullable(),
  tags: z.array(z.string().trim().max(80)).max(20).optional(),
  sourceUrls: z.array(z.string().url()).max(20).optional()
});

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

function requireBearer(request: Request) {
  const expected = process.env.CONTENT_API_KEY?.trim();
  if (!expected) return false;
  const auth = request.headers.get("authorization") || "";
  return auth === `Bearer ${expected}`;
}

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

async function ensureCategory(tenantId: string | null, name: string) {
  const slug = toSlug(name) || "auto-blog";
  const existing = await prisma.blogCategory.findFirst({
    where: { slug, tenantId },
    select: { id: true }
  });

  if (existing) return existing;

  return prisma.blogCategory.create({
    data: {
      tenantId,
      name,
      slug,
      description: "Bài viết được xuất bản tự động từ Auto Content Hub.",
      isActive: true,
      sortOrder: 100
    },
    select: { id: true }
  });
}

function appendSourceNote(content: string, sourceUrls: string[]) {
  if (sourceUrls.length === 0) return content;
  const links = sourceUrls.map((url) => `- ${url}`).join("\n");
  return `${content}\n\n## Nguồn tham khảo\n${links}`;
}

export async function POST(request: Request) {
  if (!requireBearer(request)) {
    return unauthorized();
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "Missing DATABASE_URL" }, { status: 500 });
  }

  const json = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const tenant = await resolveTenantForRequest(request);
  const tenantId = tenant?.id ?? null;
  const category = await ensureCategory(tenantId, data.category || "Auto Blog");
  const slug = toSlug(data.slug || data.title);
  const publishedAt = new Date();
  const sourceUrls = data.sourceUrls || [];

  if (!slug) {
    return NextResponse.json({ ok: false, error: "Invalid slug" }, { status: 400 });
  }

  const existing = await prisma.blogPost.findFirst({
    where: { tenantId, slug },
    select: { id: true }
  });

  const post = existing
    ? await prisma.blogPost.update({
        where: { id: existing.id },
        data: {
          categoryId: category.id,
          title: data.title,
          excerpt: data.excerpt || null,
          content: appendSourceNote(data.content, sourceUrls),
          coverImageUrl: data.featuredImageUrl || null,
          seoTitle: data.seoTitle || null,
          seoDescription: data.seoDescription || null,
          tags: data.tags || [],
          status: PublishStatus.PUBLISHED,
          publishedAt
        },
        select: { id: true, slug: true, title: true }
      })
    : await prisma.blogPost.create({
        data: {
          tenantId,
          categoryId: category.id,
          title: data.title,
          slug,
          excerpt: data.excerpt || null,
          content: appendSourceNote(data.content, sourceUrls),
          coverImageUrl: data.featuredImageUrl || null,
          seoTitle: data.seoTitle || null,
          seoDescription: data.seoDescription || null,
          tags: data.tags || [],
          status: PublishStatus.PUBLISHED,
          publishedAt
        },
        select: { id: true, slug: true, title: true }
      });

  revalidatePath("/blog", "page");
  revalidatePath(`/blog/${post.slug}`, "page");
  revalidatePath("/sitemap.xml", "page");

  return NextResponse.json({ ok: true, post, url: `/blog/${post.slug}` });
}
