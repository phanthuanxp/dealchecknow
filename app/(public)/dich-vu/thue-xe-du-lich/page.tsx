import type { Metadata } from "next";
import Link from "next/link";

import { createBreadcrumbSchema, createPageMetadata, getSeoContext } from "@/lib/seo";
import { getPublicSiteSettings } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Thuê Xe Du Lịch Ninh Bình",
    description:
      "Dịch vụ thuê xe du lịch Ninh Bình theo ngày và theo lịch trình riêng. Phù hợp tour Tam Cốc, Tràng An, Bái Đính, Hoa Lư với tài xế thân thiện, xe sạch.",
    path: "/dich-vu/thue-xe-du-lich",
    keywords: [
      "thuê xe du lịch ninh bình",
      "xe du lịch tam cốc",
      "xe du lịch tràng an",
      "xe đi bái đính",
      "taxi du lịch ninh bình"
    ]
  });
}

export default async function ThueXeDuLichPage() {
  const [seo, settings] = await Promise.all([getSeoContext(), getPublicSiteSettings()]);
  const breadcrumbSchema = createBreadcrumbSchema(seo.siteUrl, [
    { name: "Trang chủ", path: "/" },
    { name: "Dịch vụ", path: "/dich-vu" },
    { name: "Thuê xe du lịch", path: "/dich-vu/thue-xe-du-lich" }
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="rounded-3xl border border-teal-100 bg-white p-6 shadow-sm sm:p-10">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-4xl">Thuê xe du lịch Ninh Bình theo lịch trình riêng</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">
          Dành cho gia đình, nhóm bạn và đoàn công ty cần xe linh hoạt theo điểm tham quan. Chúng tôi hỗ trợ lên lịch
          trình và sắp xếp loại xe phù hợp theo số lượng khách.
        </p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">Lịch trình gợi ý trong ngày</h2>
          <p className="mt-2 text-sm text-slate-600">
            Tam Cốc - Tràng An - Bái Đính - Hoa Lư - Hang Múa với thời gian dừng hợp lý cho từng điểm.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">Lịch trình theo yêu cầu</h2>
          <p className="mt-2 text-sm text-slate-600">
            Tùy chỉnh điểm đón, điểm trả và điểm tham quan theo nhu cầu riêng của đoàn.
          </p>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Liên kết nội bộ hữu ích</h2>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <Link href="/dich-vu" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline">
            Trang dịch vụ tổng hợp
          </Link>
          <Link href="/bang-gia" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline">
            Bảng giá tham khảo
          </Link>
          <Link href="/faq" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline">
            Câu hỏi thường gặp
          </Link>
          <Link href="/lien-he" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline">
            Trang liên hệ
          </Link>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Đặt xe du lịch nhanh</h2>
        <p className="mt-2 text-sm text-slate-700">
          Gọi ngay hotline hoặc nhắn Zalo để chúng tôi tư vấn loại xe và lịch trình tối ưu cho đoàn của bạn.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={settings.hotlineTel}
            className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Gọi ngay {settings.hotlineDisplay}
          </Link>
          <Link
            href={settings.zaloUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Chat Zalo
          </Link>
        </div>
      </section>
    </div>
  );
}
