"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
  type CategoryActionState
} from "@/app/admin/(dashboard)/categories/actions";
import { cn } from "@/lib/utils";

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  postCount: number;
  updatedAt: string;
};

type CategoriesManagerProps = {
  items: CategoryItem[];
  databaseReady: boolean;
};

const INITIAL_CATEGORY_ACTION_STATE: CategoryActionState = {
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
      {pending ? "Đang xóa..." : "Xóa"}
    </button>
  );
}

function ActionNotice({ state }: { state: CategoryActionState }) {
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

function CategoryEditCard({ item, disabled }: { item: CategoryItem; disabled: boolean }) {
  const [updateState, updateAction] = useActionState(updateCategoryAction, INITIAL_CATEGORY_ACTION_STATE);
  const [deleteState, deleteAction] = useActionState(deleteCategoryAction, INITIAL_CATEGORY_ACTION_STATE);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">{item.name}</p>
          <p className="mt-1 text-xs text-slate-500">
            Slug: <span className="font-mono">{item.slug}</span> - {item.postCount} bài viết
          </p>
        </div>
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
            item.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
          )}
        >
          {item.isActive ? "Đang hiển thị" : "Đang ẩn"}
        </span>
      </div>

      <form action={updateAction} className="space-y-3">
        <input type="hidden" name="id" value={item.id} />

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Tên danh mục</span>
            <input
              name="name"
              defaultValue={item.name}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Slug</span>
            <input
              name="slug"
              defaultValue={item.slug}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            />
          </label>
        </div>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Mô tả (tuỳ chọn)</span>
          <textarea
            name="description"
            defaultValue={item.description}
            rows={3}
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
            Hiển thị danh mục
          </label>
        </div>

        <p className="text-xs text-slate-500">Cập nhật: {new Date(item.updatedAt).toLocaleString("vi-VN")}</p>

        <div className="flex flex-wrap items-center gap-2">
          <SubmitButton label="Lưu danh mục" disabled={disabled} />
        </div>
        <ActionNotice state={updateState} />
      </form>

      <form action={deleteAction} className="mt-3">
        <input type="hidden" name="id" value={item.id} />
        <DeleteButton disabled={disabled || item.postCount > 0} />
        {item.postCount > 0 ? (
          <p className="mt-2 text-xs text-amber-700">
            Danh mục đang có bài viết nên chưa thể xoá.
          </p>
        ) : null}
        <ActionNotice state={deleteState} />
      </form>
    </article>
  );
}

export function AdminCategoriesManager({ items, databaseReady }: CategoriesManagerProps) {
  const [createState, createAction] = useActionState(createCategoryAction, INITIAL_CATEGORY_ACTION_STATE);

  return (
    <div className="space-y-4">
      {!databaseReady ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Chưa cấu hình DATABASE_URL, module đang ở chế độ chỉ xem.
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-slate-900">Tạo danh mục mới</h2>
        <form action={createAction} className="mt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Tên danh mục</span>
              <input
                name="name"
                required
                placeholder="Mẹo đặt xe"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Slug (tuỳ chọn)</span>
              <input
                name="slug"
                placeholder="de-trong-se-tu-tao"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>
          </div>

          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Mô tả (tuỳ chọn)</span>
            <textarea
              name="description"
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Thứ tự</span>
              <input
                name="sortOrder"
                type="number"
                defaultValue={0}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>

            <label className="inline-flex items-center gap-2 self-end text-sm text-slate-700">
              <input
                name="isActive"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
              />
              Hiển thị ngay
            </label>
          </div>

          <SubmitButton label="Tạo danh mục" disabled={!databaseReady} />
          <ActionNotice state={createState} />
        </form>
      </section>

      <section className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            Chưa có danh mục blog nào.
          </div>
        ) : (
          items.map((item) => <CategoryEditCard key={item.id} item={item} disabled={!databaseReady} />)
        )}
      </section>
    </div>
  );
}
