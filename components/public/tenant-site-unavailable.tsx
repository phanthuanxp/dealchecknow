import Link from "next/link";

import { getPublicSiteSettings } from "@/lib/site-settings";
import type { TenantRuntimeState } from "@/lib/tenant-lifecycle";

function getMessageByStatus(status: TenantRuntimeState["status"]) {
  if (status === "expired") {
    return {
      title: "Website này đã hết hạn hoạt động",
      description:
        "Tên miền vẫn đang trỏ về hệ thống CMS, nhưng gói hoạt động của website đã hết hạn. Vui lòng liên hệ quản trị để gia hạn và mở lại website."
    };
  }

  if (status === "paused") {
    return {
      title: "Website đang tạm dừng",
      description:
        "Website này đang ở trạng thái tạm dừng theo cấu hình quản trị. Vui lòng quay lại sau hoặc liên hệ hotline để được hỗ trợ."
    };
  }

  return {
    title: "Website hiện chưa sẵn sàng",
    description:
      "Tên miền đang được cấu hình nhưng chưa có website hoạt động tương ứng. Vui lòng liên hệ quản trị để được hỗ trợ."
  };
}

type TenantSiteUnavailableProps = {
  state: TenantRuntimeState;
};

export async function TenantSiteUnavailable({ state }: TenantSiteUnavailableProps) {
  const settings = await getPublicSiteSettings();
  const content = getMessageByStatus(state.status);

  return (
    <main className="mx-auto flex min-h-screen w-[90%] items-center justify-center py-10">
      <section className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <p className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          CMS 30NICE • Trạng thái website
        </p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">{content.title}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">{content.description}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a
            href={settings.hotlineTel}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Gọi hotline {settings.hotlineDisplay}
          </a>
          <a
            href={settings.zaloUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-sky-300 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
          >
            Nhắn Zalo hỗ trợ
          </a>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left text-sm text-slate-600">
          <p>
            <span className="font-semibold text-slate-800">Domain hiện tại:</span> {state.host || "Không xác định"}
          </p>
          <p className="mt-1">
            <span className="font-semibold text-slate-800">Website:</span>{" "}
            {state.tenant ? `${state.tenant.name} (${state.tenant.slug})` : "Chưa gán tenant"}
          </p>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Nếu bạn là quản trị viên, hãy vào{" "}
          <Link href="/admincp/websites" className="font-semibold text-teal-700 hover:underline">
            AdminCP › Website
          </Link>{" "}
          để cập nhật trạng thái hoạt động.
        </p>
      </section>
    </main>
  );
}
