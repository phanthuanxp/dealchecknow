import Link from "next/link";

import {
  ArrowRightIcon,
  ChatIcon,
  CheckCircleIcon,
  PhoneCallIcon,
  RouteIcon,
  ShieldCheckIcon,
  StarIcon
} from "@/components/public/ui-icons";
import {
  resolveServiceCanonicalPath,
  type PublicServicePage,
  type ServiceFaqRow,
  type ServiceListItem,
  type ServicePricingRow
} from "@/lib/services";
import {
  createBreadcrumbSchema,
  createFaqPageSchema,
  createLocalBusinessSchema,
  createOrganizationSchema,
  getSeoContext
} from "@/lib/seo";
import { getPublicSiteSettings } from "@/lib/site-settings";

type RouteLandingPageProps = {
  service: PublicServicePage;
  relatedServices: ServiceListItem[];
};

function toKeyword(slug: string) {
  return slug.replace(/-/g, " ");
}

function parseMainContent(content: string) {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

function ensureRichParagraphs(
  paragraphs: string[],
  serviceTitle: string,
  keyword: string,
  pickup: string,
  dropoff: string
) {
  const fallbackParagraphs = [
    `${serviceTitle} được tối ưu cho nhu cầu đi đúng giờ, xe riêng, không ghép khách và hỗ trợ xác nhận lịch nhanh qua hotline.`,
    `Với tuyến ${keyword}, đội xe có thể đón linh hoạt tại ${pickup} và trả khách tại ${dropoff}, phù hợp cả khách gia đình, khách công tác và khách du lịch.`,
    `Mỗi chuyến đều được báo giá trước khi khởi hành để khách chủ động ngân sách và chọn loại xe phù hợp theo số người, hành lý và thời gian di chuyển.`,
    `Nếu cần đổi giờ hoặc điều chỉnh điểm đón trả trong quá trình chuẩn bị chuyến, bạn chỉ cần liên hệ tổng đài để được hỗ trợ nhanh và minh bạch.`
  ];

  const base = paragraphs.length > 0 ? paragraphs : fallbackParagraphs.slice(0, 2);

  if (base.length >= 4) {
    return base;
  }

  const missingCount = 4 - base.length;
  return [...base, ...fallbackParagraphs.slice(0, missingCount)];
}

function getPricingRows(rows: ServicePricingRow[]) {
  if (rows.length > 0) {
    return rows;
  }

  return [
    { vehicle: "Xe 4 chỗ", price: "Liên hệ", note: "Đón tận nơi, xe riêng" },
    { vehicle: "Xe 7 chỗ", price: "Liên hệ", note: "Phù hợp nhóm gia đình" },
    { vehicle: "Xe 16 chỗ", price: "Liên hệ", note: "Phù hợp khách đoàn" }
  ];
}

function ensureFaqRows(
  rows: ServiceFaqRow[],
  serviceTitle: string,
  pickup: string,
  dropoff: string
) {
  const fallbackRows: ServiceFaqRow[] = [
    {
      question: `Đặt ${serviceTitle.toLowerCase()} trước bao lâu thì có xe?`,
      answer:
        "Khung thường nên đặt trước 30-60 phút. Với giờ cao điểm, sáng sớm hoặc chuyến đêm, bạn nên đặt sớm hơn để giữ xe chắc chắn."
    },
    {
      question: `Tuyến từ ${pickup} đến ${dropoff} mất khoảng bao lâu?`,
      answer:
        "Thời gian di chuyển phụ thuộc điểm đón cụ thể và tình hình giao thông. Tổng đài sẽ tư vấn thời gian dự kiến khi xác nhận chuyến."
    },
    {
      question: "Giá đã gồm phí cầu đường và bến bãi chưa?",
      answer:
        "Giá chi tiết sẽ được báo rõ trước chuyến đi, gồm các khoản chính theo lộ trình thực tế để bạn chủ động quyết định."
    },
    {
      question: "Có hỗ trợ xuất hóa đơn VAT không?",
      answer:
        "Có. Bạn chỉ cần bật yêu cầu xuất hóa đơn trong form đặt xe hoặc thông báo trực tiếp cho tổng đài khi xác nhận chuyến."
    },
    {
      question: "Tôi có thể đổi điểm đón/trả sau khi đặt không?",
      answer:
        "Có thể. Vui lòng thông báo sớm để điều phối cập nhật lộ trình và báo lại chi phí phù hợp nếu có thay đổi."
    }
  ];

  const normalized = rows.filter((item) => item.question.trim() && item.answer.trim());
  if (normalized.length >= 5) {
    return normalized;
  }

  const questionSet = new Set(normalized.map((item) => item.question.toLowerCase().trim()));
  const merged = [...normalized];

  for (const item of fallbackRows) {
    const key = item.question.toLowerCase().trim();
    if (questionSet.has(key)) {
      continue;
    }
    merged.push(item);
    questionSet.add(key);
    if (merged.length >= 5) {
      break;
    }
  }

  return merged;
}

function toTextList(items: string[], fallback: string[]) {
  return items.length > 0 ? items : fallback;
}

function createFallbackReviews(serviceTitle: string, pickup: string, dropoff: string) {
  return [
    {
      customer: "Anh Minh",
      route: `${pickup} ↔ ${dropoff}`,
      content: `${serviceTitle} đúng giờ, tài xế hỗ trợ hành lý nhiệt tình và lái xe an toàn.`
    },
    {
      customer: "Chị Hương",
      route: `${pickup} ↔ ${dropoff}`,
      content: "Gia đình đi có trẻ nhỏ vẫn rất thoải mái, xe sạch và tổng đài phản hồi nhanh."
    },
    {
      customer: "Anh Quân",
      route: `${pickup} ↔ ${dropoff}`,
      content: "Giá báo trước rõ ràng, lộ trình minh bạch và không có phát sinh bất ngờ."
    }
  ];
}

function parsePriceNumber(priceText: string) {
  const digits = priceText.replace(/[^\d]/g, "");
  if (!digits) {
    return null;
  }

  const value = Number(digits);
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  return value;
}

export async function RouteLandingPage({ service, relatedServices }: RouteLandingPageProps) {
  const [seo, settings] = await Promise.all([getSeoContext(), getPublicSiteSettings()]);

  const keyword = toKeyword(service.slug);
  const canonicalPath = resolveServiceCanonicalPath(service);
  const canonicalUrl = `${seo.siteUrl}${canonicalPath}`;

  const pickupLocations = toTextList(service.pickupLocations, ["TP Ninh Bình", "Tam Cốc", "Tràng An"]);
  const dropoffLocations = toTextList(service.dropoffLocations, ["Hà Nội", "Sân bay Nội Bài", "Bái Đính"]);
  const trustHighlights = toTextList(service.trustHighlights, [
    "Xe riêng, không ghép khách",
    "Xác nhận lịch nhanh và hỗ trợ 24/7",
    "Giá minh bạch theo từng tuyến"
  ]);
  const routeBenefits = toTextList(service.routeBenefits, [
    "Lái xe thân thiện, hỗ trợ hành lý",
    "Đón trả tận nơi theo lịch đặt",
    "Theo dõi lộ trình và xác nhận trước chuyến"
  ]);

  const pricingRows = getPricingRows(service.pricingTable);
  const faqRows = ensureFaqRows(service.faqItems, service.title, pickupLocations[0], dropoffLocations[0]);
  const rawParagraphs = parseMainContent(service.mainContent);
  const mainContentParagraphs = ensureRichParagraphs(
    rawParagraphs,
    service.title,
    keyword,
    pickupLocations[0],
    dropoffLocations[0]
  );

  const reviewSeed = createFallbackReviews(service.title, pickupLocations[0], dropoffLocations[0]);
  const marqueeReviews = [...reviewSeed, ...reviewSeed, ...reviewSeed];

  const breadcrumbSchema = createBreadcrumbSchema(seo.siteUrl, [
    { name: "Trang chủ", path: "/" },
    { name: "Dịch vụ", path: "/dich-vu" },
    { name: service.title, path: canonicalPath }
  ]);

  const faqSchema = createFaqPageSchema(
    faqRows.map((item) => ({
      question: item.question,
      answer: item.answer
    }))
  );

  const localBusinessSchema = createLocalBusinessSchema(seo);
  const organizationSchema = createOrganizationSchema(seo);
  const taxiServiceSchema = {
    "@context": "https://schema.org",
    "@type": "TaxiService",
    "@id": `${canonicalUrl}#taxi-service`,
    name: service.title,
    url: canonicalUrl,
    description: service.metaDescription || service.shortDescription,
    areaServed: seo.serviceArea,
    provider: {
      "@id": `${seo.siteUrl}#organization`
    },
    serviceType: keyword,
    offers: pricingRows
      .map((item) => {
        const numericPrice = parsePriceNumber(item.price);
        if (!numericPrice) {
          return null;
        }

        return {
          "@type": "Offer",
          name: `${service.title} - ${item.vehicle}`,
          priceCurrency: "VND",
          price: numericPrice,
          url: canonicalUrl
        };
      })
      .filter(Boolean)
  };

  return (
    <div className="mx-auto w-[90%] py-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(taxiServiceSchema) }} />

      <section className="rounded-3xl border border-teal-100 bg-white p-6 shadow-sm sm:p-10">
        <p className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
          <RouteIcon className="h-3.5 w-3.5" />
          Dịch vụ {keyword}
        </p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-4xl">{service.h1}</h1>
        <p className="mt-3 max-w-4xl text-sm text-slate-600 sm:text-base">{service.heroDescription}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={settings.hotlineTel}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <PhoneCallIcon className="h-4 w-4" />
            Gọi đặt xe {settings.hotlineDisplay}
          </Link>
          <Link
            href={settings.zaloUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <ChatIcon className="h-4 w-4" />
            Nhận báo giá qua Zalo
          </Link>
          <Link
            href="/bang-gia"
            className="inline-flex items-center gap-2 rounded-lg border border-teal-300 bg-white px-4 py-2.5 text-sm font-semibold text-teal-700"
          >
            Xem bảng giá taxi Ninh Bình
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Bảng giá tham khảo theo loại xe</h2>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold sm:text-sm">
            <p className="text-amber-700">👉 Bảng giá chỉ mang tính chất tham khảo</p>
            <p className="text-emerald-700">👉 Gọi ngay để nhận được báo giá tốt nhất</p>
          </div>

          <div className="mt-3 space-y-2 md:hidden">
            {pricingRows.map((item) => (
              <div key={`${service.id}-pricing-mobile-${item.vehicle}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-900">{item.vehicle}</p>
                <p className="mt-1 text-base font-bold text-teal-700">{item.price}</p>
                <p className="mt-1 text-xs text-slate-600">{item.note || "Liên hệ để xác nhận chi tiết"}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 hidden md:block overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-800">Loại xe</th>
                  <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-800">Giá tham khảo</th>
                  <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-800">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {pricingRows.map((item) => (
                  <tr key={`${service.id}-pricing-${item.vehicle}`}>
                    <td className="border border-slate-200 px-3 py-2 text-slate-700">{item.vehicle}</td>
                    <td className="border border-slate-200 px-3 py-2 font-semibold text-teal-700">{item.price}</td>
                    <td className="border border-slate-200 px-3 py-2 text-slate-600">{item.note || "Liên hệ để xác nhận chi tiết"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Ưu điểm khi đặt tuyến này</h2>
          <ul className="mt-3 space-y-2">
            {routeBenefits.map((item) => (
              <li
                key={`${service.id}-benefit-${item}`}
                className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700"
              >
                <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Thông tin chi tiết tuyến {keyword}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-700">{service.shortDescription}</p>
        <div className="mt-4 space-y-3">
          {mainContentParagraphs.map((paragraph, index) => (
            <p key={`${service.id}-paragraph-${index}`} className="text-sm leading-7 text-slate-700">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
            <ShieldCheckIcon className="h-5 w-5 text-teal-700" />
            Cam kết dịch vụ
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {trustHighlights.map((item) => (
              <li key={`${service.id}-trust-${item}`} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
            <StarIcon className="h-5 w-5 text-amber-500" />
            Đánh giá khách hàng theo tuyến
          </h2>
          <div className="route-reviews-marquee-mask mt-3 h-[352px] overflow-hidden rounded-xl bg-slate-50 p-2">
            <div className="route-reviews-marquee-track">
              {marqueeReviews.map((item, index) => (
                <div key={`${service.id}-review-${item.customer}-${index}`} className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-sm font-semibold text-slate-900">{item.customer}</p>
                  <p className="text-xs font-medium text-teal-700">{item.route}</p>
                  <p className="mt-1 text-sm text-slate-700">“{item.content}”</p>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Câu hỏi thường gặp cho tuyến {keyword}</h2>
          <div className="mt-3 space-y-2">
            {faqRows.map((item) => (
              <details key={`${service.id}-faq-${item.question}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <summary className="cursor-pointer text-sm font-semibold text-slate-900">{item.question}</summary>
                <p className="mt-2 text-sm text-slate-700">{item.answer}</p>
              </details>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Liên kết hữu ích</h2>
          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            {relatedServices.map((item) => (
              <Link
                key={`${service.id}-related-${item.slug}`}
                href={item.href}
                className="rounded-lg border border-teal-200 bg-white px-3 py-2 text-teal-700 hover:underline"
              >
                Xem {item.title.toLowerCase()}
              </Link>
            ))}
            <Link href="/bang-gia" className="rounded-lg border border-teal-200 bg-white px-3 py-2 text-teal-700 hover:underline">
              Bảng giá taxi Ninh Bình mới nhất
            </Link>
            <Link href="/lien-he" className="rounded-lg border border-teal-200 bg-white px-3 py-2 text-teal-700 hover:underline">
              Liên hệ đặt xe nhanh
            </Link>
            <Link href="/#bao-gia" className="rounded-lg border border-teal-200 bg-white px-3 py-2 text-teal-700 hover:underline">
              Gửi form nhận báo giá
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
