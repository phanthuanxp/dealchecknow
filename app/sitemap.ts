import type { MetadataRoute } from "next";

import { getPublishedBlogPosts } from "@/lib/blog-queries";
import { getBaseSiteUrl } from "@/lib/seo";
import { getServiceSlugsForSitemap } from "@/lib/services";

const staticPaths = [
  "/",
  "/gioi-thieu",
  "/dich-vu",
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

  const [posts, serviceSlugs] = await Promise.all([getPublishedBlogPosts(), getServiceSlugsForSitemap()]);
  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt ?? post.createdAt),
    changeFrequency: "weekly",
    priority: 0.6
  }));

  const serviceEntries: MetadataRoute.Sitemap = serviceSlugs.map((item) => ({
    url: `${siteUrl}/${item.slug}`,
    lastModified: new Date(item.updatedAt),
    changeFrequency: "weekly",
    priority: 0.8
  }));

  return [...staticEntries, ...serviceEntries, ...blogEntries];
}
