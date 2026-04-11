"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  createServiceAction,
  deleteServiceAction,
  type ServiceActionState,
  updateServiceAction
} from "@/app/admin/(dashboard)/services/actions";
import { cn } from "@/lib/utils";

export type AdminServiceItem = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  heroTitle: string;
  heroDescription: string;
  featuredImage: string;
  mainContent: string;
  pricingTableText: string;
  faqItemsText: string;
  routeBenefitsText: string;
  pickupLocationsText: string;
  dropoffLocationsText: string;
  trustHighlightsText: string;
  legacySlugsText: string;
  canonicalUrl: string;
  relatedServiceSlugs: string[];
  sortOrder: number;
  isPublished: boolean;
  updatedAt: string;
};

type ServiceOption = {
  slug: string;
  title: string;
};

type MediaOption = {
  id: string;
  title: string;
  url: string;
};

type AdminServicesManagerProps = {
  services: AdminServiceItem[];
  serviceOptions: ServiceOption[];
  mediaOptions: MediaOption[];
  databaseReady: boolean;
};

const INITIAL_SERVICE_ACTION_STATE: ServiceActionState = {
  status: "idle",
  message: ""
};

function SubmitButton({ label, disabled }: { label: string; disabled?: boolean }) {
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
      {pending ? "Đang lưu..." : label}
    </button>
  );
}

function DeleteButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || Boolean(disabled);

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center rounded-lg border px-4 py-2.5 text-sm font-semibold transition",
        isDisabled ? "cursor-not-allowed border-slate-200 text-slate-400" : "border-rose-300 text-rose-700 hover:bg-rose-50"
      )}
    >
      {pending ? "Đang xóa..." : "Xóa dịch vụ"}
    </button>
  );
}

function ActionNotice({ state }: { state: ServiceActionState }) {
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

function ToggleButton({
  expanded,
  onClick
}: {
  expanded: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
    >
      {expanded ? "Thu gọn" : "Mở rộng"}
    </button>
  );
}

function RelatedServicesField({
  options,
  selected,
  currentSlug
}: {
  options: ServiceOption[];
  selected: string[];
  currentSlug?: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">Dịch vụ liên quan</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {options
          .filter((item) => item.slug !== currentSlug)
          .map((item) => (
            <label
              key={`related-${currentSlug ?? "new"}-${item.slug}`}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                name="relatedServiceSlugs"
                value={item.slug}
                defaultChecked={selected.includes(item.slug)}
                className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
              />
              {item.title}
            </label>
          ))}
      </div>
    </div>
  );
}

function ServiceFormFields({
  service,
  serviceOptions,
  mediaOptions
}: {
  service?: AdminServiceItem;
  serviceOptions: ServiceOption[];
  mediaOptions: MediaOption[];
}) {
  const isEdit = Boolean(service);

  return (
    <>
      {isEdit ? <input type="hidden" name="id" value={service?.id ?? ""} /> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Tiêu đề dịch vụ</span>
          <input
            name="title"
            required
            defaultValue={service?.title ?? ""}
            placeholder="Taxi Hà Nội đi Ninh Bình"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Slug (để trống sẽ tự tạo theo tiêu đề)</span>
          <input
            name="slug"
            defaultValue={service?.slug ?? ""}
            placeholder="taxi-ha-noi-ninh-binh"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          />
        </label>
      </div>

      <label className="text-sm">
        <span className="mb-1 block font-medium text-slate-700">Mô tả ngắn</span>
        <textarea
          name="shortDescription"
          required
          rows={3}
          defaultValue={service?.shortDescription ?? ""}
          placeholder="Mô tả ngắn gọn hiển thị ở trang danh sách dịch vụ."
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Meta title</span>
          <input
            name="metaTitle"
            defaultValue={service?.metaTitle ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Meta description</span>
          <input
            name="metaDescription"
            defaultValue={service?.metaDescription ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">H1</span>
          <input
            name="h1"
            defaultValue={service?.h1 ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Hero title</span>
          <input
            name="heroTitle"
            defaultValue={service?.heroTitle ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          />
        </label>
      </div>

      <label className="text-sm">
        <span className="mb-1 block font-medium text-slate-700">Hero description</span>
        <textarea
          name="heroDescription"
          rows={2}
          defaultValue={service?.heroDescription ?? ""}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
        />
      </label>

      <label className="text-sm">
        <span className="mb-1 block font-medium text-slate-700">Ảnh đại diện (URL)</span>
        <input
          name="featuredImage"
          list="service-media-options"
          defaultValue={service?.featuredImage ?? ""}
          placeholder="https://... hoặc /images/..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
        />
        <p className="mt-1 text-xs text-slate-500">Có thể dán URL từ thư viện Media hoặc link ảnh public.</p>
      </label>

      <datalist id="service-media-options">
        {mediaOptions.map((media) => (
          <option key={media.id} value={media.url}>
            {media.title}
          </option>
        ))}
      </datalist>

      <label className="text-sm">
        <span className="mb-1 block font-medium text-slate-700">Nội dung chính</span>
        <textarea
          name="mainContent"
          required
          rows={8}
          defaultValue={service?.mainContent ?? ""}
          placeholder="Nhập nội dung chi tiết. Có thể ngắt đoạn bằng dòng trống."
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Điểm đón (mỗi dòng 1 mục)</span>
          <textarea
            name="pickupLocationsText"
            rows={4}
            defaultValue={service?.pickupLocationsText ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Điểm trả (mỗi dòng 1 mục)</span>
          <textarea
            name="dropoffLocationsText"
            rows={4}
            defaultValue={service?.dropoffLocationsText ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Lợi ích tuyến (mỗi dòng 1 mục)</span>
          <textarea
            name="routeBenefitsText"
            rows={4}
            defaultValue={service?.routeBenefitsText ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Cam kết dịch vụ (mỗi dòng 1 mục)</span>
          <textarea
            name="trustHighlightsText"
            rows={4}
            defaultValue={service?.trustHighlightsText ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          />
        </label>
      </div>

      <label className="text-sm">
        <span className="mb-1 block font-medium text-slate-700">Bảng giá (mỗi dòng: Loại xe|Giá|Ghi chú)</span>
        <textarea
          name="pricingTableText"
          rows={4}
          defaultValue={service?.pricingTableText ?? ""}
          placeholder="Xe 4 chỗ|1.100.000đ/chuyến|Đón tận nơi"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
        />
      </label>

      <label className="text-sm">
        <span className="mb-1 block font-medium text-slate-700">FAQ (mỗi dòng: Câu hỏi|Câu trả lời)</span>
        <textarea
          name="faqItemsText"
          rows={5}
          defaultValue={service?.faqItemsText ?? ""}
          placeholder="Đặt xe trước bao lâu?|Bạn nên đặt trước 30-60 phút..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
        />
      </label>

      <label className="text-sm">
        <span className="mb-1 block font-medium text-slate-700">Legacy slug (mỗi dòng hoặc dấu phẩy)</span>
        <textarea
          name="legacySlugsText"
          rows={2}
          defaultValue={service?.legacySlugsText ?? ""}
          placeholder="taxi-ninh-binh-di-ha-noi, taxi-ninh-binh-ha-noi-cu"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
        />
      </label>

      <RelatedServicesField options={serviceOptions} selected={service?.relatedServiceSlugs ?? []} currentSlug={service?.slug} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Thứ tự</span>
          <input
            name="sortOrder"
            type="number"
            defaultValue={service?.sortOrder ?? 0}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block font-medium text-slate-700">Canonical URL (tùy chọn)</span>
          <input
            name="canonicalUrl"
            defaultValue={service?.canonicalUrl ?? ""}
            placeholder="/taxi-ha-noi-ninh-binh hoặc https://..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          />
        </label>
        <label className="inline-flex items-center gap-2 self-end rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700">
          <input
            name="isPublished"
            type="checkbox"
            defaultChecked={service?.isPublished ?? true}
            className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
          />
          Publish ra public
        </label>
      </div>
    </>
  );
}

function ServiceEditCard({
  item,
  databaseReady,
  serviceOptions,
  mediaOptions
}: {
  item: AdminServiceItem;
  databaseReady: boolean;
  serviceOptions: ServiceOption[];
  mediaOptions: MediaOption[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [updateState, updateAction] = useActionState(updateServiceAction, INITIAL_SERVICE_ACTION_STATE);
  const [deleteState, deleteAction] = useActionState(deleteServiceAction, INITIAL_SERVICE_ACTION_STATE);

  useEffect(() => {
    if (updateState.status === "success") {
      setExpanded(false);
    }
  }, [updateState.status]);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">{item.title}</p>
          <p className="mt-1 text-xs text-slate-500">
            Slug: <span className="font-mono">{item.slug}</span> • Cập nhật: {new Date(item.updatedAt).toLocaleString("vi-VN")}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Trạng thái:{" "}
            <span className={cn("font-semibold", item.isPublished ? "text-emerald-700" : "text-amber-700")}>
              {item.isPublished ? "Published" : "Draft"}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/${item.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Xem trang
          </a>
          <ToggleButton expanded={expanded} onClick={() => setExpanded((prev) => !prev)} />
        </div>
      </div>

      {expanded ? (
        <div className="mt-4 space-y-3 border-t border-slate-200 pt-3">
          <form action={updateAction} className="space-y-3">
            <ServiceFormFields service={item} serviceOptions={serviceOptions} mediaOptions={mediaOptions} />
            <SubmitButton label="Lưu dịch vụ" disabled={!databaseReady} />
            <ActionNotice state={updateState} />
          </form>

          <form action={deleteAction} className="border-t border-slate-200 pt-3">
            <input type="hidden" name="id" value={item.id} />
            <DeleteButton disabled={!databaseReady} />
            <ActionNotice state={deleteState} />
          </form>
        </div>
      ) : null}
    </article>
  );
}

function CreateServiceSection({
  databaseReady,
  serviceOptions,
  mediaOptions
}: {
  databaseReady: boolean;
  serviceOptions: ServiceOption[];
  mediaOptions: MediaOption[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [createState, createAction] = useActionState(createServiceAction, INITIAL_SERVICE_ACTION_STATE);

  useEffect(() => {
    if (createState.status === "success") {
      setExpanded(false);
    }
  }, [createState.status]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Tạo trang dịch vụ mới</h2>
          <p className="mt-1 text-xs text-slate-600">Tạo landing page SEO cho dịch vụ và quản lý publish ngay tại AdminCP.</p>
        </div>
        <ToggleButton expanded={expanded} onClick={() => setExpanded((prev) => !prev)} />
      </div>

      {expanded ? (
        <form action={createAction} className="mt-4 space-y-3 border-t border-slate-200 pt-3">
          <ServiceFormFields serviceOptions={serviceOptions} mediaOptions={mediaOptions} />
          <SubmitButton label="Tạo dịch vụ" disabled={!databaseReady} />
          <ActionNotice state={createState} />
        </form>
      ) : null}
    </section>
  );
}

export function AdminServicesManager({
  services,
  serviceOptions,
  mediaOptions,
  databaseReady
}: AdminServicesManagerProps) {
  return (
    <div className="space-y-4">
      {!databaseReady ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Chưa cấu hình DATABASE_URL, module đang ở chế độ chỉ xem.
        </div>
      ) : null}

      <CreateServiceSection databaseReady={databaseReady} serviceOptions={serviceOptions} mediaOptions={mediaOptions} />

      <section className="space-y-3">
        {services.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            Chưa có dịch vụ nào.
          </div>
        ) : (
          services.map((item) => (
            <ServiceEditCard
              key={item.id}
              item={item}
              databaseReady={databaseReady}
              serviceOptions={serviceOptions}
              mediaOptions={mediaOptions}
            />
          ))
        )}
      </section>
    </div>
  );
}
