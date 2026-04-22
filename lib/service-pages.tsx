import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { RouteLandingPage } from "@/components/public/route-landing-page";
import { createPageMetadata, getSeoContext } from "@/lib/seo";
import { getPublishedServiceBySlug, getPublishedServices, resolveServiceCanonicalPath, type ServiceListItem } from "@/lib/services";

function toKeyword(slug: string) {
  return slug.replace(/-/g, " ");
}

function buildKeywords(service: { slug: string; title: string }) {
  const keyword = toKeyword(service.slug);
  const routeTitle = service.title.toLowerCase();

  return [
    keyword,
    routeTitle,
    `dịch vụ ${keyword}`,
    `đặt xe ${keyword}`,
    "taxi ninh bình",
    "bảng giá taxi ninh bình"
  ];
}

export async function buildServiceMetadataBySlug(requestSlug: string): Promise<Metadata> {
  const service = await getPublishedServiceBySlug(requestSlug);

  if (!service) {
    return createPageMetadata({
      title: "Trang không tồn tại",
      description: "Không tìm thấy nội dung bạn yêu cầu.",
      path: `/${requestSlug}`,
      noIndex: true
    });
  }

  const seo = await getSeoContext();
  const canonicalPath = resolveServiceCanonicalPath(service);
  const canonical = canonicalPath.startsWith("http") ? canonicalPath : `${seo.siteUrl}${canonicalPath}`;
  const title = service.metaTitle?.trim() || service.title;
  const description =
    service.metaDescription?.trim() ||
    service.shortDescription?.trim() ||
    `Dịch vụ ${toKeyword(service.slug)} xe riêng, hỗ trợ 24/7 tại Taxi Ninh Bình.`;
  const imageUrl = service.featuredImage
    ? service.featuredImage.startsWith("http")
      ? service.featuredImage
      : `${seo.siteUrl}${service.featuredImage}`
    : `${seo.siteUrl}/opengraph-image.svg`;

  return {
    title,
    description,
    keywords: buildKeywords(service),
    alternates: {
      canonical
    },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      siteName: seo.siteName,
      locale: "vi_VN",
      images: [{ url: imageUrl }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl]
    }
  };
}

export async function renderServicePageBySlug(requestSlug: string) {
  const service = await getPublishedServiceBySlug(requestSlug);
  if (!service) {
    notFound();
  }

  const canonicalPath = resolveServiceCanonicalPath(service);
  const canonicalSlug = canonicalPath.startsWith("/") ? canonicalPath.replace(/^\/+/, "").split("/")[0] : "";

  if (canonicalSlug && canonicalSlug !== requestSlug) {
    permanentRedirect(canonicalPath);
  }

  if (!canonicalSlug && service.slug !== requestSlug) {
    permanentRedirect(`/${service.slug}`);
  }

  const allPublishedServices = await getPublishedServices();
  const relatedServices = allPublishedServices
    .filter((item) => item.slug !== service.slug)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const preferredRelated = service.relatedServiceSlugs
    .map((slug) => relatedServices.find((item) => item.slug === slug))
    .filter((item): item is (typeof relatedServices)[number] => Boolean(item));

  const fallbackRelated = relatedServices.filter(
    (item) => !preferredRelated.some((selected) => selected.slug === item.slug)
  );

  const combinedRelated: ServiceListItem[] = [...preferredRelated, ...fallbackRelated]
    .slice(0, 6)
    .map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      shortDescription: item.shortDescription,
      featuredImage: item.featuredImage,
      sortOrder: item.sortOrder,
      isPublished: item.isPublished,
      keyword: item.slug.replace(/-/g, " "),
      href: `/${item.slug}`,
      canonicalPath: resolveServiceCanonicalPath(item),
      updatedAt: item.updatedAt
    }));

  return <RouteLandingPage service={service} relatedServices={combinedRelated} />;
}
