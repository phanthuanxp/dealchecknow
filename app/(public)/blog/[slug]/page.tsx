import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getPublishedBlogPostBySlug,
  getPublishedBlogPosts,
  getRelatedPublishedBlogPosts
} from "@/lib/blog-queries";
import {
  createArticleMetadata,
  createArticleSchema,
  createBreadcrumbSchema,
  createPageMetadata,
  getSeoContext
} from "@/lib/seo";
import { getPublicSiteSettings } from "@/lib/site-settings";

type BlogDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type ContentBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

function formatDate(dateInput: string | null, fallback: string) {
  const source = dateInput ?? fallback;
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    dateStyle: "medium"
  }).format(new Date(source));
}

function buildContentBlocks(content: string): ContentBlock[] {
  const lines = content.split(/\r?\n/);
  const blocks: ContentBlock[] = [];
  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      blocks.push({ type: "paragraph", text: paragraphBuffer.join(" ").trim() });
      paragraphBuffer = [];
    }
  };

  const flushList = () => {
    if (listBuffer.length > 0) {
      blocks.push({ type: "list", items: [...listBuffer] });
      listBuffer = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h2", text: line.replace(/^##\s+/, "").trim() });
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h3", text: line.replace(/^###\s+/, "").trim() });
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      listBuffer.push(line.replace(/^[-*]\s+/, "").trim());
      continue;
    }

    flushList();
    paragraphBuffer.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toInlineHtml(input: string) {
  const escaped = escapeHtml(input);

  const withLinks = escaped.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    (_match, label: string, url: string) =>
      `<a href="${url}" target="_blank" rel="noreferrer" class="font-medium text-teal-700 underline decoration-teal-300 underline-offset-2">${label}</a>`
  );

  const withBold = withLinks.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  return withBold;
}

export async function generateStaticParams() {
  const posts = await getPublishedBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    return createPageMetadata({
      title: "Bài viết không tồn tại",
      description: "Bài viết bạn đang tìm không còn tồn tại trên website Taxi Ninh Bình.",
      path: "/blog",
      noIndex: true
    });
  }

  const description =
    post.seoDescription ?? post.excerpt ?? "Bài viết chia sẻ kinh nghiệm di chuyển và du lịch tại Ninh Bình.";
  const publishedDate = post.publishedAt ?? post.createdAt;

  return createArticleMetadata({
    title: post.seoTitle ?? post.title,
    description,
    path: `/blog/${post.slug}`,
    publishedTime: publishedDate,
    modifiedTime: publishedDate,
    category: post.category.name,
    imageUrl: post.coverImageUrl ?? undefined
  });
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const [relatedPosts, seo, settings] = await Promise.all([
    getRelatedPublishedBlogPosts(post, 3),
    getSeoContext(),
    getPublicSiteSettings()
  ]);

  const contentBlocks = buildContentBlocks(post.content);
  const publishedDate = post.publishedAt ?? post.createdAt;
  const description =
    post.seoDescription ?? post.excerpt ?? "Bài viết chia sẻ kinh nghiệm di chuyển và du lịch tại Ninh Bình.";
  const articleSchema = createArticleSchema({
    siteUrl: seo.siteUrl,
    siteName: seo.siteName,
    title: post.seoTitle ?? post.title,
    description,
    path: `/blog/${post.slug}`,
    publishedTime: publishedDate,
    modifiedTime: publishedDate,
    category: post.category.name,
    imageUrl: post.coverImageUrl
  });
  const breadcrumbSchema = createBreadcrumbSchema(seo.siteUrl, [
    { name: "Trang chủ", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` }
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-slate-500 sm:text-sm">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:text-teal-700 hover:underline">
              Trang chủ
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/blog" className="hover:text-teal-700 hover:underline">
              Blog
            </Link>
          </li>
          <li>/</li>
          <li className="text-slate-700">{post.title}</li>
        </ol>
      </nav>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{post.category.name}</p>
        <h1 className="mt-2 text-2xl font-bold leading-tight text-slate-900 sm:text-4xl">{post.title}</h1>
        <p className="mt-2 text-xs text-slate-500 sm:text-sm">Đăng ngày {formatDate(post.publishedAt, post.createdAt)}</p>

        {post.excerpt ? <p className="mt-4 text-sm text-slate-700 sm:text-base">{post.excerpt}</p> : null}

        <div className="relative mt-5 h-52 w-full overflow-hidden rounded-xl bg-gradient-to-br from-teal-100 to-sky-100 sm:h-72">
          <Image
            src={post.coverImageUrl || "/images/cover-service-overview.svg"}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 92vw, 1024px"
            className="object-cover"
            priority
          />
        </div>

        <div className="prose prose-slate mt-6 max-w-none text-sm leading-7 sm:text-base">
          {contentBlocks.map((block, index) => {
            if (block.type === "h2") {
              return (
                <h2
                  key={`h2-${index}`}
                  className="mt-6 text-xl font-semibold text-slate-900"
                  dangerouslySetInnerHTML={{ __html: toInlineHtml(block.text) }}
                />
              );
            }

            if (block.type === "h3") {
              return (
                <h3
                  key={`h3-${index}`}
                  className="mt-5 text-lg font-semibold text-slate-900"
                  dangerouslySetInnerHTML={{ __html: toInlineHtml(block.text) }}
                />
              );
            }

            if (block.type === "list") {
              return (
                <ul key={`ul-${index}`} className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
                  {block.items.map((item, itemIndex) => (
                    <li key={`li-${index}-${itemIndex}`} dangerouslySetInnerHTML={{ __html: toInlineHtml(item) }} />
                  ))}
                </ul>
              );
            }

            return (
              <p
                key={`p-${index}`}
                className="mt-3 text-slate-700"
                dangerouslySetInnerHTML={{ __html: toInlineHtml(block.text) }}
              />
            );
          })}
        </div>
      </article>

      {relatedPosts.length > 0 ? (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Bài viết liên quan</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {relatedPosts.map((related) => (
              <article key={related.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <Image
                  src={related.coverImageUrl || "/images/cover-about.svg"}
                  alt={related.title}
                  width={480}
                  height={192}
                  sizes="(max-width: 640px) 100vw, 30vw"
                  className="h-20 w-full rounded-lg border border-slate-200 object-cover"
                />
                <p className="mt-2 text-xs font-semibold uppercase text-teal-700">{related.category.name}</p>
                <h3 className="mt-1 text-sm font-semibold text-slate-900">{related.title}</h3>
                <p className="mt-2 text-xs text-slate-500">{formatDate(related.publishedAt, related.createdAt)}</p>
                <Link href={`/blog/${related.slug}`} className="mt-3 inline-flex text-sm font-semibold text-teal-700 hover:underline">
                  Đọc bài
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Bạn cần đặt taxi Ninh Bình?</h2>
        <p className="mt-2 text-sm text-slate-700">
          Liên hệ ngay để được tư vấn tuyến phù hợp: taxi Ninh Bình đi Hà Nội, đi sân bay Nội Bài hoặc thuê xe du lịch theo lịch trình riêng.
        </p>
        <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2 md:grid-cols-3">
          <Link href="/taxi-ha-noi-ninh-binh" className="rounded-lg border border-teal-200 bg-white px-3 py-1.5 font-semibold text-teal-700 hover:underline">
            taxi hà nội ninh bình
          </Link>
          <Link href="/taxi-noi-bai-ninh-binh" className="rounded-lg border border-teal-200 bg-white px-3 py-1.5 font-semibold text-teal-700 hover:underline">
            taxi nội bài ninh bình
          </Link>
          <Link href="/taxi-ninh-binh-ha-noi" className="rounded-lg border border-teal-200 bg-white px-3 py-1.5 font-semibold text-teal-700 hover:underline">
            taxi ninh bình hà nội
          </Link>
          <Link href="/taxi-ninh-binh-noi-bai" className="rounded-lg border border-teal-200 bg-white px-3 py-1.5 font-semibold text-teal-700 hover:underline">
            taxi ninh bình nội bài
          </Link>
          <Link href="/bang-gia" className="rounded-lg border border-teal-200 bg-white px-3 py-1.5 font-semibold text-teal-700 hover:underline">
            bảng giá taxi ninh bình
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={settings.hotlineTel}
            className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Gọi {settings.hotlineDisplay}
          </Link>
          <Link
            href={settings.zaloUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Chat Zalo
          </Link>
          <Link
            href="/#bao-gia"
            className="inline-flex items-center rounded-lg border border-teal-300 bg-white px-4 py-2.5 text-sm font-semibold text-teal-700"
          >
            Gửi yêu cầu báo giá
          </Link>
        </div>
      </section>
    </div>
  );
}
