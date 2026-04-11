import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ChatIcon, CheckCircleIcon, RouteIcon } from "@/components/public/ui-icons";
import { getPublicFaqItems } from "@/lib/public-content";
import {
  createBreadcrumbSchema,
  createFaqPageSchema,
  createPageMetadata,
  getSeoContext
} from "@/lib/seo";

function localizeFaq(item: { id: string; question: string; answer: string; slug: string }) {
  if (item.slug === "how-to-book") {
    return {
      ...item,
      question: "Làm sao để đặt taxi nhanh?",
      answer: "Bạn có thể gọi hotline 0345 07 6789, nhắn Zalo hoặc gửi form báo giá trên website để được xác nhận chuyến sớm."
    };
  }

  if (item.slug === "payment-methods") {
    return {
      ...item,
      question: "Taxi Ninh Bình hỗ trợ thanh toán như thế nào?",
      answer: "Chúng tôi hỗ trợ tiền mặt, chuyển khoản và một số hình thức ví điện tử theo xác nhận của điều phối."
    };
  }

  if (item.slug === "cancelation-policy") {
    return {
      ...item,
      question: "Có thể hủy hoặc đổi lịch chuyến đã đặt không?",
      answer: "Có. Bạn vui lòng báo sớm để được hỗ trợ đổi lịch. Một số tuyến xa hoặc giờ cao điểm có thể áp dụng điều kiện riêng."
    };
  }

  return item;
}

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "FAQ Taxi Ninh Bình - Câu Hỏi Thường Gặp",
    description:
      "Giải đáp câu hỏi thường gặp về taxi ninh bình, đặt xe đi Hà Nội, đi Nội Bài, thuê xe du lịch, báo giá và xác nhận chuyến.",
    path: "/faq",
    keywords: [
      "faq taxi ninh bình",
      "câu hỏi thường gặp taxi ninh bình",
      "đặt xe ninh bình",
      "taxi ninh bình hà nội",
      "taxi ninh bình nội bài"
    ]
  });
}

export default async function FaqPage() {
  const [faqItemsRaw, seo] = await Promise.all([getPublicFaqItems(), getSeoContext()]);
  const faqItems = faqItemsRaw.map(localizeFaq);

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
    <div className="mx-auto w-[90%] py-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="rounded-3xl border border-teal-100 bg-white p-6 shadow-sm sm:p-10">
        <p className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
          <ChatIcon className="h-3.5 w-3.5" />
          Hỗ trợ nhanh
        </p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-4xl">Các câu hỏi thường gặp về dịch vụ Taxi Ninh Bình</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">
          Trang này tổng hợp những thắc mắc phổ biến trước khi đặt xe. Nếu bạn cần xác nhận nhanh theo lịch trình cụ thể, hãy gọi hotline
          hoặc nhắn Zalo để đội điều phối hỗ trợ trực tiếp.
        </p>
        <Image
          src="/images/services/service-tour.jpg"
          alt="Câu hỏi thường gặp về taxi và xe du lịch tại Ninh Bình"
          width={1200}
          height={630}
          className="mt-5 h-48 w-full rounded-2xl border border-teal-100 object-cover sm:h-64"
          priority
        />
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
        <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900 sm:text-xl">
          <RouteIcon className="h-5 w-5 text-teal-700" />
          Trang liên quan
        </h2>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <Link href="/taxi-ha-noi-ninh-binh" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline">
            taxi hà nội ninh bình
          </Link>
          <Link href="/taxi-noi-bai-ninh-binh" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline">
            taxi nội bài ninh bình
          </Link>
          <Link href="/taxi-ninh-binh-ha-noi" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline">
            taxi ninh bình hà nội
          </Link>
          <Link href="/taxi-ninh-binh-noi-bai" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline">
            taxi ninh bình nội bài
          </Link>
          <Link href="/bang-gia" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline">
            bảng giá taxi ninh bình
          </Link>
        </div>
        <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-slate-500">
          <CheckCircleIcon className="h-3.5 w-3.5 text-teal-600" />
          Nội dung FAQ được rà soát định kỳ theo lịch vận hành thực tế.
        </p>
      </section>
    </div>
  );
}
