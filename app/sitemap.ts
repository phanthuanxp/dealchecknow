import type { MetadataRoute } from "next";

import { getPublishedBlogPosts } from "@/lib/blog-queries";
import { getBaseSiteUrl } from "@/lib/seo";

const staticPaths = [
  "/",
  "/gioi-thieu",
  "/dich-vu",
  "/dich-vu/taxi-ninh-binh-di-ha-noi",
  "/dich-vu/taxi-ninh-binh-di-san-bay-noi-bai",
  "/dich-vu/taxi-duong-dai",
  "/dich-vu/thue-xe-du-lich",
  "/bang-gia",
  "/lien-he",
  "/faq",
  "/blog",
  "/chinh-sach-bao-mat",
  "/dieu-khoan-su-dung"
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getBaseSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: path === "/" ? siteUrl : `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7
  }));

  const posts = await getPublishedBlogPosts();
  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt ?? post.createdAt),
    changeFrequency: "weekly",
    priority: 0.6
  }));

  return [...staticEntries, ...blogEntries];
}
