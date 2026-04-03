"use client";

import { QuoteRequestStatus } from "@prisma/client";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import {
  updateLeadStatusAction,
  type LeadActionState
} from "@/app/admin/(dashboard)/leads/actions";
import { cn } from "@/lib/utils";

type LeadStatusFilter = "ALL" | QuoteRequestStatus;
type LeadsSort = "latest" | "oldest";

type AdminLeadItem = {
  id: string;
  fullName: string;
  phone: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupTime: string | null;
  returnTime: string | null;
  vehicleType: string | null;
  message: string | null;
  status: QuoteRequestStatus;
  createdAt: string;
  handledAt: string | null;
  handledByName: string | null;
  passengerCount: number | null;
  luggageCount: number | null;
  utmSource: string | null;
};

type LeadStatusOption = {
  value: LeadStatusFilter;
  label: string;
  count: number;
};

type LeadsManagerProps = {
  items: AdminLeadItem[];
  databaseReady: boolean;
  filters: {
    keyword: string;
    status: LeadStatusFilter;
    sort: LeadsSort;
  };
  statusOptions: LeadStatusOption[];
  statusLabelMap: Record<QuoteRequestStatus, string>;
  tripTypeLabelMap: Record<string, string>;
};

const INITIAL_LEAD_ACTION_STATE: LeadActionState = {
  status: "idle",
  message: ""
};

function StatusBadge({ status, statusLabelMap }: { status: QuoteRequestStatus; statusLabelMap: Record<QuoteRequestStatus, string> }) {
  const toneClassMap: Record<QuoteRequestStatus, string> = {
    NEW: "bg-amber-100 text-amber-700",
    CONTACTED: "bg-sky-100 text-sky-700",
    QUOTED: "bg-indigo-100 text-indigo-700",
    CONFIRMED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-rose-100 text-rose-700"
  };

  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", toneClassMap[status])}>
      {statusLabelMap[status]}
    </span>
  );
}

function formatDateTime(dateValue: string | null) {
  if (!dateValue) {
    return "Chưa có";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(dateValue));
}

function resolveTripTypeLabel(
  rawValue: string | null,
  tripTypeLabelMap: Record<string, string>
) {
  if (!rawValue) {
    return "Chưa xác định";
  }

  return tripTypeLabelMap[rawValue] ?? rawValue;
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center rounded-lg px-3 py-2 text-xs font-semibold text-white transition",
        isDisabled ? "cursor-not-allowed bg-slate-400" : "bg-teal-700 hover:bg-teal-800"
      )}
    >
      {pending ? "Đang lưu..." : "Cập nhật"}
    </button>
  );
}

function ActionNotice({ state }: { state: LeadActionState }) {
  if (state.status === "idle" || !state.message) {
    return null;
  }

  return (
    <p
      className={cn(
        "mt-2 rounded-lg border px-2.5 py-1.5 text-xs",
        state.status === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-rose-200 bg-rose-50 text-rose-700"
      )}
    >
      {state.message}
    </p>
  );
}

function LeadStatusUpdater({
  leadId,
  currentStatus,
  statusLabelMap,
  disabled
}: {
  leadId: string;
  currentStatus: QuoteRequestStatus;
  statusLabelMap: Record<QuoteRequestStatus, string>;
  disabled: boolean;
}) {
  const [state, formAction] = useActionState(updateLeadStatusAction, INITIAL_LEAD_ACTION_STATE);
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="id" value={leadId} />
      <div className="flex flex-wrap items-center gap-2">
        <select
          name="status"
          defaultValue={currentStatus}
          disabled={disabled}
          className="min-w-40 rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          {(Object.keys(statusLabelMap) as QuoteRequestStatus[]).map((status) => (
            <option key={status} value={status}>
              {statusLabelMap[status]}
            </option>
          ))}
        </select>
        <SubmitButton disabled={disabled} />
      </div>
      <ActionNotice state={state} />
    </form>
  );
}

export function AdminLeadsManager({
  items,
  databaseReady,
  filters,
  statusOptions,
  statusLabelMap,
  tripTypeLabelMap
}: LeadsManagerProps) {
  return (
    <div className="space-y-4">
      {!databaseReady ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Chưa cấu hình DATABASE_URL, module đang ở chế độ chỉ xem.
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <form action="/admincp/leads" method="get" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm lg:col-span-2">
            <span className="mb-1 block font-medium text-slate-700">Tìm kiếm lead</span>
            <input
              name="q"
              defaultValue={filters.keyword}
              placeholder="Nhập điểm đi, điểm đến hoặc số điện thoại..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Trạng thái</span>
            <select
              name="status"
              defaultValue={filters.status}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.count})
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Sắp xếp</span>
            <select
              name="sort"
              defaultValue={filters.sort}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            >
              <option value="latest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </label>

          <div className="sm:col-span-2 lg:col-span-4">
            <button
              type="submit"
              className="inline-flex items-center rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
            >
              Lọc dữ liệu
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            Không có lead nào phù hợp bộ lọc hiện tại.
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white lg:block">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    <th className="px-4 py-3">Lead</th>
                    <th className="px-4 py-3">Chuyến đi</th>
                    <th className="px-4 py-3">Ngày giờ đón</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Cập nhật xử lý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {items.map((lead) => (
                    <tr key={lead.id} className="align-top">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-900">{lead.fullName}</p>
                        <p className="mt-1">
                          <a href={`tel:${lead.phone}`} className="text-teal-700 hover:underline">
                            {lead.phone}
                          </a>
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Gửi lúc: {formatDateTime(lead.createdAt)}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p>
                          <span className="font-medium text-slate-900">Điểm đi:</span> {lead.pickupLocation}
                        </p>
                        <p className="mt-1">
                          <span className="font-medium text-slate-900">Điểm đến:</span> {lead.dropoffLocation}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Loại chuyến: {resolveTripTypeLabel(lead.vehicleType, tripTypeLabelMap)}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p>{formatDateTime(lead.pickupTime)}</p>
                        {lead.returnTime ? (
                          <p className="mt-1 text-xs text-slate-500">Giờ về: {formatDateTime(lead.returnTime)}</p>
                        ) : null}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={lead.status} statusLabelMap={statusLabelMap} />
                        <p className="mt-1 text-xs text-slate-500">
                          {lead.handledAt
                            ? `Xử lý lúc ${formatDateTime(lead.handledAt)}`
                            : "Chưa có lịch sử xử lý"}
                        </p>
                        {lead.handledByName ? (
                          <p className="mt-1 text-xs text-slate-500">Người xử lý: {lead.handledByName}</p>
                        ) : null}
                      </td>

                      <td className="px-4 py-4">
                        <LeadStatusUpdater
                          leadId={lead.id}
                          currentStatus={lead.status}
                          statusLabelMap={statusLabelMap}
                          disabled={!databaseReady}
                        />
                        <details className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs">
                          <summary className="cursor-pointer font-semibold text-slate-700">Xem chi tiết</summary>
                          <div className="mt-2 space-y-1 text-slate-600">
                            <p>Mã lead: {lead.id}</p>
                            <p>Hành lý: {lead.luggageCount ?? "Chưa có"}</p>
                            <p>Số hành khách: {lead.passengerCount ?? "Chưa có"}</p>
                            <p>Nguồn: {lead.utmSource ?? "website"}</p>
                            <p>Ghi chú: {lead.message?.trim() ? lead.message : "Không có"}</p>
                          </div>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 lg:hidden">
              {items.map((lead) => (
                <article key={lead.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{lead.fullName}</p>
                      <a href={`tel:${lead.phone}`} className="text-sm font-medium text-teal-700 hover:underline">
                        {lead.phone}
                      </a>
                    </div>
                    <StatusBadge status={lead.status} statusLabelMap={statusLabelMap} />
                  </div>

                  <div className="mt-3 space-y-1 text-sm text-slate-700">
                    <p>
                      <span className="font-medium text-slate-900">Điểm đi:</span> {lead.pickupLocation}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">Điểm đến:</span> {lead.dropoffLocation}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">Ngày giờ đón:</span> {formatDateTime(lead.pickupTime)}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">Loại chuyến:</span>{" "}
                      {resolveTripTypeLabel(lead.vehicleType, tripTypeLabelMap)}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">Gửi lúc:</span> {formatDateTime(lead.createdAt)}
                    </p>
                  </div>

                  <div className="mt-3">
                    <LeadStatusUpdater
                      leadId={lead.id}
                      currentStatus={lead.status}
                      statusLabelMap={statusLabelMap}
                      disabled={!databaseReady}
                    />
                  </div>

                  <details className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs">
                    <summary className="cursor-pointer font-semibold text-slate-700">Xem chi tiết</summary>
                    <div className="mt-2 space-y-1 text-slate-600">
                      <p>Mã lead: {lead.id}</p>
                      <p>Giờ về: {formatDateTime(lead.returnTime)}</p>
                      <p>Số hành khách: {lead.passengerCount ?? "Chưa có"}</p>
                      <p>Hành lý: {lead.luggageCount ?? "Chưa có"}</p>
                      <p>Nguồn: {lead.utmSource ?? "website"}</p>
                      <p>Ghi chú: {lead.message?.trim() ? lead.message : "Không có"}</p>
                      <p>
                        Người xử lý: {lead.handledByName ?? "Chưa có"}{" "}
                        {lead.handledAt ? `(${formatDateTime(lead.handledAt)})` : ""}
                      </p>
                    </div>
                  </details>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
