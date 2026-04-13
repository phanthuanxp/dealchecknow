"use client";

import { useActionState, useEffect, useEffectEvent, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  createWebsiteAction,
  type WebsiteActionState,
  updateWebsiteAction
} from "@/app/admin/(dashboard)/websites/actions";
import { cn } from "@/lib/utils";

export type AdminWebsiteItem = {
  id: string;
  name: string;
  slug: string;
  cmsDomain: string;
  isActive: boolean;
  primaryDomain: string;
  aliasDomainsText: string;
  updatedAt: string;
  domains: Array<{
    domain: string;
    isPrimary: boolean;
    isActive: boolean;
  }>;
  stats: {
    users: number;
    posts: number;
    leads: number;
    services: number;
  };
};

type AdminWebsitesManagerProps = {
  items: AdminWebsiteItem[];
  databaseReady: boolean;
  canManage: boolean;
};

const INITIAL_WEBSITE_ACTION_STATE: WebsiteActionState = {
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

function ToggleButton({ expanded, onClick }: { expanded: boolean; onClick: () => void }) {
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

function ActionNotice({ state }: { state: WebsiteActionState }) {
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

function WebsiteFormFields({ item }: { item?: AdminWebsiteItem }) {
  return (
    <>
      {item ? <input type="hidden" name="id" value={item.id} /> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Tên website</span>
          <input
            name="name"
            required
            defaultValue={item?.name ?? ""}
            placeholder="Taxi Gia Bình"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Slug (để trống sẽ tự tạo)</span>
          <input
            name="slug"
            defaultValue={item?.slug ?? ""}
            placeholder="taxigiabinh"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Domain chính</span>
          <input
            name="primaryDomain"
            defaultValue={item?.primaryDomain ?? ""}
            placeholder="taxigiabinh.vn"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">CMS domain (tuỳ chọn)</span>
          <input
            name="cmsDomain"
            defaultValue={item?.cmsDomain ?? ""}
            placeholder="cms.30nice.vn"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          />
        </label>
      </div>

      <label className="text-sm">
        <span className="mb-1 block font-medium text-slate-700">Domain phụ (mỗi dòng hoặc phân tách bằng dấu phẩy)</span>
        <textarea
          name="aliasDomainsText"
          rows={3}
          defaultValue={item?.aliasDomainsText ?? ""}
          placeholder="www.taxigiabinh.vn&#10;m.taxigiabinh.vn"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
        />
      </label>

      <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700">
        <input
          name="isActive"
          type="checkbox"
          defaultChecked={item?.isActive ?? true}
          className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
        />
        Website đang hoạt động
      </label>
    </>
  );
}

function WebsiteEditCard({ item, databaseReady }: { item: AdminWebsiteItem; databaseReady: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [updateState, updateAction] = useActionState(updateWebsiteAction, INITIAL_WEBSITE_ACTION_STATE);
  const collapseCard = useEffectEvent(() => {
    setExpanded(false);
  });

  useEffect(() => {
    if (updateState.status === "success") {
      collapseCard();
    }
  }, [updateState.status]);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-base font-semibold text-slate-900">{item.name}</p>
          <p className="mt-1 text-xs text-slate-500">
            Slug: <span className="font-mono">{item.slug}</span> • Cập nhật:{" "}
            {new Date(item.updatedAt).toLocaleString("vi-VN")}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Domain chính:{" "}
            <span className="font-semibold text-slate-700">{item.primaryDomain || "Chưa cấu hình"}</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">User: {item.stats.users}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">Blog: {item.stats.posts}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">Lead: {item.stats.leads}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">Dịch vụ: {item.stats.services}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
              item.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
            )}
          >
            {item.isActive ? "Đang hoạt động" : "Đang tạm dừng"}
          </span>
          <ToggleButton expanded={expanded} onClick={() => setExpanded((prev) => !prev)} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {item.domains.length === 0 ? (
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
            Chưa có domain public
          </span>
        ) : (
          item.domains.map((domain) => (
            <span
              key={`${item.id}-${domain.domain}`}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium",
                domain.isPrimary ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-600"
              )}
            >
              {domain.domain}
              {!domain.isActive ? " (ẩn)" : ""}
              {domain.isPrimary ? " • chính" : ""}
            </span>
          ))
        )}
      </div>

      {expanded ? (
        <form action={updateAction} className="mt-4 space-y-3 border-t border-slate-200 pt-3">
          <WebsiteFormFields item={item} />
          <SubmitButton label="Lưu website" disabled={!databaseReady} />
          <ActionNotice state={updateState} />
        </form>
      ) : null}
    </article>
  );
}

function CreateWebsiteSection({ databaseReady }: { databaseReady: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [createState, createAction] = useActionState(createWebsiteAction, INITIAL_WEBSITE_ACTION_STATE);
  const collapseForm = useEffectEvent(() => {
    setExpanded(false);
  });

  useEffect(() => {
    if (createState.status === "success") {
      collapseForm();
    }
  }, [createState.status]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Tạo website mới</h2>
          <p className="mt-1 text-xs text-slate-600">
            Tạo tenant mới để nhân bản web taxi cùng hệ thống CMS hiện tại.
          </p>
        </div>
        <ToggleButton expanded={expanded} onClick={() => setExpanded((prev) => !prev)} />
      </div>

      {expanded ? (
        <form action={createAction} className="mt-4 space-y-3 border-t border-slate-200 pt-3">
          <WebsiteFormFields />
          <SubmitButton label="Tạo website" disabled={!databaseReady} />
          <ActionNotice state={createState} />
        </form>
      ) : null}
    </section>
  );
}

export function AdminWebsitesManager({ items, databaseReady, canManage }: AdminWebsitesManagerProps) {
  if (!canManage) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        Chỉ tài khoản ADMIN mới có quyền quản lý danh sách website.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!databaseReady ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Chưa cấu hình DATABASE_URL, module đang ở chế độ chỉ xem.
        </div>
      ) : null}

      <CreateWebsiteSection databaseReady={databaseReady} />

      <section className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            Chưa có website nào trong hệ thống.
          </div>
        ) : (
          items.map((item) => <WebsiteEditCard key={item.id} item={item} databaseReady={databaseReady} />)
        )}
      </section>
    </div>
  );
}
