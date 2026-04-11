import { notFound, permanentRedirect } from "next/navigation";

import { getPublishedServiceBySlug } from "@/lib/services";

type LegacyServicePageProps = {
  params: Promise<{ legacySlug: string }>;
};

export default async function LegacyServiceRedirectPage({ params }: LegacyServicePageProps) {
  const { legacySlug } = await params;
  const service = await getPublishedServiceBySlug(legacySlug);

  if (!service) {
    notFound();
  }

  permanentRedirect(`/${service.slug}`);
}
