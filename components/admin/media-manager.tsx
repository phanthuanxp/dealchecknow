"use client";

import { useActionState, useState } from "react";
import type { FormEvent } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import {
  createMediaAction,
  deleteMediaAction,
  updateMediaAction,
  type MediaActionState
} from "@/app/admin/(dashboard)/media/actions";
import { cn } from "@/lib/utils";

type MediaItem = {
  id: string;
  code: string;
  title: string;
  url: string;
  altText: string | null;
  groupKey: string;
  sortOrder: number;
  isActive: boolean;
  width: number | null;
  height: number | null;
  updatedAt: string;
};

type UploadStatus = "idle" | "success" | "error";

type UploadState = {
  status: UploadStatus;
  message: string;
};

type AdminMediaManagerProps = {
  items: MediaItem[];
  databaseReady: boolean;
};

const INITIAL_MEDIA_ACTION_STATE: MediaActionState = {
  status: "idle",
  message: ""
};

const INITIAL_UPLOAD_STATE: UploadState = {
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
        isDisabled
          ? "cursor-not-allowed border-slate-200 text-slate-400"
          : "border-rose-300 text-rose-700 hover:bg-rose-50"
      )}
    >
      {pending ? "Đang xóa..." : "Xóa ảnh"}
    </button>
  );
}

function ActionNotice({ state }: { state: MediaActionState }) {
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

function UploadNotice({ state }: { state: UploadState }) {
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

function MediaEditCard({ item, disabled }: { item: MediaItem; disabled: boolean }) {
  const [updateState, updateAction] = useActionState(
    updateMediaAction,
    INITIAL_MEDIA_ACTION_STATE
  );
  const [deleteState, deleteAction] = useActionState(
    deleteMediaAction,
    INITIAL_MEDIA_ACTION_STATE
  );
  const [copied, setCopied] = useState(false);

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div>
          <div className="aspect-[16/10] overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt={item.altText ?? item.title} className="h-full w-full object-cover" />
          </div>
          <button
            type="button"
            onClick={copyUrl}
            className="mt-2 inline-flex rounded-md border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            {copied ? "Đã copy URL" : "Copy URL"}
          </button>
        </div>

        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 text-xs text-slate-500">
                Mã: <span className="font-mono">{item.code}</span> - Cập nhật:{" "}
                {new Date(item.updatedAt).toLocaleString("vi-VN")}
              </p>
            </div>
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                item.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
              )}
            >
              {item.isActive ? "Đang hoạt động" : "Đang tắt"}
            </span>
          </div>

          <form action={updateAction} className="space-y-3">
            <input type="hidden" name="id" value={item.id} />

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Tiêu đề</span>
                <input
                  name="title"
                  defaultValue={item.title}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Mã ảnh</span>
                <input
                  name="code"
                  defaultValue={item.code}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
                />
              </label>
            </div>

            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">URL ảnh</span>
              <input
                name="url"
                type="text"
                defaultValue={item.url}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Alt text</span>
              <input
                name="altText"
                defaultValue={item.altText ?? ""}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-4">
              <label className="text-sm sm:col-span-2">
                <span className="mb-1 block font-medium text-slate-700">Nhóm ảnh</span>
                <input
                  name="groupKey"
                  defaultValue={item.groupKey}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Thứ tự</span>
                <input
                  name="sortOrder"
                  type="number"
                  defaultValue={item.sortOrder}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
                />
              </label>

              <label className="inline-flex items-center gap-2 self-end rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700">
                <input
                  name="isActive"
                  type="checkbox"
                  defaultChecked={item.isActive}
                  className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
                />
                Hoạt động
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Chiều rộng (tuỳ chọn)</span>
                <input
                  name="width"
                  type="number"
                  defaultValue={item.width ?? ""}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Chiều cao (tuỳ chọn)</span>
                <input
                  name="height"
                  type="number"
                  defaultValue={item.height ?? ""}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <SubmitButton label="Lưu ảnh" disabled={disabled} />
            </div>
            <ActionNotice state={updateState} />
          </form>

          <form action={deleteAction} className="mt-3">
            <input type="hidden" name="id" value={item.id} />
            <DeleteButton disabled={disabled} />
            <ActionNotice state={deleteState} />
          </form>
        </div>
      </div>
    </article>
  );
}

export function AdminMediaManager({ items, databaseReady }: AdminMediaManagerProps) {
  const [createState, createAction] = useActionState(
    createMediaAction,
    INITIAL_MEDIA_ACTION_STATE
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>(INITIAL_UPLOAD_STATE);
  const router = useRouter();

  async function handleDirectUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!databaseReady || isUploading) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    setIsUploading(true);
    setUploadState(INITIAL_UPLOAD_STATE);

    try {
      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData
      });

      const result = (await response.json().catch(() => null)) as
        | { success?: boolean; message?: string }
        | null;

      if (!response.ok || !result?.success) {
        setUploadState({
          status: "error",
          message: result?.message ?? "Không thể tải ảnh lên. Vui lòng thử lại."
        });
        return;
      }

      form.reset();
      setUploadState({
        status: "success",
        message: result.message ?? "Đã tải ảnh lên thành công."
      });
      router.refresh();
    } catch {
      setUploadState({
        status: "error",
        message: "Không thể kết nối tới máy chủ upload. Vui lòng thử lại."
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      {!databaseReady ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Chưa cấu hình DATABASE_URL, module đang ở chế độ chỉ xem.
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-slate-900">Upload trực tiếp lên Vercel Blob</h2>
        <p className="mt-1 text-sm text-slate-600">
          Chọn file ảnh, hệ thống sẽ tự upload lên Blob và lưu metadata vào SQL ngay sau khi thành công.
        </p>

        <form onSubmit={handleDirectUpload} className="mt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">File ảnh</span>
              <input
                name="file"
                type="file"
                accept="image/*"
                required
                disabled={!databaseReady || isUploading}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition file:mr-3 file:rounded-md file:border-0 file:bg-teal-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-teal-700 focus:border-teal-600 focus:ring-2 focus:ring-teal-200 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Tiêu đề ảnh</span>
              <input
                name="title"
                required
                placeholder="Ví dụ: Banner Taxi Ninh Bình"
                disabled={!databaseReady || isUploading}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Mã ảnh (tuỳ chọn)</span>
              <input
                name="code"
                placeholder="banner-trang-chu-1"
                disabled={!databaseReady || isUploading}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Nhóm ảnh</span>
              <input
                name="groupKey"
                defaultValue="home-banners"
                disabled={!databaseReady || isUploading}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </label>
          </div>

          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Alt text</span>
            <input
              name="altText"
              placeholder="Mô tả ảnh cho SEO và accessibility"
              disabled={!databaseReady || isUploading}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-4">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Thứ tự</span>
              <input
                name="sortOrder"
                type="number"
                defaultValue={0}
                disabled={!databaseReady || isUploading}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Chiều rộng</span>
              <input
                name="width"
                type="number"
                placeholder="1200"
                disabled={!databaseReady || isUploading}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Chiều cao</span>
              <input
                name="height"
                type="number"
                placeholder="630"
                disabled={!databaseReady || isUploading}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </label>
            <label className="inline-flex items-center gap-2 self-end rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700">
              <input
                name="isActive"
                type="checkbox"
                defaultChecked
                disabled={!databaseReady || isUploading}
                className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
              />
              Hoạt động
            </label>
          </div>

          <button
            type="submit"
            disabled={!databaseReady || isUploading}
            className={cn(
              "inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition",
              !databaseReady || isUploading
                ? "cursor-not-allowed bg-slate-400"
                : "bg-indigo-600 hover:bg-indigo-700"
            )}
          >
            {isUploading ? "Đang upload..." : "Upload ảnh trực tiếp"}
          </button>

          <p className="text-xs text-slate-500">
            Hỗ trợ ảnh tối đa 8MB mỗi lần tải. Nếu báo thiếu token Blob, cần cấu hình biến môi trường
            <code className="ml-1 rounded bg-slate-100 px-1 py-0.5">BLOB_READ_WRITE_TOKEN</code>.
          </p>

          <UploadNotice state={uploadState} />
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-slate-900">Thêm ảnh bằng URL (thủ công)</h2>
        <form action={createAction} className="mt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Tiêu đề ảnh</span>
              <input
                name="title"
                required
                placeholder="Ví dụ: Banner taxi Ninh Bình 1"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Mã ảnh (tuỳ chọn)</span>
              <input
                name="code"
                placeholder="banner-taxi-ninh-binh-1"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>
          </div>

          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">URL ảnh</span>
            <input
              name="url"
              required
              placeholder="https://... hoặc /images/..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Alt text</span>
            <input
              name="altText"
              placeholder="Mô tả ảnh cho SEO và accessibility"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-4">
            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-slate-700">Nhóm ảnh</span>
              <input
                name="groupKey"
                defaultValue="home-banners"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Thứ tự</span>
              <input
                name="sortOrder"
                type="number"
                defaultValue={0}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>

            <label className="inline-flex items-center gap-2 self-end rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700">
              <input
                name="isActive"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
              />
              Hoạt động
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Chiều rộng (tuỳ chọn)</span>
              <input
                name="width"
                type="number"
                placeholder="1200"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Chiều cao (tuỳ chọn)</span>
              <input
                name="height"
                type="number"
                placeholder="630"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>
          </div>

          <SubmitButton label="Thêm vào thư viện ảnh" disabled={!databaseReady} />
          <ActionNotice state={createState} />
        </form>
      </section>

      <section className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            Chưa có ảnh nào trong thư viện.
          </div>
        ) : (
          items.map((item) => (
            <MediaEditCard key={item.id} item={item} disabled={!databaseReady} />
          ))
        )}
      </section>
    </div>
  );
}
