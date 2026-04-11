import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ChatIcon, PhoneCallIcon, RouteIcon } from "@/components/public/ui-icons";
import { getPublishedBlogPosts } from "@/lib/blog-queries";
import { createBreadcrumbSchema, createPageMetadata, getSeoContext } from "@/lib/seo";
import { getPublicSiteSettings } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Blog Taxi Ninh Bình - Kinh Nghiệm Đặt Xe Và Du Lịch",
    description:
      "Blog Taxi Ninh Bình chia sẻ kinh nghiệm đi lại, lịch trình Tam Cốc - Tràng An - Bái Đính và mẹo đặt xe cho các tuyến Ninh Bình, Hà Nội, Nội Bài.",
    path: "/blog",
    keywords: [
      "blog taxi ninh bình",
      "kinh nghiệm du lịch ninh bình",
      "mẹo đặt xe ninh bình",
      "taxi ninh bình hà nội",
      "taxi ninh bình nội bài"
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
    <div className="mx-auto w-[90%] py-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="rounded-3xl border border-teal-100 bg-white p-6 shadow-sm sm:p-10">
        <p className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
          <RouteIcon className="h-3.5 w-3.5" />
          Blog Taxi Ninh Bình
        </p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-4xl">Cẩm nang di chuyển và du lịch Ninh Bình</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">
          Tổng hợp bài viết thực tế giúp bạn chọn tuyến xe phù hợp, lên lịch trình tham quan tối ưu và chủ động chi phí khi đi Ninh Bình.
        </p>
        <Image
          src="/images/services/service-tour.jpg"
          alt="Blog chia sẻ kinh nghiệm đặt taxi và du lịch Ninh Bình"
          width={1200}
          height={630}
          className="mt-5 h-48 w-full rounded-2xl border border-teal-100 object-cover sm:h-64"
          priority
        />
      </section>

      {posts.length === 0 ? (
        <section className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
          Hiện chưa có bài viết công khai. Bạn có thể quay lại sau hoặc liên hệ hotline để được tư vấn tuyến đi phù hợp.
        </section>
      ) : (
        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          {posts.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div
                className="h-48 w-full bg-gradient-to-br from-teal-100 to-sky-100"
                style={
                  post.coverImageUrl
                    ? {
                        backgroundImage: `url(${post.coverImageUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center"
                      }
                    : {
                        backgroundImage: "url('/images/services/service-tour.jpg')",
                        backgroundSize: "cover",
                        backgroundPosition: "center"
                      }
                }
                aria-label={post.title}
              />
              <div className="p-5">
                <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
                  <ChatIcon className="h-3.5 w-3.5" />
                  {post.category.name}
                </p>
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
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Cần đặt xe nhanh?</h2>
        <p className="mt-2 text-sm text-slate-700">
          Liên hệ ngay để nhận tư vấn trực tiếp cho các tuyến phổ biến và cập nhật bảng giá taxi ninh bình theo lộ trình của bạn.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={settings.hotlineTel}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <PhoneCallIcon className="h-4 w-4" />
            Gọi {settings.hotlineDisplay}
          </Link>
          <Link
            href={settings.zaloUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <ChatIcon className="h-4 w-4" />
            Chat Zalo
          </Link>
          <Link
            href="/bang-gia"
            className="inline-flex items-center rounded-lg border border-teal-300 bg-white px-4 py-2.5 text-sm font-semibold text-teal-700"
          >
            Xem bảng giá taxi ninh bình
          </Link>
        </div>
      </section>
    </div>
  );
}
