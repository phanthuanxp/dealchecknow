"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  updateBlockAction,
  updateSectionAction,
  type BlocksActionState
} from "@/app/admin/(dashboard)/blocks/actions";
import { cn } from "@/lib/utils";
import type { HomeBlockEditorField, HomeBlockEditorItem, HomeSectionEditorItem } from "@/lib/home-blocks";

type BlocksEditorProps = {
  sections: HomeSectionEditorItem[];
  databaseReady: boolean;
};

const INITIAL_BLOCKS_ACTION_STATE: BlocksActionState = {
  status: "idle",
  message: ""
};

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

function renderFieldInput(field: HomeBlockEditorField) {
  const commonClassName =
    "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200";

  if (field.type === "textarea" || field.type === "lines" || field.type === "json") {
    return (
      <textarea
        name={`field_${field.key}`}
        defaultValue={field.value}
        required={field.required}
        placeholder={field.placeholder}
        rows={field.type === "lines" ? 5 : 4}
        className={commonClassName}
      />
    );
  }

  return (
    <input
      name={`field_${field.key}`}
      defaultValue={field.value}
      required={field.required}
      placeholder={field.placeholder}
      type="text"
      className={commonClassName}
    />
  );
}

function BlockEditorCard({
  section,
  block,
  disabled
}: {
  section: HomeSectionEditorItem;
  block: HomeBlockEditorItem;
  disabled: boolean;
}) {
  const [state, formAction] = useActionState(updateBlockAction, INITIAL_BLOCKS_ACTION_STATE);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-slate-900">{block.label}</h3>
        <p className="mt-1 text-xs text-slate-500">
          `blockKey`: <span className="font-mono">{block.blockKey}</span> - type:{" "}
          <span className="font-mono">{block.blockType}</span>
        </p>
        {block.description ? <p className="mt-1 text-xs text-slate-600">{block.description}</p> : null}
      </div>

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="sectionKey" value={section.key} />
        <input type="hidden" name="blockKey" value={block.blockKey} />
        <input type="hidden" name="blockType" value={block.blockType} />
        <input type="hidden" name="sectionTitleFallback" value={section.title} />
        <input type="hidden" name="sectionDescriptionFallback" value={section.description} />

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Tiêu đề block</span>
            <input
              name="title"
              defaultValue={block.title}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Thứ tự hiển thị</span>
            <input
              name="sortOrder"
              type="number"
              defaultValue={block.sortOrder}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            />
          </label>
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={block.isActive}
            className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
          />
          Publish block này ra public
        </label>

        {block.mode === "template" ? (
          <div className="grid gap-3">
            {block.fields.map((field) => (
              <label key={field.key} className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">{field.label}</span>
                {renderFieldInput(field)}
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
            />
          </label>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <SubmitButton label="Lưu block" disabled={disabled} />
          <span className="text-xs text-slate-500">Lưu xong sẽ tự cập nhật public site.</span>
        </div>

        <ActionNotice state={state} />
      </form>
    </article>
  );
}

function SectionEditorCard({ section, disabled }: { section: HomeSectionEditorItem; disabled: boolean }) {
  const [state, formAction] = useActionState(updateSectionAction, INITIAL_BLOCKS_ACTION_STATE);

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{section.name}</h2>
          <p className="mt-1 text-xs text-slate-500">
            `sectionKey`: <span className="font-mono">{section.key}</span> - {section.type}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
            section.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
          )}
        >
          {section.isActive ? "Đang publish" : "Đang ẩn"}
        </span>
      </div>

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="sectionKey" value={section.key} />

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Tiêu đề section</span>
          <input
            name="title"
            defaultValue={section.title}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Mô tả section</span>
          <textarea
            name="description"
            defaultValue={section.description}
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          />
        </label>

        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={section.isActive}
            className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
          />
          Publish section này ra public
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <SubmitButton label="Lưu section" disabled={disabled} />
          <span className="text-xs text-slate-500">Ẩn section sẽ ẩn toàn bộ dữ liệu section ở homepage.</span>
        </div>

        <ActionNotice state={state} />
      </form>

      {section.blocks.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {section.blocks.map((block) => (
            <BlockEditorCard key={`${section.key}:${block.blockKey}`} section={section} block={block} disabled={disabled} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-sm text-slate-600">
          Section này hiện không có block con.
        </div>
      )}
    </section>
  );
}

export function AdminBlocksEditor({ sections, databaseReady }: BlocksEditorProps) {
  return (
    <div className="space-y-4">
      {!databaseReady ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Chưa cấu hình `DATABASE_URL`. Bạn vẫn xem được cấu trúc block, nhưng không thể lưu thay đổi cho tới khi kết nối
          PostgreSQL.
        </div>
      ) : null}

      {sections.map((section) => (
        <SectionEditorCard key={section.key} section={section} disabled={!databaseReady} />
      ))}
    </div>
  );
}
