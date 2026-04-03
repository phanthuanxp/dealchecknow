"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  createPricingAction,
  deletePricingAction,
  updatePricingAction,
  type PricingActionState
} from "@/app/admin/(dashboard)/pricing/actions";
import { cn } from "@/lib/utils";

type PricingItem = {
  id: string;
  code: string;
  routeName: string;
  fromLocation: string;
  toLocation: string;
  vehicleType: string;
  price: string;
  currency: string;
  unit: string;
  description: string;
  sortOrder: number;
  isPopular: boolean;
  isActive: boolean;
  updatedAt: string;
};

type PricingManagerProps = {
  items: PricingItem[];
  databaseReady: boolean;
};

const INITIAL_PRICING_ACTION_STATE: PricingActionState = {
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

function ActionNotice({ state }: { state: PricingActionState }) {
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

function PricingEditCard({ item, disabled }: { item: PricingItem; disabled: boolean }) {
  const [updateState, updateAction] = useActionState(updatePricingAction, INITIAL_PRICING_ACTION_STATE);
  const [deleteState, deleteAction] = useActionState(deletePricingAction, INITIAL_PRICING_ACTION_STATE);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3">
        <p className="text-sm font-semibold text-slate-900">{item.routeName}</p>
        <p className="mt-1 text-xs text-slate-500">
          Mã: <span className="font-mono">{item.code}</span> - Cập nhật:{" "}
          {new Date(item.updatedAt).toLocaleString("vi-VN")}
        </p>
      </div>

      <form action={updateAction} className="space-y-3">
        <input type="hidden" name="id" value={item.id} />

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Mã tuyến</span>
            <input
              name="code"
              defaultValue={item.code}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Tên tuyến</span>
            <input
              name="routeName"
              defaultValue={item.routeName}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Điểm đi</span>
            <input
              name="fromLocation"
              defaultValue={item.fromLocation}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Điểm đến</span>
            <input
              name="toLocation"
              defaultValue={item.toLocation}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Loại xe</span>
            <input
              name="vehicleType"
              defaultValue={item.vehicleType}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Giá</span>
            <input
              name="price"
              type="number"
              min={1000}
              step={1000}
              defaultValue={item.price}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Tiền tệ</span>
            <input
              name="currency"
              defaultValue={item.currency}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm uppercase text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Đơn vị</span>
            <input
              name="unit"
              defaultValue={item.unit}
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

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Mô tả (tùy chọn)</span>
          <textarea
            name="description"
            defaultValue={item.description}
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          />
        </label>

        <div className="grid gap-2 sm:grid-cols-2">
          <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700">
            <input
              name="isPopular"
              type="checkbox"
              defaultChecked={item.isPopular}
              className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
            />
            Đánh dấu tuyến phổ biến
          </label>
          <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700">
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
          <SubmitButton label="Lưu bảng giá" disabled={disabled} />
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

export function AdminPricingManager({ items, databaseReady }: PricingManagerProps) {
  const [createState, createAction] = useActionState(createPricingAction, INITIAL_PRICING_ACTION_STATE);

  return (
    <div className="space-y-4">
      {!databaseReady ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Chưa cấu hình DATABASE_URL, module đang ở chế độ chỉ xem.
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-slate-900">Tạo tuyến giá mới</h2>
        <form action={createAction} className="mt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Tên tuyến</span>
              <input
                name="routeName"
                required
                placeholder="Taxi Ninh Bình đi Hà Nội"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Mã tuyến (tùy chọn)</span>
              <input
                name="code"
                placeholder="de-trong-se-tu-tao"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Điểm đi</span>
              <input
                name="fromLocation"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Điểm đến</span>
              <input
                name="toLocation"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Loại xe</span>
              <input
                name="vehicleType"
                required
                placeholder="Sedan 4 chỗ"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Giá</span>
              <input
                name="price"
                type="number"
                min={1000}
                step={1000}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Tiền tệ</span>
              <input
                name="currency"
                defaultValue="VND"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm uppercase text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Đơn vị</span>
              <input
                name="unit"
                defaultValue="chuyến"
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

          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Mô tả (tùy chọn)</span>
            <textarea
              name="description"
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            />
          </label>

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                name="isPopular"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
              />
              Đánh dấu phổ biến
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                name="isActive"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
              />
              Publish ngay
            </label>
          </div>

          <SubmitButton label="Tạo tuyến giá" disabled={!databaseReady} />
          <ActionNotice state={createState} />
        </form>
      </section>

      <section className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            Chưa có dữ liệu bảng giá.
          </div>
        ) : (
          items.map((item) => <PricingEditCard key={item.id} item={item} disabled={!databaseReady} />)
        )}
      </section>
    </div>
  );
}
