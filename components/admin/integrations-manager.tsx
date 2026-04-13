"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  saveIntegrationCredentialAction,
  type IntegrationActionState
} from "@/app/admin/(dashboard)/integrations/actions";
import type { ApiCredentialView } from "@/lib/api-credentials";
import { cn } from "@/lib/utils";

export type IntegrationTenantOption = {
  id: string;
  name: string;
  slug: string;
};

type AdminIntegrationsManagerProps = {
  credentials: ApiCredentialView[];
  databaseReady: boolean;
  encryptionReady: boolean;
  tenantOptions: IntegrationTenantOption[];
  selectedTenantId: string;
  selectedTenantLabel: string;
  canManageAll: boolean;
};

const INITIAL_ACTION_STATE: IntegrationActionState = {
  status: "idle",
  message: ""
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition",
        isDisabled ? "cursor-not-allowed bg-slate-400" : "bg-teal-700 hover:bg-teal-800"
      )}
    >
      {pending ? "Dang luu..." : "Luu credential"}
    </button>
  );
}

function ActionNotice({ state }: { state: IntegrationActionState }) {
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

function CredentialCard({
  credential,
  selectedTenantId,
  disabled
}: {
  credential: ApiCredentialView;
  selectedTenantId: string;
  disabled: boolean;
}) {
  const [state, formAction] = useActionState(saveIntegrationCredentialAction, INITIAL_ACTION_STATE);
  const updatedText = credential.updatedAt
    ? new Date(credential.updatedAt).toLocaleString("vi-VN", {
        hour12: false
      })
    : "Chua cap nhat";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{credential.label}</h3>
          <p className="mt-1 text-xs text-slate-500">Provider: {credential.provider}</p>
        </div>
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
            credential.configured ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
          )}
        >
          {credential.configured ? "Da cau hinh" : "Chua cau hinh"}
        </span>
      </div>

      <p className="text-xs text-slate-600">
        Secret hien tai:{" "}
        <span className="font-mono font-semibold text-slate-900">
          {credential.maskedValue || "Chua co"}
        </span>
      </p>
      <p className="mt-1 text-xs text-slate-500">Cap nhat luc: {updatedText}</p>

      <form action={formAction} className="mt-4 space-y-3">
        <input type="hidden" name="provider" value={credential.provider} />
        <input type="hidden" name="tenantId" value={selectedTenantId} />

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">
            Secret moi (de trong neu giu secret cu)
          </span>
          <input
            name="secretInput"
            type="password"
            autoComplete="off"
            placeholder="Nhap secret API..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            disabled={disabled}
          />
        </label>

        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={credential.isActive}
            className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
            disabled={disabled}
          />
          Kich hoat provider nay
        </label>

        <SubmitButton disabled={disabled} />
        <ActionNotice state={state} />
      </form>
    </article>
  );
}

export function AdminIntegrationsManager({
  credentials,
  databaseReady,
  encryptionReady,
  tenantOptions,
  selectedTenantId,
  selectedTenantLabel,
  canManageAll
}: AdminIntegrationsManagerProps) {
  const disabled = !databaseReady || !encryptionReady;

  return (
    <div className="space-y-4">
      {!databaseReady ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Chua cau hinh DATABASE_URL.
        </div>
      ) : null}

      {!encryptionReady ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Thieu ENCRYPTION_MASTER_KEY. Vui long cau hinh env nay truoc khi luu API credential.
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Website dang quan ly</h2>
            <p className="mt-1 text-sm text-slate-600">{selectedTenantLabel}</p>
          </div>
          {canManageAll ? (
            <form method="get" action="/admincp/integrations" className="flex items-center gap-2">
              <select
                name="tenant"
                defaultValue={selectedTenantId}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                {tenantOptions.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name} ({tenant.slug})
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="inline-flex rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Chuyen
              </button>
            </form>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {credentials.map((credential) => (
          <CredentialCard
            key={credential.provider}
            credential={credential}
            selectedTenantId={selectedTenantId}
            disabled={disabled}
          />
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
        <p>
          Luu y: secret duoc ma hoa truoc khi ghi vao SQL. He thong chi hien thi mask, khong hien thi gia tri goc tren
          AdminCP.
        </p>
        <p className="mt-2">
          Co the ket hop module nay voi Auto Blog o sprint tiep theo de lay key OpenAI/Telegram theo tung website.
        </p>
        <p className="mt-2">
          Ban co the quay lai <Link href="/admincp/websites" className="font-semibold text-teal-700 hover:underline">/admincp/websites</Link> de
          them tenant/domain moi.
        </p>
      </section>
    </div>
  );
}
