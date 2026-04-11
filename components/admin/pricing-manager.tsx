"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  createPricingRouteAction,
  deletePricingRouteAction,
  updatePricingRouteAction,
  type PricingActionState
} from "@/app/admin/(dashboard)/pricing/actions";
import { cn } from "@/lib/utils";

type SeatPrice = {
  id: string;
  price: string;
  vehicleType: string;
};

export type AdminPricingRoute = {
  id: string;
  routeName: string;
  fromLocation: string;
  toLocation: string;
  baseCode: string;
  currency: string;
  unit: string;
  description: string;
  sortOrder: number;
  isPopular: boolean;
  isActive: boolean;
  showOnHome: boolean;
  updatedAt: string;
  itemIds: string[];
  seat4: SeatPrice | null;
  seat7: SeatPrice | null;
  seat16: SeatPrice | null;
};

type PricingManagerProps = {
  routes: AdminPricingRoute[];
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
      {pending ? "Đang xóa..." : "Xóa tuyến"}
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

function ToggleButton({
  expanded,
  onClick,
  className
}: {
  expanded: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50",
        className
      )}
    >
      {expanded ? "Thu gọn" : "Mở rộng"}
    </button>
  );
}

function RouteSummary({ route }: { route: AdminPricingRoute }) {
  const seat4 = route.seat4?.price ? `${Number(route.seat4.price).toLocaleString("vi-VN")}đ` : "-";
  const seat7 = route.seat7?.price ? `${Number(route.seat7.price).toLocaleString("vi-VN")}đ` : "-";
  const seat16 = route.seat16?.price ? `${Number(route.seat16.price).toLocaleString("vi-VN")}đ` : "-";

  return (
    <div className="grid gap-2 text-xs text-slate-600 sm:grid-cols-3">
      <p className="rounded-lg bg-slate-50 px-2.5 py-2">
        <span className="font-semibold text-slate-800">Xe 4 chỗ:</span> {seat4}/{route.unit}
      </p>
      <p className="rounded-lg bg-slate-50 px-2.5 py-2">
        <span className="font-semibold text-slate-800">Xe 7 chỗ:</span> {seat7}/{route.unit}
      </p>
      <p className="rounded-lg bg-slate-50 px-2.5 py-2">
        <span className="font-semibold text-slate-800">Xe 16 chỗ:</span> {seat16}/{route.unit}
      </p>
    </div>
  );
}

function PricingRouteCard({ route, disabled }: { route: AdminPricingRoute; disabled: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [updateState, updateAction] = useActionState(updatePricingRouteAction, INITIAL_PRICING_ACTION_STATE);
  const [deleteState, deleteAction] = useActionState(deletePricingRouteAction, INITIAL_PRICING_ACTION_STATE);

  useEffect(() => {
    if (updateState.status === "success") {
      setExpanded(false);
    }
  }, [updateState.status]);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">{route.routeName}</p>
          <p className="mt-1 text-xs text-slate-500">
            {route.fromLocation} → {route.toLocation}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Mã gốc: <span className="font-mono">{route.baseCode || "Tự tạo"}</span> - Cập nhật:{" "}
            {new Date(route.updatedAt).toLocaleString("vi-VN")}
          </p>
        </div>
        <ToggleButton expanded={expanded} onClick={() => setExpanded((prev) => !prev)} />
      </div>

      <div className="mt-3">
        <RouteSummary route={route} />
      </div>

      {expanded ? (
        <div className="mt-4 space-y-3 border-t border-slate-200 pt-3">
          <form action={updateAction} className="space-y-3">
            <input type="hidden" name="tier4Id" value={route.seat4?.id ?? ""} />
            <input type="hidden" name="tier7Id" value={route.seat7?.id ?? ""} />
            <input type="hidden" name="tier16Id" value={route.seat16?.id ?? ""} />

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Tên tuyến</span>
                <input
                  name="routeName"
                  defaultValue={route.routeName}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Mã tuyến gốc</span>
                <input
                  name="baseCode"
                  defaultValue={route.baseCode}
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
                  defaultValue={route.fromLocation}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Điểm đến</span>
                <input
                  name="toLocation"
                  defaultValue={route.toLocation}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Tiền tệ</span>
                <input
                  name="currency"
                  defaultValue={route.currency}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm uppercase text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Đơn vị</span>
                <input
                  name="unit"
                  defaultValue={route.unit}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Giá xe 4 chỗ</span>
                <input
                  name="price4"
                  type="number"
                  min={1000}
                  step={1000}
                  defaultValue={route.seat4?.price ?? ""}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Giá xe 7 chỗ</span>
                <input
                  name="price7"
                  type="number"
                  min={1000}
                  step={1000}
                  defaultValue={route.seat7?.price ?? ""}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Giá xe 16 chỗ</span>
                <input
                  name="price16"
                  type="number"
                  min={1000}
                  step={1000}
                  defaultValue={route.seat16?.price ?? ""}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Thứ tự</span>
                <input
                  name="sortOrder"
                  type="number"
                  defaultValue={route.sortOrder}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Mô tả (tùy chọn)</span>
                <textarea
                  name="description"
                  defaultValue={route.description}
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
                />
              </label>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700">
                <input
                  name="isPopular"
                  type="checkbox"
                  defaultChecked={route.isPopular}
                  className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
                />
                Đánh dấu tuyến phổ biến
              </label>
              <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700">
                <input
                  name="isActive"
                  type="checkbox"
                  defaultChecked={route.isActive}
                  className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
                />
                Hiển thị ngoài trang công khai
              </label>
              <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700">
                <input
                  name="showOnHome"
                  type="checkbox"
                  defaultChecked={route.showOnHome}
                  className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
                />
                Hiển thị ngoài trang chủ
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <SubmitButton label="Lưu tuyến giá" disabled={disabled} />
            </div>
            <ActionNotice state={updateState} />
          </form>

          <form action={deleteAction} className="border-t border-slate-200 pt-3">
            <input type="hidden" name="ids" value={route.itemIds.join(",")} />
            <DeleteButton disabled={disabled} />
            <ActionNotice state={deleteState} />
          </form>
        </div>
      ) : null}
    </article>
  );
}

function CreateRouteSection({ databaseReady }: { databaseReady: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [createState, createAction] = useActionState(createPricingRouteAction, INITIAL_PRICING_ACTION_STATE);

  useEffect(() => {
    if (createState.status === "success") {
      setExpanded(false);
    }
  }, [createState.status]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Tạo tuyến giá mới</h2>
          <p className="mt-1 text-xs text-slate-600">
            Mỗi tuyến sẽ tạo đồng thời 3 mức giá: xe 4 chỗ, 7 chỗ, 16 chỗ.
          </p>
        </div>
        <ToggleButton expanded={expanded} onClick={() => setExpanded((prev) => !prev)} />
      </div>

      {expanded ? (
        <form action={createAction} className="mt-4 space-y-3 border-t border-slate-200 pt-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Tên tuyến</span>
              <input
                name="routeName"
                required
                placeholder="TP Ninh Bình ↔ Tam Cốc"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Mã tuyến gốc (tùy chọn)</span>
              <input
                name="baseCode"
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
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Giá xe 4 chỗ</span>
              <input
                name="price4"
                type="number"
                min={1000}
                step={1000}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Giá xe 7 chỗ</span>
              <input
                name="price7"
                type="number"
                min={1000}
                step={1000}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Giá xe 16 chỗ</span>
              <input
                name="price16"
                type="number"
                min={1000}
                step={1000}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>
          </div>

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
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Mô tả (tùy chọn)</span>
              <textarea
                name="description"
                rows={2}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </label>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700">
              <input
                name="isPopular"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
              />
              Đánh dấu tuyến phổ biến
            </label>
            <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700">
              <input
                name="isActive"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
              />
              Hiển thị ngoài trang công khai
            </label>
            <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700">
              <input
                name="showOnHome"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
              />
              Hiển thị ngoài trang chủ
            </label>
          </div>

          <SubmitButton label="Tạo tuyến giá" disabled={!databaseReady} />
          <ActionNotice state={createState} />
        </form>
      ) : null}
    </section>
  );
}

export function AdminPricingManager({ routes, databaseReady }: PricingManagerProps) {
  return (
    <div className="space-y-4">
      {!databaseReady ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Chưa cấu hình DATABASE_URL, module đang ở chế độ chỉ xem.
        </div>
      ) : null}

      <CreateRouteSection databaseReady={databaseReady} />

      <section className="space-y-3">
        {routes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            Chưa có dữ liệu bảng giá.
          </div>
        ) : (
          routes.map((route) => (
            <PricingRouteCard key={route.id} route={route} disabled={!databaseReady} />
          ))
        )}
      </section>
    </div>
  );
}
