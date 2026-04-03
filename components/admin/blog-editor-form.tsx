"use client";

import { PublishStatus } from "@prisma/client";
import { useActionState, useRef, useState } from "react";

import {
  createBlogPostAction,
  updateBlogPostAction,
  type BlogActionState
} from "@/app/admin/(dashboard)/blog/actions";
import { cn } from "@/lib/utils";

type CategoryOption = {
  id: string;
  name: string;
  isActive: boolean;
};

type BlogEditorInitialData = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  categoryId: string;
  seoTitle: string;
  seoDescription: string;
  status: PublishStatus;
  publishedAt: string;
};

type AdminBlogEditorFormProps = {
  mode: "create" | "edit";
  categories: CategoryOption[];
  initialData: BlogEditorInitialData;
  databaseReady: boolean;
};

const INITIAL_BLOG_ACTION_STATE: BlogActionState = {
  status: "idle",
  message: ""
};

function ActionNotice({ state }: { state: BlogActionState }) {
  if (state.status === "idle" || !state.message) {
    return null;
  }

  return (
    <p
      className={cn(
        "rounded-lg border px-3 py-2 text-sm",
        state.status === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-rose-200 bg-rose-50 text-rose-700"
      )}
    >
      {state.message}
    </p>
  );
}

function MarkdownToolbar({
  onInsert
}: {
  onInsert: (type: "h2" | "paragraph" | "bold" | "list" | "link") => void;
}) {
  const actions: Array<{ key: "h2" | "paragraph" | "bold" | "list" | "link"; label: string }> = [
    { key: "h2", label: "Heading" },
    { key: "paragraph", label: "Paragraph" },
    { key: "bold", label: "Bold" },
    { key: "list", label: "Bullet list" },
    { key: "link", label: "Link" }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <button
          key={action.key}
          type="button"
          onClick={() => onInsert(action.key)}
          className="inline-flex items-center rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

function toDateTimeLocalValue(input: string) {
  if (!input) {
    return "";
  }

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const vietnamOffset = 7 * 60 * 60 * 1000;
  const vietnamDate = new Date(date.getTime() + vietnamOffset);
  return vietnamDate.toISOString().slice(0, 16);
}

export function AdminBlogEditorForm({ mode, categories, initialData, databaseReady }: AdminBlogEditorFormProps) {
  const action = mode === "create" ? createBlogPostAction : updateBlogPostAction;
  const [state, formAction] = useActionState(action, INITIAL_BLOG_ACTION_STATE);
  const [content, setContent] = useState(initialData.content);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function updateContentWithSelection(
    updater: (selectedText: string) => { text: string; selectOffsetStart?: number; selectOffsetEnd?: number }
  ) {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const selectedText = textarea.value.slice(start, end);
    const result = updater(selectedText);
    const nextValue = `${textarea.value.slice(0, start)}${result.text}${textarea.value.slice(end)}`;

    setContent(nextValue);

    requestAnimationFrame(() => {
      const nextStart = start + (result.selectOffsetStart ?? result.text.length);
      const nextEnd = start + (result.selectOffsetEnd ?? result.text.length);
      textarea.focus();
      textarea.setSelectionRange(nextStart, nextEnd);
    });
  }

  function handleInsert(type: "h2" | "paragraph" | "bold" | "list" | "link") {
    if (type === "h2") {
      updateContentWithSelection(() => ({ text: "\n## Tiêu đề mục\n" }));
      return;
    }

    if (type === "paragraph") {
      updateContentWithSelection(() => ({ text: "\nĐoạn văn mới...\n" }));
      return;
    }

    if (type === "bold") {
      updateContentWithSelection((selectedText) => {
        const body = selectedText || "nội dung nhấn mạnh";
        const text = `**${body}**`;
        return {
          text,
          selectOffsetStart: selectedText ? text.length : 2,
          selectOffsetEnd: selectedText ? text.length : text.length - 2
        };
      });
      return;
    }

    if (type === "list") {
      updateContentWithSelection(() => ({ text: "\n- Mục 1\n- Mục 2\n" }));
      return;
    }

    updateContentWithSelection((selectedText) => {
      const label = selectedText || "văn bản liên kết";
      const text = `[${label}](https://example.com)`;
      const urlStart = text.indexOf("https://");
      return {
        text,
        selectOffsetStart: urlStart,
        selectOffsetEnd: text.length - 1
      };
    });
  }

  const submitLabel = mode === "create" ? "Tạo bài viết" : "Cập nhật bài viết";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      {categories.length === 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Cần tạo ít nhất 1 danh mục trước khi tạo bài blog.
        </div>
      ) : null}

      <form action={formAction} className="space-y-4">
        {mode === "edit" && initialData.id ? <input type="hidden" name="id" value={initialData.id} /> : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Tiêu đề bài viết</span>
            <input
              name="title"
              required
              defaultValue={initialData.title}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Slug (tuỳ chọn)</span>
            <input
              name="slug"
              defaultValue={initialData.slug}
              placeholder="de-trong-se-tu-tao-tu-tieu-de"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            />
          </label>
        </div>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Mô tả ngắn (excerpt)</span>
          <textarea
            name="excerpt"
            rows={3}
            defaultValue={initialData.excerpt}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          />
        </label>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-sm font-medium text-slate-700">Nội dung bài viết</label>
            <MarkdownToolbar onInsert={handleInsert} />
          </div>
          <textarea
            ref={textareaRef}
            name="content"
            required
            rows={14}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm leading-6 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          />
          <p className="text-xs text-slate-500">
            Editor lưu theo markdown đơn giản: hỗ trợ heading (`##`), đoạn văn, chữ đậm (`**...**`), bullet list và link.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Ảnh đại diện (URL)</span>
            <input
              name="coverImageUrl"
              type="url"
              defaultValue={initialData.coverImageUrl}
              placeholder="https://..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Danh mục</span>
            <select
              name="categoryId"
              required
              defaultValue={initialData.categoryId || categories[0]?.id}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} {category.isActive ? "" : "(ẩn)"}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Meta title</span>
            <input
              name="seoTitle"
              defaultValue={initialData.seoTitle}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Meta description</span>
            <input
              name="seoDescription"
              defaultValue={initialData.seoDescription}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Trạng thái</span>
            <select
              name="status"
              defaultValue={initialData.status}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            >
              <option value={PublishStatus.DRAFT}>Draft</option>
              <option value={PublishStatus.PUBLISHED}>Published</option>
              <option value={PublishStatus.ARCHIVED}>Archived</option>
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Ngày giờ đăng (tuỳ chọn)</span>
            <input
              name="publishedAt"
              type="datetime-local"
              defaultValue={toDateTimeLocalValue(initialData.publishedAt)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={!databaseReady || categories.length === 0}
            className={cn(
              "inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition",
              !databaseReady || categories.length === 0
                ? "cursor-not-allowed bg-slate-400"
                : "bg-teal-700 hover:bg-teal-800"
            )}
          >
            {submitLabel}
          </button>
        </div>

        <ActionNotice state={state} />
      </form>
    </section>
  );
}
