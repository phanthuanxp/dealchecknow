import type { Metadata } from "next";

import { buildServiceMetadataBySlug, renderServicePageBySlug } from "@/lib/service-pages";

const SERVICE_SLUG = "taxi-ninh-binh-noi-bai";

export async function generateMetadata(): Promise<Metadata> {
  return buildServiceMetadataBySlug(SERVICE_SLUG);
}

export default async function TaxiNinhBinhNoiBaiPage() {
  return renderServicePageBySlug(SERVICE_SLUG);
}
