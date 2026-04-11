"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  createTestimonialAction,
  deleteTestimonialAction,
  updateTestimonialAction,
  type TestimonialActionState
} from "@/app/admin/(dashboard)/testimonials/actions";
import { cn } from "@/lib/utils";

type TestimonialItem = {
  id: string;
  code: string;
  customerName: string;
  content: string;
  rating: number;
  location: string;
  serviceName: string;
  sortOrder: number;
  isFeatured: boolean;
  isActive: boolean;
  updatedAt: string;
};

type TestimonialsManagerProps = {
  items: TestimonialItem[];
  databaseReady: boolean;
};

const INITIAL_TESTIMONIAL_ACTION_STATE: TestimonialActionState = {
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

function ActionNotice({ state }: { state: TestimonialActionState }) {
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

function TestimonialEditCard({ item, disabled }: { item: TestimonialItem; disabled: boolean }) {
  const [updateState, updateAction] = useActionState(updateTestimonialAction, INITIAL_TESTIMONIAL_ACTION_STATE);
  const [deleteState, deleteAction] = useActionState(deleteTestimonialAction, INITIAL_TESTIMONIAL_ACTION_STATE);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3">
        <p className="text-sm font-semibold text-slate-900">{item.customerName}</p>
        <p className="mt-1 text-xs text-slate-500">
          Mã: <span className="font-mono">{item.code}</span> - Cập nhật:{" "}
          {new Date(item.updatedAt).toLocaleString("vi-VN")}
        </p>
      </div>

      <form action={updateAction} className="space-y-3">
        <input type="hidden" name="id" value={item.id} />

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Mã đánh giá</span>
            <input
              name="code"
              defaultValue={item.code}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Tên khách hàng</span>
            <input
              name="customerName"
              defaultValue={item.customerName}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            />
          </label>
        </div>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Nội dung đánh giá</span>
          <textarea
            name="content"
            defaultValue={item.content}
            required
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Điểm đánh giá (1-5)</span>
            <input
              name="rating"
              type="number"
              min={1}
              max={5}
              defaultValue={item.rating}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Khu vực</span>
            <input
              name="location"
              defaultValue={item.location}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Dịch vụ</span>
            <input
              name="serviceName"
              defaultValue={item.serviceName}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
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
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700">
            <input
              name="isFeatured"
              type="checkbox"
              defaultChecked={item.isFeatured}
              className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
            />
            Đánh dấu nổi bật
          </label>
          <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700">
            <input
              name="isActive"
              type="checkbox"
              defaultChecked={item.isActive}
              className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
            />
            Hiển thị ngoài trang công khai
          </label>
        </div>

        <SubmitButton label="Lưu đánh giá" disabled={disabled} />
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

export function AdminTestimonialsManager({ items, databaseReady }: TestimonialsManagerProps) {
  const [createState, createAction] = useActionState(createTestimonialAction, INITIAL_TESTIMONIAL_ACTION_STATE);

  return (
    <div className="space-y-4">
      {!databaseReady ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Chưa cấu hình DATABASE_URL, module đang ở chế độ chỉ xem.
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-slate-900">Tạo đánh giá mới</h2>
        <form action={createAction} className="mt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Tên khách hàng</span>
              <input
                name="customerName"
                required
                placeholder="Nguyễn Văn A"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Mã đánh giá (tùy chọn)</span>
              <input
                name="code"
                placeholder="de-trong-se-tu-tao"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>
          </div>

          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Nội dung đánh giá</span>
            <textarea
              name="content"
              required
              rows={4}
              placeholder="Khách hàng đánh giá về dịch vụ..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Điểm đánh giá (1-5)</span>
              <input
                name="rating"
                type="number"
                min={1}
                max={5}
                defaultValue={5}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Khu vực</span>
              <input
                name="location"
                placeholder="Ninh Bình"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Dịch vụ</span>
              <input
                name="serviceName"
                placeholder="Taxi đi Hà Nội"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
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

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                name="isFeatured"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
              />
              Đánh dấu nổi bật
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                name="isActive"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
              />
              Hiển thị ngay
            </label>
          </div>

          <SubmitButton label="Tạo đánh giá" disabled={!databaseReady} />
          <ActionNotice state={createState} />
        </form>
      </section>

      <section className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            Chưa có đánh giá nào.
          </div>
        ) : (
          items.map((item) => <TestimonialEditCard key={item.id} item={item} disabled={!databaseReady} />)
        )}
      </section>
    </div>
  );
}
