import Image from "next/image";
import Link from "next/link";

import type { PublicBlogCategory, PublicBlogPost } from "@/lib/blog-queries";

import { ArrowRightIcon, CalendarIcon, ChatIcon } from "./ui-icons";

type BlogTravelSectionProps = {
  posts: PublicBlogPost[];
  categories: PublicBlogCategory[];
};

type CategoryTone = {
  pillClassName: string;
  tabClassName: string;
};

const CATEGORY_TONE_BY_SLUG: Record<string, CategoryTone> = {
  "travel-guide": {
    pillClassName: "bg-sky-50 text-sky-700",
    tabClassName: "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
  },
  "taxi-tips": {
    pillClassName: "bg-emerald-50 text-emerald-700",
    tabClassName: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
  }
};

function getCategoryTone(slug: string): CategoryTone {
  return (
    CATEGORY_TONE_BY_SLUG[slug] ?? {
      pillClassName: "bg-slate-100 text-slate-700",
      tabClassName: "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
    }
  );
}

function formatDate(value: string | null, fallback: string) {
  const source = value ?? fallback;
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    dateStyle: "medium"
  }).format(new Date(source));
}

function PostCover({
  src,
  alt,
  priority = false
}: {
  src: string | null;
  alt: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={src || "/images/services/service-tour.jpg"}
      alt={alt}
      width={960}
      height={540}
      className="h-full w-full object-cover"
      priority={priority}
    />
  );
}

export function BlogTravelSection({ posts, categories }: BlogTravelSectionProps) {
  if (posts.length === 0) {
    return null;
  }

  const featuredPost = posts[0];
  const sidePosts = posts.slice(1, 5);
  const categoryTabs = categories.slice(0, 10);

  return (
    <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 text-lg font-bold text-slate-900 sm:text-xl">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-700">
            <ChatIcon className="h-3.5 w-3.5" />
          </span>
          Blog Du Lịch
        </p>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100"
        >
          Xem toàn bộ blog
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </Link>
      </div>

      {categoryTabs.length > 0 ? (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {categoryTabs.map((category) => (
            <Link
              key={category.slug}
              href={`/blog?danh-muc=${category.slug}`}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${getCategoryTone(category.slug).tabClassName}`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="mt-4 grid gap-5 lg:grid-cols-[1.45fr_1fr] lg:items-start">
        <article>
          <Link href={`/blog/${featuredPost.slug}`} className="block">
            <div className="relative h-[280px] overflow-hidden rounded-2xl bg-slate-100 sm:h-[360px] lg:h-[410px]">
              <PostCover src={featuredPost.coverImageUrl} alt={featuredPost.title} priority />
            </div>
            <div className="px-1 pt-3">
              <p
                className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${getCategoryTone(
                  featuredPost.category.slug
                ).pillClassName}`}
              >
                {featuredPost.category.name}
              </p>
              <h3 className="mt-2 text-[20px] font-bold leading-tight text-slate-900">
                {featuredPost.title}
              </h3>
              {featuredPost.excerpt ? (
                <p className="mt-2 text-sm text-slate-600 sm:text-base">{featuredPost.excerpt}</p>
              ) : null}
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
                <CalendarIcon className="h-3.5 w-3.5" />
                {formatDate(featuredPost.publishedAt, featuredPost.createdAt)}
              </p>
            </div>
          </Link>
        </article>

        <div className="space-y-4">
          {sidePosts.map((post) => (
            <article key={post.id}>
              <Link
                href={`/blog/${post.slug}`}
                className="grid grid-cols-[124px_1fr] items-center gap-3 sm:grid-cols-[142px_1fr] lg:grid-cols-[152px_1fr]"
              >
                <div className="relative h-[78px] overflow-hidden rounded-xl bg-slate-100 sm:h-[86px] lg:h-[92px]">
                  <PostCover src={post.coverImageUrl} alt={post.title} />
                </div>
                <div>
                  <p
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${getCategoryTone(
                      post.category.slug
                    ).pillClassName}`}
                  >
                    {post.category.name}
                  </p>
                  <h3 className="mt-1 text-[15px] font-semibold leading-snug text-slate-900 sm:text-[17px]">
                    {post.title}
                  </h3>
                  <p className="mt-1 inline-flex items-center gap-1 text-[10px] text-slate-500">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {formatDate(post.publishedAt, post.createdAt)}
                  </p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
