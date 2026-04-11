import type { Metadata } from "next";

import { buildServiceMetadataBySlug, renderServicePageBySlug } from "@/lib/service-pages";

const SERVICE_SLUG = "taxi-ninh-binh-ha-noi";

export async function generateMetadata(): Promise<Metadata> {
  return buildServiceMetadataBySlug(SERVICE_SLUG);
}

export default async function TaxiNinhBinhHaNoiPage() {
  return renderServicePageBySlug(SERVICE_SLUG);
}
