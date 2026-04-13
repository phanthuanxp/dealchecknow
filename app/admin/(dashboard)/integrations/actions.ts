"use server";

import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import {
  API_CREDENTIAL_PROVIDERS,
  saveApiCredentialForTenant,
  type ApiCredentialProvider
} from "@/lib/api-credentials";
import { resolveTenantIdForSessionUser } from "@/lib/tenant";

type ActionStatus = "idle" | "success" | "error";

export type IntegrationActionState = {
  status: ActionStatus;
  message: string;
};

const inputSchema = z.object({
  provider: z.enum(API_CREDENTIAL_PROVIDERS),
  tenantId: z.string().trim().optional(),
  secretInput: z.string().trim().max(5000, "Secret qua dai."),
  isActive: z.boolean()
});

function success(message: string): IntegrationActionState {
  return { status: "success", message };
}

function failure(message: string): IntegrationActionState {
  return { status: "error", message };
}

export async function saveIntegrationCredentialAction(
  _prev: IntegrationActionState,
  formData: FormData
): Promise<IntegrationActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return failure("Phien dang nhap da het han.");
  }

  if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.EDITOR) {
    return failure("Ban khong co quyen cap nhat API key.");
  }

  if (!process.env.DATABASE_URL) {
    return failure("Thieu DATABASE_URL.");
  }

  if (!process.env.ENCRYPTION_MASTER_KEY) {
    return failure("Thieu ENCRYPTION_MASTER_KEY de ma hoa secret.");
  }

  const parsed = inputSchema.safeParse({
    provider: String(formData.get("provider") ?? "") as ApiCredentialProvider,
    tenantId: String(formData.get("tenantId") ?? "").trim() || undefined,
    secretInput: String(formData.get("secretInput") ?? ""),
    isActive: formData.get("isActive") === "on"
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Du lieu khong hop le.");
  }

  const sessionTenantId = await resolveTenantIdForSessionUser(session.user);
  const requestedTenantId = parsed.data.tenantId ?? sessionTenantId ?? null;

  if (session.user.role !== UserRole.ADMIN && requestedTenantId !== sessionTenantId) {
    return failure("Ban chi duoc cap nhat API key cua website hien tai.");
  }

  try {
    const saved = await saveApiCredentialForTenant({
      tenantId: requestedTenantId,
      provider: parsed.data.provider,
      secretInput: parsed.data.secretInput,
      isActive: parsed.data.isActive
    });

    if (!saved.ok) {
      return failure(saved.message);
    }

    revalidatePath("/admincp/integrations", "page");
    return success("Da luu API credential thanh cong.");
  } catch {
    return failure("Khong the luu API credential. Vui long thu lai.");
  }
}
