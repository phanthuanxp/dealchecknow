import type { Metadata } from "next";
import Link from "next/link";

import { getPublishedBlogPosts } from "@/lib/blog-queries";
import { createBreadcrumbSchema, createPageMetadata, getSeoContext } from "@/lib/seo";
import { getPublicSiteSettings } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Blog Taxi Ninh Bình",
    description:
      "Blog Taxi Ninh Bình chia sẻ kinh nghiệm đi lại, cẩm nang du lịch Tam Cốc, Tràng An, Bái Đính và mẹo đặt taxi Ninh Bình đi Hà Nội, sân bay Nội Bài.",
    path: "/blog",
    keywords: [
      "blog taxi ninh bình",
      "kinh nghiệm du lịch ninh bình",
      "taxi ninh bình đi hà nội",
      "taxi ninh bình đi sân bay nội bài",
      "thuê xe du lịch ninh bình"
    ]
  });
}

function formatDate(dateInput: string | null, fallback: string) {
  const source = dateInput ?? fallback;
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    dateStyle: "medium"
  }).format(new Date(source));
}

export default async function BlogListingPage() {
  const [posts, seo, settings] = await Promise.all([
    getPublishedBlogPosts(),
    getSeoContext(),
    getPublicSiteSettings()
  ]);
  const breadcrumbSchema = createBreadcrumbSchema(seo.siteUrl, [
    { name: "Trang chủ", path: "/" },
    { name: "Blog", path: "/blog" }
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="rounded-3xl border border-teal-100 bg-white p-6 shadow-sm sm:p-10">
        <p className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
          Blog Taxi Ninh Bình
        </p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-4xl">
          Cẩm nang di chuyển và du lịch Ninh Bình
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">
          Tổng hợp bài viết giúp bạn dễ lên lịch trình, chọn tuyến xe phù hợp và tối ưu trải nghiệm khi đi Tam Cốc,
          Tràng An, Bái Đính hoặc di chuyển từ Ninh Bình đi Hà Nội, Nội Bài.
        </p>
      </section>

      {posts.length === 0 ? (
        <section className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
          Chưa có bài viết nào được publish.
        </section>
      ) : (
        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          {posts.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div
                className="h-44 w-full bg-gradient-to-br from-teal-100 to-sky-100"
                style={
                  post.coverImageUrl
                    ? {
                        backgroundImage: `url(${post.coverImageUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center"
                      }
                    : undefined
                }
                aria-label={post.title}
              />
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{post.category.name}</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">{post.title}</h2>
                {post.excerpt ? <p className="mt-2 text-sm text-slate-600">{post.excerpt}</p> : null}
                <p className="mt-3 text-xs text-slate-500">Đăng ngày {formatDate(post.publishedAt, post.createdAt)}</p>
                <Link href={`/blog/${post.slug}`} className="mt-4 inline-flex text-sm font-semibold text-teal-700 hover:underline">
                  Đọc tiếp
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}

      <section className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Cần đặt xe ngay?</h2>
        <p className="mt-2 text-sm text-slate-700">
          Liên hệ hotline hoặc nhắn Zalo để nhận báo giá nhanh cho tuyến taxi Ninh Bình của bạn.
        </p>
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
            Mở form báo giá
          </Link>
        </div>
      </section>
    </div>
  );
}
