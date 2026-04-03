"use client";

import { PublishStatus } from "@prisma/client";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import {
  deleteBlogPostAction,
  INITIAL_BLOG_ACTION_STATE,
  type BlogActionState
} from "@/app/admin/(dashboard)/blog/actions";
import { cn } from "@/lib/utils";

type BlogStatusFilter = "all" | "draft" | "published";

type AdminBlogItem = {
  id: string;
  title: string;
  slug: string;
  status: PublishStatus;
  categoryName: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type BlogListManagerProps = {
  items: AdminBlogItem[];
  databaseReady: boolean;
  filters: {
    status: BlogStatusFilter;
    keyword: string;
  };
};

const statusLabelMap: Record<PublishStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived"
};

function StatusBadge({ status }: { status: PublishStatus }) {
  const classNameMap: Record<PublishStatus, string> = {
    DRAFT: "bg-amber-100 text-amber-700",
    PUBLISHED: "bg-emerald-100 text-emerald-700",
    ARCHIVED: "bg-slate-200 text-slate-700"
  };

  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", classNameMap[status])}>
      {statusLabelMap[status]}
    </span>
  );
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Chưa đặt lịch";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function ActionNotice({ state }: { state: BlogActionState }) {
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

function DeleteButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center rounded-lg border px-3 py-2 text-xs font-semibold transition",
        isDisabled
          ? "cursor-not-allowed border-slate-200 text-slate-400"
          : "border-rose-300 text-rose-700 hover:bg-rose-50"
      )}
    >
      {pending ? "Đang xoá..." : "Xóa"}
    </button>
  );
}

function BlogRow({ item, disabled }: { item: AdminBlogItem; disabled: boolean }) {
  const [state, action] = useActionState(deleteBlogPostAction, INITIAL_BLOG_ACTION_STATE);
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <tr className="align-top">
      <td className="px-4 py-4">
        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
        <p className="mt-1 text-xs text-slate-500">
          Slug: <span className="font-mono">{item.slug}</span>
        </p>
        <p className="mt-1 text-xs text-slate-500">Danh mục: {item.categoryName}</p>
      </td>
      <td className="px-4 py-4 text-sm text-slate-700">
        <StatusBadge status={item.status} />
      </td>
      <td className="px-4 py-4 text-sm text-slate-700">
        <p>{formatDateTime(item.publishedAt)}</p>
        <p className="mt-1 text-xs text-slate-500">Sửa: {formatDateTime(item.updatedAt)}</p>
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <Link
                href={`/admincp/blog/${item.id}/edit`}
            className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Chỉnh sửa
          </Link>
          <form action={action}>
            <input type="hidden" name="id" value={item.id} />
            <DeleteButton disabled={disabled} />
            <ActionNotice state={state} />
          </form>
        </div>
      </td>
    </tr>
  );
}

export function AdminBlogListManager({ items, databaseReady, filters }: BlogListManagerProps) {
  return (
    <div className="space-y-4">
      {!databaseReady ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Chưa cấu hình DATABASE_URL, module đang ở chế độ chỉ xem.
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <form action="/admincp/blog" method="get" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm lg:col-span-2">
            <span className="mb-1 block font-medium text-slate-700">Tìm kiếm bài viết</span>
            <input
              name="q"
              defaultValue={filters.keyword}
              placeholder="Nhập tiêu đề hoặc slug..."
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
              <option value="all">Tất cả</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>

          <div className="self-end">
            <button
              type="submit"
              className="inline-flex items-center rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
            >
              Lọc bài viết
            </button>
          </div>
        </form>
      </section>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
          Chưa có bài blog nào phù hợp bộ lọc.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                <th className="px-4 py-3">Bài viết</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Ngày publish</th>
                <th className="px-4 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <BlogRow key={item.id} item={item} disabled={!databaseReady} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
