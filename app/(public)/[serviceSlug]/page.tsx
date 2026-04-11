import type { Metadata } from "next";

import { buildServiceMetadataBySlug, renderServicePageBySlug } from "@/lib/service-pages";
import { getServiceSlugsForSitemap } from "@/lib/services";

type ServiceSlugPageProps = {
  params: Promise<{ serviceSlug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getServiceSlugsForSitemap();
  return slugs.map((item) => ({
    serviceSlug: item.slug
  }));
}

export async function generateMetadata({ params }: ServiceSlugPageProps): Promise<Metadata> {
  const { serviceSlug } = await params;
  return buildServiceMetadataBySlug(serviceSlug);
}

export default async function ServiceSlugPage({ params }: ServiceSlugPageProps) {
  const { serviceSlug } = await params;
  return renderServicePageBySlug(serviceSlug);
}
