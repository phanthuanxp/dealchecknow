"use server";

import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { resolveTenantIdForSessionUser } from "@/lib/tenant";

type ActionStatus = "idle" | "success" | "error";

export type FaqActionState = {
  status: ActionStatus;
  message: string;
};

const faqSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "Slug phải có ít nhất 2 ký tự.")
    .max(140, "Slug quá dài.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang."),
  question: z
    .string()
    .trim()
    .min(6, "Câu hỏi phải có ít nhất 6 ký tự.")
    .max(240, "Câu hỏi quá dài."),
  answer: z
    .string()
    .trim()
    .min(12, "Câu trả lời phải có ít nhất 12 ký tự.")
    .max(6000, "Câu trả lời quá dài."),
  sortOrder: z.coerce.number().int().min(-999).max(9999),
  isActive: z.boolean()
});

const updateFaqSchema = faqSchema.extend({
  id: z.string().trim().min(1)
});

const deleteFaqSchema = z.object({
  id: z.string().trim().min(1)
});

function toSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
}

async function ensureEditorRole() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." };
  }

  if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.EDITOR) {
    return { error: "Bạn không có quyền thao tác FAQ." };
  }

  const tenantId = await resolveTenantIdForSessionUser(session.user);
  return { tenantId };
}

function success(message: string): FaqActionState {
  return { status: "success", message };
}

function failure(message: string): FaqActionState {
  return { status: "error", message };
}

async function resolveUniqueSlug(baseSlug: string, currentId?: string) {
  let candidate = baseSlug;
  let suffix = 1;

  while (candidate) {
    const existing = await prisma.faq.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === currentId) {
      return candidate;
    }

    suffix += 1;
    candidate = `${baseSlug}-${suffix}`.slice(0, 140);
  }

  return `faq-${Date.now()}`;
}

function revalidateFaqPaths() {
  revalidatePath("/admincp/faq", "page");
  revalidatePath("/faq", "page");
  revalidatePath("/", "page");
}

export async function createFaqAction(
  _prev: FaqActionState,
  formData: FormData
): Promise<FaqActionState> {
  const authError = await ensureEditorRole();
  if ("error" in authError) {
    return failure(authError.error ?? "Không đủ quyền thao tác FAQ.");
  }

  if (!process.env.DATABASE_URL) {
    return failure("Thiếu DATABASE_URL nên chưa thể lưu FAQ.");
  }

  const rawSlug = String(formData.get("slug") ?? "");
  const parsed = faqSchema.safeParse({
    slug: toSlug(rawSlug || String(formData.get("question") ?? "")),
    question: String(formData.get("question") ?? ""),
    answer: String(formData.get("answer") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? "0"),
    isActive: formData.get("isActive") === "on"
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Dữ liệu FAQ không hợp lệ.");
  }

  try {
    const slug = await resolveUniqueSlug(parsed.data.slug);

    await prisma.faq.create({
      data: {
        tenantId: authError.tenantId,
        slug,
        question: parsed.data.question,
        answer: parsed.data.answer,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive
      }
    });

    revalidateFaqPaths();
    return success("Đã tạo FAQ mới thành công.");
  } catch {
    return failure("Không thể tạo FAQ. Vui lòng thử lại.");
  }
}

export async function updateFaqAction(
  _prev: FaqActionState,
  formData: FormData
): Promise<FaqActionState> {
  const authError = await ensureEditorRole();
  if ("error" in authError) {
    return failure(authError.error ?? "Không đủ quyền thao tác FAQ.");
  }

  const rawSlug = String(formData.get("slug") ?? "");
  const parsed = updateFaqSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    slug: toSlug(rawSlug || String(formData.get("question") ?? "")),
    question: String(formData.get("question") ?? ""),
    answer: String(formData.get("answer") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? "0"),
    isActive: formData.get("isActive") === "on"
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Dữ liệu FAQ không hợp lệ.");
  }

  try {
    const existing = await prisma.faq.findFirst({
      where: {
        id: parsed.data.id,
        ...(authError.tenantId
          ? {
              OR: [{ tenantId: authError.tenantId }, { tenantId: null }]
            }
          : {})
      },
      select: { id: true }
    });

    if (!existing) {
      return failure("KhÃ´ng tÃ¬m tháº¥y FAQ cáº§n cáº­p nháº­t.");
    }

    const slug = await resolveUniqueSlug(parsed.data.slug, parsed.data.id);

    await prisma.faq.update({
      where: { id: existing.id },
      data: {
        tenantId: authError.tenantId,
        slug,
        question: parsed.data.question,
        answer: parsed.data.answer,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive
      }
    });

    revalidateFaqPaths();
    return success("Đã cập nhật FAQ.");
  } catch {
    return failure("Không thể cập nhật FAQ.");
  }
}

export async function deleteFaqAction(
  _prev: FaqActionState,
  formData: FormData
): Promise<FaqActionState> {
  const authError = await ensureEditorRole();
  if ("error" in authError) {
    return failure(authError.error ?? "Không đủ quyền thao tác FAQ.");
  }

  const parsed = deleteFaqSchema.safeParse({
    id: String(formData.get("id") ?? "")
  });

  if (!parsed.success) {
    return failure("ID FAQ không hợp lệ.");
  }

  try {
    const existing = await prisma.faq.findFirst({
      where: {
        id: parsed.data.id,
        ...(authError.tenantId
          ? {
              OR: [{ tenantId: authError.tenantId }, { tenantId: null }]
            }
          : {})
      },
      select: { id: true }
    });

    if (!existing) {
      return failure("KhÃ´ng tÃ¬m tháº¥y FAQ cáº§n xÃ³a.");
    }

    await prisma.faq.delete({
      where: { id: existing.id }
    });
    revalidateFaqPaths();
    return success("Đã xóa FAQ.");
  } catch {
    return failure("Không thể xóa FAQ.");
  }
}
