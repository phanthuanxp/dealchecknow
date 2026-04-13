"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  saveLayoutOrderAction,
  updateBlockAction,
  updateSectionAction,
  type BlocksActionState
} from "@/app/admin/(dashboard)/blocks/actions";
import { toSlug } from "@/lib/media";
import type { BuilderPageConfig, BuilderPageKey } from "@/lib/page-builder";
import { cn } from "@/lib/utils";
import type { HomeBlockEditorField, HomeBlockEditorItem, HomeSectionEditorItem } from "@/lib/home-blocks";

type MediaAssetItem = {
  id: string;
  title: string;
  url: string;
  altText: string | null;
  groupKey: string;
};

type BlocksEditorProps = {
  sections: HomeSectionEditorItem[];
  mediaAssets: MediaAssetItem[];
  databaseReady: boolean;
  builderPages: BuilderPageConfig[];
  currentPageKey: BuilderPageKey;
  previewPath: string;
};

type UploadStatus = "idle" | "success" | "error";

type UploadState = {
  status: UploadStatus;
  message: string;
};

type UploadApiResponse = {
  success?: boolean;
  message?: string;
  asset?: {
    id: string;
    title: string;
    url: string;
    altText: string | null;
    groupKey: string;
  };
};

const INITIAL_BLOCKS_ACTION_STATE: BlocksActionState = {
  status: "idle",
  message: ""
};

const INITIAL_UPLOAD_STATE: UploadState = {
  status: "idle",
  message: ""
};

function normalizeSortOrder(sections: HomeSectionEditorItem[]) {
  return sections.map((section, sectionIndex) => ({
    ...section,
    sortOrder: sectionIndex + 1,
    blocks: section.blocks.map((block, blockIndex) => ({
      ...block,
      sortOrder: blockIndex + 1
    }))
  }));
}

function reorderArray<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isImageLikeField(field: HomeBlockEditorField) {
  const normalized = normalizeText(`${field.key} ${field.label}`);

  if (field.type === "url") {
    return /(image|banner|cover|avatar|photo|hinh|anh)/.test(normalized);
  }

  if (field.type === "lines") {
    return /(images|banners|banner|hinh|anh)/.test(normalized);
  }

  return false;
}

function insertUrlIntoLines(currentValue: string, url: string) {
  const lines = currentValue
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.includes(url)) {
    return lines.join("\n");
  }

  return [...lines, url].join("\n");
}

function LayoutSubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition",
        isDisabled ? "cursor-not-allowed bg-slate-400" : "bg-indigo-600 hover:bg-indigo-700"
      )}
    >
      {pending ? "Đang lưu bố cục..." : "Lưu thứ tự kéo-thả"}
    </button>
  );
}

function SubmitButton({ label, disabled }: { label: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  const isDisabled = Boolean(disabled) || pending;

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

function ActionNotice({ state }: { state: BlocksActionState }) {
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

function UploadNotice({ state }: { state: UploadState }) {
  if (state.status === "idle" || !state.message) {
    return null;
  }

  return (
    <p
      className={cn(
        "rounded-lg border px-2.5 py-2 text-xs",
        state.status === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-rose-200 bg-rose-50 text-rose-700"
      )}
    >
      {state.message}
    </p>
  );
}

function MediaAssetPanel({ mediaAssets }: { mediaAssets: MediaAssetItem[] }) {
  const groups = useMemo(() => {
    const map = new Map<string, MediaAssetItem[]>();
    for (const asset of mediaAssets) {
      if (!map.has(asset.groupKey)) {
        map.set(asset.groupKey, []);
      }
      map.get(asset.groupKey)?.push(asset);
    }
    return [...map.entries()];
  }, [mediaAssets]);

  const [copied, setCopied] = useState<string>("");

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      window.setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  }

  if (mediaAssets.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
        Chưa có ảnh trong thư viện. Bạn có thể thêm tại{" "}
        <Link href="/admincp/media" className="font-semibold text-teal-700 hover:underline">
          /admincp/media
        </Link>
        .
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">Thư viện ảnh nhanh</h3>
      <p className="mt-1 text-xs text-slate-500">
        Bạn có thể chọn trực tiếp từ field trong block hoặc copy URL tại đây.
      </p>

      <div className="mt-3 space-y-4">
        {groups.map(([groupKey, assets]) => (
          <div key={groupKey}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{groupKey}</p>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {assets.map((asset) => (
                <article key={asset.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                  <div className="aspect-[16/9] overflow-hidden rounded-md border border-slate-200 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset.url} alt={asset.altText ?? asset.title} className="h-full w-full object-cover" />
                  </div>
                  <p className="mt-2 line-clamp-1 text-xs font-medium text-slate-800">{asset.title}</p>
                  <button
                    type="button"
                    onClick={() => copyUrl(asset.url)}
                    className="mt-2 inline-flex rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-white"
                  >
                    {copied === asset.url ? "Đã copy" : "Copy URL"}
                  </button>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MediaUploadControl({
  disabled,
  groupKey,
  titleSeed,
  altSeed,
  onUploaded
}: {
  disabled: boolean;
  groupKey: string;
  titleSeed: string;
  altSeed: string;
  onUploaded: (url: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>(INITIAL_UPLOAD_STATE);

  async function handleUpload() {
    if (disabled || isUploading) {
      return;
    }

    if (!file) {
      setUploadState({
        status: "error",
        message: "Vui lòng chọn ảnh trước khi upload."
      });
      return;
    }

    setIsUploading(true);
    setUploadState(INITIAL_UPLOAD_STATE);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", titleSeed);
    formData.append("code", "");
    formData.append("altText", altSeed);
    formData.append("groupKey", groupKey);
    formData.append("sortOrder", "0");
    formData.append("isActive", "on");
    formData.append("width", "");
    formData.append("height", "");

    try {
      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData
      });

      const result = (await response.json().catch(() => null)) as UploadApiResponse | null;

      if (!response.ok || !result?.success || !result.asset?.url) {
        setUploadState({
          status: "error",
          message: result?.message ?? "Không thể upload ảnh. Vui lòng thử lại."
        });
        return;
      }

      onUploaded(result.asset.url);
      setUploadState({
        status: "success",
        message: "Upload thành công và đã chèn ảnh vào block."
      });
      setFile(null);
    } catch {
      setUploadState({
        status: "error",
        message: "Lỗi kết nối khi upload ảnh. Vui lòng thử lại."
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
      <p className="text-xs font-semibold text-slate-700">Upload ảnh nhanh cho field này</p>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="file"
          accept="image/*"
          disabled={disabled || isUploading}
          onChange={(event) => {
            const nextFile = event.target.files?.[0];
            setFile(nextFile ?? null);
          }}
          className="max-w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 file:mr-2 file:rounded file:border-0 file:bg-teal-50 file:px-2 file:py-1 file:text-[11px] file:font-semibold file:text-teal-700"
        />
        <button
          type="button"
          disabled={disabled || isUploading}
          onClick={handleUpload}
          className={cn(
            "inline-flex rounded-md px-2.5 py-1.5 text-xs font-semibold text-white",
            disabled || isUploading ? "cursor-not-allowed bg-slate-400" : "bg-indigo-600 hover:bg-indigo-700"
          )}
        >
          {isUploading ? "Đang upload..." : "Upload & chèn"}
        </button>
      </div>
      <UploadNotice state={uploadState} />
    </div>
  );
}

function BlockFieldInput({
  field,
  fieldKeyPrefix,
  mediaAssets,
  sectionKey,
  sectionName,
  blockKey,
  blockLabel,
  disabled
}: {
  field: HomeBlockEditorField;
  fieldKeyPrefix: string;
  mediaAssets: MediaAssetItem[];
  sectionKey: string;
  sectionName: string;
  blockKey: string;
  blockLabel: string;
  disabled: boolean;
}) {
  const [value, setValue] = useState(field.value);
  const [selectedAssetUrl, setSelectedAssetUrl] = useState("");

  const imageField = isImageLikeField(field);
  const commonClassName =
    "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200";

  const suggestedAssets = useMemo(() => {
    const normalizedSectionKey = normalizeText(sectionKey);
    const normalizedBlockKey = normalizeText(blockKey);
    const byGroup = mediaAssets.filter((asset) => {
      const group = normalizeText(asset.groupKey);
      return group.includes(normalizedSectionKey) || group.includes(normalizedBlockKey);
    });

    if (byGroup.length > 0) {
      return byGroup.slice(0, 30);
    }

    return mediaAssets.slice(0, 30);
  }, [mediaAssets, sectionKey, blockKey]);

  const datalistId = `media-url-${fieldKeyPrefix}-${field.key}`;

  function applyAssetUrl(url: string) {
    if (!url.trim()) {
      return;
    }

    if (field.type === "lines") {
      setValue((prev) => insertUrlIntoLines(prev, url));
      return;
    }

    setValue(url);
  }

  const uploadGroupKey = toSlug(`${sectionKey}-${blockKey}`, "home-blocks").slice(0, 60);
  const uploadTitleSeed = `${sectionName} - ${blockLabel} - ${field.label}`.slice(0, 160);
  const uploadAltSeed = `${field.label} ${sectionName}`.slice(0, 300);

  return (
    <div className="space-y-2">
      {field.type === "textarea" || field.type === "lines" || field.type === "json" ? (
        <textarea
          name={`field_${field.key}`}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          required={field.required}
          placeholder={field.placeholder}
          rows={field.type === "lines" ? 5 : 4}
          className={commonClassName}
          disabled={disabled}
        />
      ) : null}

      {field.type === "select" ? (
        <select
          name={`field_${field.key}`}
          value={value}
          required={field.required}
          onChange={(event) => setValue(event.target.value)}
          className={cn(commonClassName, "bg-white")}
          disabled={disabled}
        >
          {!field.required ? <option value="">-- Không chọn --</option> : null}
          {(field.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}

      {field.type === "url" ? (
        <>
          <input
            name={`field_${field.key}`}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            required={field.required}
            placeholder={field.placeholder ?? "https://..."}
            type="url"
            list={mediaAssets.length > 0 ? datalistId : undefined}
            className={commonClassName}
            disabled={disabled}
          />
          {mediaAssets.length > 0 ? (
            <datalist id={datalistId}>
              {mediaAssets.map((asset) => (
                <option key={asset.id} value={asset.url}>
                  {asset.title}
                </option>
              ))}
            </datalist>
          ) : null}
        </>
      ) : null}

      {field.type === "text" ? (
        <input
          name={`field_${field.key}`}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          required={field.required}
          placeholder={field.placeholder}
          type="text"
          className={commonClassName}
          disabled={disabled}
        />
      ) : null}

      {imageField ? (
        <div className="space-y-2 rounded-lg border border-teal-200 bg-teal-50 p-2.5">
          <p className="text-xs font-semibold text-teal-800">Thay ảnh nhanh ngay trên block</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              value={selectedAssetUrl}
              onChange={(event) => setSelectedAssetUrl(event.target.value)}
              disabled={disabled || suggestedAssets.length === 0}
              className="min-w-0 flex-1 rounded-md border border-teal-300 bg-white px-2.5 py-2 text-xs text-slate-800"
            >
              <option value="">Chọn ảnh từ thư viện...</option>
              {suggestedAssets.map((asset) => (
                <option key={asset.id} value={asset.url}>
                  {asset.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={disabled || !selectedAssetUrl}
              onClick={() => applyAssetUrl(selectedAssetUrl)}
              className={cn(
                "inline-flex shrink-0 rounded-md px-3 py-2 text-xs font-semibold text-white",
                disabled || !selectedAssetUrl ? "cursor-not-allowed bg-slate-400" : "bg-teal-700 hover:bg-teal-800"
              )}
            >
              Chèn vào field
            </button>
          </div>

          <MediaUploadControl
            disabled={disabled}
            groupKey={uploadGroupKey}
            titleSeed={uploadTitleSeed}
            altSeed={uploadAltSeed}
            onUploaded={applyAssetUrl}
          />
        </div>
      ) : null}
    </div>
  );
}

function BlockEditorCard({
  section,
  block,
  disabled,
  draggable,
  onDragStart,
  onDrop,
  mediaAssets
}: {
  section: HomeSectionEditorItem;
  block: HomeBlockEditorItem;
  disabled: boolean;
  draggable: boolean;
  onDragStart: () => void;
  onDrop: () => void;
  mediaAssets: MediaAssetItem[];
}) {
  const [state, formAction] = useActionState(updateBlockAction, INITIAL_BLOCKS_ACTION_STATE);

  return (
    <article
      draggable={draggable}
      onDragStart={draggable ? onDragStart : undefined}
      onDragOver={draggable ? (event) => event.preventDefault() : undefined}
      onDrop={draggable ? onDrop : undefined}
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-4",
        draggable ? "cursor-move" : "cursor-default"
      )}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{block.label}</h3>
          <p className="mt-1 text-xs text-slate-500">
            `blockKey`: <span className="font-mono">{block.blockKey}</span> - loại:{" "}
            <span className="font-mono">{block.blockType}</span>
          </p>
          {block.description ? <p className="mt-1 text-xs text-slate-600">{block.description}</p> : null}
        </div>
        <span className="inline-flex rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-500">
          Kéo-thả để đổi vị trí
        </span>
      </div>

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="sectionKey" value={section.key} />
        <input type="hidden" name="blockKey" value={block.blockKey} />
        <input type="hidden" name="blockType" value={block.blockType} />
        <input type="hidden" name="sectionTitleFallback" value={section.title} />
        <input type="hidden" name="sectionDescriptionFallback" value={section.description} />

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Tiêu đề khối</span>
            <input
              name="title"
              defaultValue={block.title}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              disabled={disabled}
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Thứ tự hiển thị</span>
            <input
              name="sortOrder"
              type="number"
              defaultValue={block.sortOrder}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              disabled={disabled}
            />
          </label>
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={block.isActive}
            className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
            disabled={disabled}
          />
          Hiển thị khối này trên trang công khai
        </label>

        {block.mode === "template" ? (
          <div className="grid gap-3">
            {block.fields.map((field) => (
              <label key={field.key} className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">{field.label}</span>
                <BlockFieldInput
                  field={field}
                  fieldKeyPrefix={`${section.key}-${block.blockKey}`}
                  mediaAssets={mediaAssets}
                  sectionKey={section.key}
                  sectionName={section.name}
                  blockKey={block.blockKey}
                  blockLabel={block.label}
                  disabled={disabled}
                />
                {field.helperText ? <span className="mt-1 block text-xs text-slate-500">{field.helperText}</span> : null}
              </label>
            ))}
          </div>
        ) : (
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Nội dung JSON</span>
            <textarea
              name="content_json"
              defaultValue={block.rawJson}
              rows={8}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-xs text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              disabled={disabled}
            />
          </label>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <SubmitButton label="Lưu khối nội dung" disabled={disabled} />
        </div>

        <ActionNotice state={state} />
      </form>
    </article>
  );
}

function SectionEditorCard({
  section,
  disabled,
  mediaAssets,
  draggable,
  onDragStart,
  onDrop,
  onBlockDragStart,
  onBlockDrop
}: {
  section: HomeSectionEditorItem;
  disabled: boolean;
  mediaAssets: MediaAssetItem[];
  draggable: boolean;
  onDragStart: () => void;
  onDrop: () => void;
  onBlockDragStart: (blockKey: string) => void;
  onBlockDrop: (targetBlockKey: string) => void;
}) {
  const [state, formAction] = useActionState(updateSectionAction, INITIAL_BLOCKS_ACTION_STATE);

  return (
    <section
      draggable={draggable}
      onDragStart={draggable ? onDragStart : undefined}
      onDragOver={draggable ? (event) => event.preventDefault() : undefined}
      onDrop={draggable ? onDrop : undefined}
      className={cn("rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5", draggable ? "cursor-move" : "")}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{section.name}</h2>
          <p className="mt-1 text-xs text-slate-500">
            `sectionKey`: <span className="font-mono">{section.key}</span> - {section.type}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-500">
            Kéo-thả để đổi vị trí
          </span>
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
              section.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
            )}
          >
            {section.isActive ? "Đang hiển thị" : "Đang ẩn"}
          </span>
        </div>
      </div>

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="sectionKey" value={section.key} />

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Tiêu đề mục</span>
          <input
            name="title"
            defaultValue={section.title}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            disabled={disabled}
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Mô tả mục</span>
          <textarea
            name="description"
            defaultValue={section.description}
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            disabled={disabled}
          />
        </label>

        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={section.isActive}
            className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
            disabled={disabled}
          />
          Hiển thị mục này trên trang công khai
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <SubmitButton label="Lưu mục nội dung" disabled={disabled} />
        </div>

        <ActionNotice state={state} />
      </form>

      {section.blocks.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {section.blocks.map((block) => (
            <BlockEditorCard
              key={`${section.key}:${block.blockKey}`}
              section={section}
              block={block}
              disabled={disabled}
              draggable
              onDragStart={() => onBlockDragStart(block.blockKey)}
              onDrop={() => onBlockDrop(block.blockKey)}
              mediaAssets={mediaAssets}
            />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-sm text-slate-600">
          Mục này hiện chưa có khối nội dung con.
        </div>
      )}
    </section>
  );
}

export function AdminBlocksEditor({
  sections,
  mediaAssets,
  databaseReady,
  builderPages,
  currentPageKey,
  previewPath
}: BlocksEditorProps) {
  const [layoutState, layoutAction] = useActionState(saveLayoutOrderAction, INITIAL_BLOCKS_ACTION_STATE);
  const [editorSections, setEditorSections] = useState<HomeSectionEditorItem[]>(() => normalizeSortOrder(sections));
  const [layoutDirty, setLayoutDirty] = useState(false);
  const [dragSectionKey, setDragSectionKey] = useState<string | null>(null);
  const [dragBlock, setDragBlock] = useState<{ sectionKey: string; blockKey: string } | null>(null);
  const [previewVersion, setPreviewVersion] = useState(1);
  const previewHref = `${previewPath}${previewPath.includes("?") ? "&" : "?"}preview=${previewVersion}`;

  const layoutJson = useMemo(
    () =>
      JSON.stringify(
        editorSections.map((section) => ({
          sectionKey: section.key,
          blocks: section.blocks.map((block) => block.blockKey)
        }))
      ),
    [editorSections]
  );

  function applySectionReorder(sourceSectionKey: string, targetSectionKey: string) {
    if (sourceSectionKey === targetSectionKey) {
      return;
    }

    const sourceIndex = editorSections.findIndex((section) => section.key === sourceSectionKey);
    const targetIndex = editorSections.findIndex((section) => section.key === targetSectionKey);
    if (sourceIndex < 0 || targetIndex < 0) {
      return;
    }

    const reordered = reorderArray(editorSections, sourceIndex, targetIndex);
    setEditorSections(normalizeSortOrder(reordered));
    setLayoutDirty(true);
  }

  function applyBlockReorder(sectionKey: string, sourceBlockKey: string, targetBlockKey: string) {
    if (sourceBlockKey === targetBlockKey) {
      return;
    }

    setEditorSections((prev) => {
      const next = prev.map((section) => {
        if (section.key !== sectionKey) {
          return section;
        }

        const sourceIndex = section.blocks.findIndex((block) => block.blockKey === sourceBlockKey);
        const targetIndex = section.blocks.findIndex((block) => block.blockKey === targetBlockKey);
        if (sourceIndex < 0 || targetIndex < 0) {
          return section;
        }

        return {
          ...section,
          blocks: reorderArray(section.blocks, sourceIndex, targetIndex)
        };
      });

      return normalizeSortOrder(next);
    });

    setLayoutDirty(true);
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900">Chon trang can chinh sua</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {builderPages.map((page) => {
            const active = page.key === currentPageKey;
            return (
              <Link
                key={page.key}
                href={`/admincp/blocks?page=${page.key}`}
                className={cn(
                  "inline-flex rounded-lg border px-3 py-2 text-xs font-semibold transition",
                  active
                    ? "border-teal-600 bg-teal-600 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                {page.label}
              </Link>
            );
          })}
        </div>
      </section>

      {!databaseReady ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Chưa cấu hình <code>DATABASE_URL</code>. Bạn vẫn xem được cấu trúc block nhưng chưa thể lưu thay đổi.
        </div>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
            <h3 className="text-sm font-semibold text-indigo-900">Bố cục kéo-thả</h3>
            <p className="mt-1 text-xs text-indigo-800">
              Kéo section hoặc block để đổi vị trí. Mỗi field ảnh trong block đều hỗ trợ chọn ảnh từ thư viện hoặc upload trực tiếp.
            </p>

            <form action={layoutAction} className="mt-3 flex flex-wrap items-center gap-2">
              <input type="hidden" name="layout_json" value={layoutJson} />
              <LayoutSubmitButton disabled={!databaseReady || !layoutDirty} />
              <button
                type="button"
                onClick={() => setPreviewVersion((value) => value + 1)}
                className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-white"
              >
                Làm mới preview
              </button>
              {layoutDirty ? <span className="text-xs text-amber-700">Có thay đổi chưa lưu</span> : null}
            </form>

            <div className="mt-3">
              <ActionNotice state={layoutState} />
            </div>
          </div>

          {editorSections.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-600">
              Trang nay chua co section. Ban co the tao section/block moi theo page key trong SQL, sau do quay lai de
              keo-tha.
            </div>
          ) : (
            editorSections.map((section) => (
              <SectionEditorCard
                key={section.key}
                section={section}
                disabled={!databaseReady}
                mediaAssets={mediaAssets}
                draggable
                onDragStart={() => {
                  setDragSectionKey(section.key);
                  setDragBlock(null);
                }}
                onDrop={() => {
                  if (dragSectionKey) {
                    applySectionReorder(dragSectionKey, section.key);
                  }
                  setDragSectionKey(null);
                }}
                onBlockDragStart={(blockKey) => {
                  setDragBlock({ sectionKey: section.key, blockKey });
                  setDragSectionKey(null);
                }}
                onBlockDrop={(targetBlockKey) => {
                  if (dragBlock && dragBlock.sectionKey === section.key) {
                    applyBlockReorder(section.key, dragBlock.blockKey, targetBlockKey);
                  }
                  setDragBlock(null);
                }}
              />
            ))
          )}
        </div>

        <div className="space-y-4">
          <MediaAssetPanel mediaAssets={mediaAssets} />

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900">Preview trang da chon</h3>
              <Link href={previewHref} target="_blank" className="text-xs font-semibold text-teal-700 hover:underline">
                Mở tab mới
              </Link>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <iframe title="Landing Page Preview" src={previewHref} className="h-[70vh] w-full bg-white" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
