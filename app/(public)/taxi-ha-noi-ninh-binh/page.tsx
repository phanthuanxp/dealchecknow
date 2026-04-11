import type { Metadata } from "next";

import { buildServiceMetadataBySlug, renderServicePageBySlug } from "@/lib/service-pages";

const SERVICE_SLUG = "taxi-ha-noi-ninh-binh";

export async function generateMetadata(): Promise<Metadata> {
  return buildServiceMetadataBySlug(SERVICE_SLUG);
}

export default async function TaxiHaNoiNinhBinhPage() {
  return renderServicePageBySlug(SERVICE_SLUG);
}
