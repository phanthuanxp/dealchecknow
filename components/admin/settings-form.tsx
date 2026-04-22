"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  updateSiteSettingsAction,
  type SettingsActionState
} from "@/app/admin/(dashboard)/settings/actions";
import { cn } from "@/lib/utils";

type SettingsFormData = {
  siteName: string;
  siteDomain: string;
  siteTagline: string;
  hotlineValue: string;
  hotlineDisplay: string;
  email: string;
  zaloNumber: string;
  servicePricingImageUrl: string;
  servicePricingImageAlt: string;
};

type AdminSettingsFormProps = {
  defaultValues: SettingsFormData;
  databaseReady: boolean;
};

const INITIAL_SETTINGS_ACTION_STATE: SettingsActionState = {
  status: "idle",
  message: ""
};

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || Boolean(disabled);

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition",
        isDisabled ? "cursor-not-allowed bg-slate-400" : "bg-teal-700 hover:bg-teal-800"
      )}
    >
      {pending ? "Đang lưu..." : "Lưu cài đặt"}
    </button>
  );
}

function ActionNotice({ state }: { state: SettingsActionState }) {
  if (state.status === "idle" || !state.message) {
    return null;
  }

  return (
    <p
      className={cn(
        "mt-3 rounded-lg border px-3 py-2 text-sm",
        state.status === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-rose-200 bg-rose-50 text-rose-700"
      )}
    >
      {state.message}
    </p>
  );
}

export function AdminSettingsForm({ defaultValues, databaseReady }: AdminSettingsFormProps) {
  const [state, formAction] = useActionState(updateSiteSettingsAction, INITIAL_SETTINGS_ACTION_STATE);

  return (
    <div className="space-y-4">
      {!databaseReady ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Chưa cấu hình DATABASE_URL, module đang ở chế độ chỉ xem.
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Thông tin website & liên hệ</h2>

        <form action={formAction} className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Tên website</span>
              <input
                name="siteName"
                defaultValue={defaultValues.siteName}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Tên miền</span>
              <input
                name="siteDomain"
                defaultValue={defaultValues.siteDomain}
                required
                placeholder="taxininhbinh.com"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>
          </div>

          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Khẩu hiệu</span>
            <input
              name="siteTagline"
              defaultValue={defaultValues.siteTagline}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Hotline (giá trị chuẩn)</span>
              <input
                name="hotlineValue"
                defaultValue={defaultValues.hotlineValue}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Hotline hiển thị</span>
              <input
                name="hotlineDisplay"
                defaultValue={defaultValues.hotlineDisplay}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Email hỗ trợ</span>
              <input
                name="email"
                type="email"
                defaultValue={defaultValues.email}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Số Zalo</span>
              <input
                name="zaloNumber"
                defaultValue={defaultValues.zaloNumber}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900">Ảnh minh họa bảng giá trang dịch vụ</h3>
            <p className="mt-1 text-xs text-slate-600">
              Tải ảnh tại <span className="font-semibold">/admincp/media</span>, sau đó dán URL vào đây để hiển thị cho
              block bảng giá trên tất cả trang dịch vụ.
            </p>
            <div className="mt-2">
              <Link
                href="/admincp/media"
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Mở thư viện ảnh
              </Link>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">URL ảnh bảng giá dịch vụ</span>
                <input
                  name="servicePricingImageUrl"
                  type="url"
                  defaultValue={defaultValues.servicePricingImageUrl}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Mô tả ảnh (ALT)</span>
                <input
                  name="servicePricingImageAlt"
                  defaultValue={defaultValues.servicePricingImageAlt}
                  placeholder="Ảnh xe taxi phục vụ chuyến tuyến..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
                />
              </label>
            </div>

            {defaultValues.servicePricingImageUrl ? (
              <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                <p className="mb-2 text-xs font-semibold text-slate-700">Ảnh hiện tại</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={defaultValues.servicePricingImageUrl}
                  alt={defaultValues.servicePricingImageAlt || "Ảnh bảng giá dịch vụ"}
                  className="h-32 w-full rounded-md border border-slate-200 object-cover sm:h-40"
                />
              </div>
            ) : null}
          </div>

          <SubmitButton disabled={!databaseReady} />
          <ActionNotice state={state} />
        </form>
      </section>
    </div>
  );
}
