import Link from "next/link";

import { getPublicSiteSettings } from "@/lib/site-settings";

export default async function NotFoundPage() {
  const settings = await getPublicSiteSettings();

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center justify-center px-4 py-10 sm:px-6">
      <section className="w-full rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
        <p className="text-sm font-semibold text-teal-700">404 - Không tìm thấy trang</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Đường dẫn bạn truy cập không tồn tại</h1>
        <p className="mt-3 text-sm text-slate-600 sm:text-base">
          Bạn có thể quay về trang chủ, xem dịch vụ hoặc liên hệ nhanh để đặt xe ngay.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Về trang chủ
          </Link>
          <Link
            href="/dich-vu"
            className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
          >
            Xem dịch vụ
          </Link>
          <Link
            href={settings.hotlineTel}
            className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Gọi {settings.hotlineDisplay}
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
