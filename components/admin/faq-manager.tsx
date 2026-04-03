"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  createFaqAction,
  deleteFaqAction,
  INITIAL_FAQ_ACTION_STATE,
  updateFaqAction,
  type FaqActionState
} from "@/app/admin/(dashboard)/faq/actions";
import { cn } from "@/lib/utils";

type FaqItem = {
  id: string;
  slug: string;
  question: string;
  answer: string;
  isActive: boolean;
  sortOrder: number;
  updatedAt: string;
};

type FaqManagerProps = {
  items: FaqItem[];
  databaseReady: boolean;
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
      {pending ? "Đang xóa..." : "Xóa"}
    </button>
  );
}

function ActionNotice({ state }: { state: FaqActionState }) {
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

function FaqEditCard({ item, disabled }: { item: FaqItem; disabled: boolean }) {
  const [updateState, updateAction] = useActionState(updateFaqAction, INITIAL_FAQ_ACTION_STATE);
  const [deleteState, deleteAction] = useActionState(deleteFaqAction, INITIAL_FAQ_ACTION_STATE);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{item.question}</p>
          <p className="mt-1 text-xs text-slate-500">
            Slug: <span className="font-mono">{item.slug}</span> - Cập nhật:{" "}
            {new Date(item.updatedAt).toLocaleString("vi-VN")}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
            item.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
          )}
        >
          {item.isActive ? "Published" : "Ẩn"}
        </span>
      </div>

      <form action={updateAction} className="space-y-3">
        <input type="hidden" name="id" value={item.id} />

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Slug</span>
          <input
            name="slug"
            defaultValue={item.slug}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Câu hỏi</span>
          <input
            name="question"
            defaultValue={item.question}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Câu trả lời</span>
          <textarea
            name="answer"
            defaultValue={item.answer}
            required
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
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
            Publish ra public
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SubmitButton label="Lưu FAQ" disabled={disabled} />
        </div>

        <ActionNotice state={updateState} />
      </form>

      <form action={deleteAction} className="mt-3">
        <input type="hidden" name="id" value={item.id} />
        <DeleteButton disabled={disabled} />
        <ActionNotice state={deleteState} />
      </form>
    </article>
  );
}

export function AdminFaqManager({ items, databaseReady }: FaqManagerProps) {
  const [createState, createAction] = useActionState(createFaqAction, INITIAL_FAQ_ACTION_STATE);

  return (
    <div className="space-y-4">
      {!databaseReady ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Chưa cấu hình DATABASE_URL, module đang ở chế độ chỉ xem.
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-slate-900">Tạo FAQ mới</h2>
        <form action={createAction} className="mt-3 space-y-3">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Câu hỏi</span>
            <input
              name="question"
              required
              placeholder="Ví dụ: Tôi có thể đặt xe trước bao lâu?"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Câu trả lời</span>
            <textarea
              name="answer"
              required
              rows={4}
              placeholder="Nhập câu trả lời chi tiết..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-slate-700">Slug (tùy chọn)</span>
              <input
                name="slug"
                placeholder="de-trong-se-tu-tao-tu-cau-hoi"
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
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              name="isActive"
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
            />
            Publish ngay sau khi tạo
          </label>

          <SubmitButton label="Tạo FAQ" disabled={!databaseReady} />
          <ActionNotice state={createState} />
        </form>
      </section>

      <section className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            Chưa có FAQ nào.
          </div>
        ) : (
          items.map((item) => <FaqEditCard key={item.id} item={item} disabled={!databaseReady} />)
        )}
      </section>
    </div>
  );
}
