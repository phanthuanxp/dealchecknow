"use client";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const showDetail = process.env.NODE_ENV !== "production" && Boolean(error.message);

  return (
    <html lang="vi">
      <body>
        <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-4 py-10 sm:px-6">
          <section className="w-full rounded-3xl border border-rose-200 bg-white p-6 text-center shadow-sm sm:p-10">
            <p className="text-sm font-semibold text-rose-700">Đã xảy ra lỗi hệ thống</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Không thể tải trang vào lúc này
            </h1>
            <p className="mt-3 text-sm text-slate-600 sm:text-base">
              Vui lòng thử lại sau vài giây. Nếu lỗi vẫn tiếp diễn, hãy liên hệ quản trị viên.
            </p>
            {showDetail ? (
              <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                Chi tiết: {error.message}
              </p>
            ) : null}
            <div className="mt-6">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
              >
                Thử tải lại
              </button>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
