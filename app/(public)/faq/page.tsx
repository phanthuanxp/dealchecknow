import type { Metadata } from "next";
import Link from "next/link";

import { getPublicFaqItems } from "@/lib/public-content";
import {
  createBreadcrumbSchema,
  createFaqPageSchema,
  createPageMetadata,
  getSeoContext
} from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "FAQ Taxi Ninh Bình",
    description:
      "Giải đáp câu hỏi thường gặp về dịch vụ taxi Ninh Bình, taxi Ninh Bình đi Hà Nội, đi sân bay Nội Bài, thuê xe du lịch và báo giá.",
    path: "/faq",
    keywords: [
      "faq taxi ninh bình",
      "câu hỏi thường gặp taxi ninh bình",
      "đặt xe ninh bình",
      "taxi ninh bình đi hà nội",
      "taxi ninh bình đi sân bay nội bài"
    ]
  });
}

export default async function FaqPage() {
  const [faqItems, seo] = await Promise.all([getPublicFaqItems(), getSeoContext()]);
  const faqSchema = createFaqPageSchema(
    faqItems.map((item) => ({
      question: item.question,
      answer: item.answer
    }))
  );
  const breadcrumbSchema = createBreadcrumbSchema(seo.siteUrl, [
    { name: "Trang chủ", path: "/" },
    { name: "FAQ", path: "/faq" }
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="rounded-3xl border border-teal-100 bg-white p-6 shadow-sm sm:p-10">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-4xl">Câu hỏi thường gặp</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">
          Tổng hợp các câu hỏi phổ biến trước khi đặt taxi Ninh Bình. Nếu cần hỗ trợ nhanh hơn, vui lòng gọi hotline
          hoặc nhắn Zalo để được tư vấn trực tiếp.
        </p>
      </section>

      <section className="mt-6 space-y-3">
        {faqItems.map((item) => (
          <details key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer text-sm font-semibold text-slate-900 sm:text-base">{item.question}</summary>
            <p className="mt-2 text-sm text-slate-600">{item.answer}</p>
          </details>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Trang liên quan</h2>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <Link href="/dich-vu" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline">
            Trang dịch vụ taxi Ninh Bình
          </Link>
          <Link href="/bang-gia" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline">
            Bảng giá tham khảo
          </Link>
          <Link href="/lien-he" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline">
            Thông tin liên hệ
          </Link>
          <Link href="/#bao-gia" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline">
            Gửi yêu cầu báo giá
          </Link>
        </div>
      </section>
    </div>
  );
}
