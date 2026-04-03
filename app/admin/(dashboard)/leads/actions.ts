"use server";

import { QuoteRequestStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

type ActionStatus = "idle" | "success" | "error";

export type LeadActionState = {
  status: ActionStatus;
  message: string;
};

export const INITIAL_LEAD_ACTION_STATE: LeadActionState = {
  status: "idle",
  message: ""
};

const updateLeadStatusSchema = z.object({
  id: z.string().trim().min(1, "ID lead không hợp lệ."),
  status: z.nativeEnum(QuoteRequestStatus)
});

type EnsureEditorRoleResult = { ok: true; userId: string } | { ok: false; error: string };

async function ensureEditorRole(): Promise<EnsureEditorRoleResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." };
  }

  if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.EDITOR) {
    return { ok: false, error: "Bạn không có quyền cập nhật trạng thái lead." };
  }

  return { ok: true, userId: session.user.id };
}

function success(message: string): LeadActionState {
  return { status: "success", message };
}

function failure(message: string): LeadActionState {
  return { status: "error", message };
}

export async function updateLeadStatusAction(
  _prev: LeadActionState,
  formData: FormData
): Promise<LeadActionState> {
  const authResult = await ensureEditorRole();
  if (!authResult.ok) {
    return failure(authResult.error);
  }

  if (!process.env.DATABASE_URL) {
    return failure("Thiếu DATABASE_URL nên chưa thể cập nhật trạng thái lead.");
  }

  const parsed = updateLeadStatusSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    status: String(formData.get("status") ?? "")
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Dữ liệu cập nhật lead không hợp lệ.");
  }

  const isHandledStatus = parsed.data.status !== QuoteRequestStatus.NEW;

  try {
    await prisma.quoteRequest.update({
      where: { id: parsed.data.id },
      data: {
        status: parsed.data.status,
        handledAt: isHandledStatus ? new Date() : null,
        handledById: isHandledStatus ? authResult.userId : null
      }
    });

    revalidatePath("/admincp/leads", "page");
    revalidatePath("/admincp", "page");

    return success("Đã cập nhật trạng thái lead.");
  } catch {
    return failure("Không thể cập nhật trạng thái lead. Vui lòng thử lại.");
  }
}
