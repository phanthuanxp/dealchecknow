import type { Metadata } from "next";

import { buildServiceMetadataBySlug, renderServicePageBySlug } from "@/lib/service-pages";

const SERVICE_SLUG = "taxi-noi-bai-ninh-binh";

export async function generateMetadata(): Promise<Metadata> {
  return buildServiceMetadataBySlug(SERVICE_SLUG);
}

export default async function TaxiNoiBaiNinhBinhPage() {
  return renderServicePageBySlug(SERVICE_SLUG);
}
