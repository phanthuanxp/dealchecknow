import Link from "next/link";

import { getPublicSiteSettings } from "@/lib/site-settings";

export async function BrandPlaceholder() {
  const settings = await getPublicSiteSettings();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <section className="rounded-3xl border border-teal-100 bg-white p-6 shadow-sm sm:p-10">
        <p className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 sm:text-sm">
          Taxi Ninh Bình
        </p>
        <h1 className="mt-3 text-2xl font-bold leading-tight text-slate-900 sm:text-4xl">
          Dịch vụ taxi và xe du lịch tại Ninh Bình, hỗ trợ đặt xe 24/7
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
          Đây là trang public placeholder theo hướng mobile-first. Các trang chi tiết sẽ tiếp tục được mở
          rộng ở phase sau.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 sm:gap-3">
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

      <section id="dich-vu" className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Dịch vụ</h2>
        <p className="mt-2 text-sm text-slate-600">
          Taxi nội tỉnh, đón tiễn sân bay, xe đi điểm du lịch, xe hợp đồng theo giờ và theo chuyến.
        </p>
      </section>

      <section id="bang-gia" className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Bảng giá</h2>
        <p className="mt-2 text-sm text-slate-600">
          Báo giá minh bạch theo lộ trình và loại xe. Vui lòng liên hệ hotline để nhận giá chính xác theo
          thời điểm.
        </p>
      </section>

      <section id="gioi-thieu" className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Giới thiệu</h2>
        <p className="mt-2 text-sm text-slate-600">
          Taxi Ninh Bình tập trung vào trải nghiệm an toàn, đúng giờ và hỗ trợ nhanh qua gọi điện hoặc
          Zalo.
        </p>
      </section>
    </div>
  );
}
