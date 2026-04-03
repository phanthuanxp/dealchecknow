"use server";

import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

type ActionStatus = "idle" | "success" | "error";

export type TestimonialActionState = {
  status: ActionStatus;
  message: string;
};

export const INITIAL_TESTIMONIAL_ACTION_STATE: TestimonialActionState = {
  status: "idle",
  message: ""
};

const testimonialSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Mã testimonial phải có ít nhất 2 ký tự.")
    .max(120, "Mã testimonial quá dài.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Mã testimonial chỉ gồm chữ thường, số và dấu gạch ngang."),
  customerName: z.string().trim().min(2, "Tên khách hàng phải có ít nhất 2 ký tự.").max(160, "Tên quá dài."),
  content: z.string().trim().min(10, "Nội dung đánh giá phải có ít nhất 10 ký tự.").max(4000, "Nội dung quá dài."),
  rating: z.coerce.number().int().min(1, "Rating tối thiểu 1 sao.").max(5, "Rating tối đa 5 sao."),
  location: z.string().trim().max(120),
  serviceName: z.string().trim().max(160),
  sortOrder: z.coerce.number().int().min(-999).max(9999),
  isFeatured: z.boolean(),
  isActive: z.boolean()
});

const updateTestimonialSchema = testimonialSchema.extend({
  id: z.string().trim().min(1)
});

const deleteTestimonialSchema = z.object({
  id: z.string().trim().min(1)
});

function toCode(input: string) {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

async function ensureEditorRole() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." };
  }

  if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.EDITOR) {
    return { error: "Bạn không có quyền thao tác đánh giá khách hàng." };
  }

  return null;
}

function success(message: string): TestimonialActionState {
  return { status: "success", message };
}

function failure(message: string): TestimonialActionState {
  return { status: "error", message };
}

async function resolveUniqueCode(baseCode: string, currentId?: string) {
  let candidate = baseCode;
  let suffix = 1;

  while (candidate) {
    const existing = await prisma.testimonial.findUnique({ where: { code: candidate } });
    if (!existing || existing.id === currentId) {
      return candidate;
    }
    suffix += 1;
    candidate = `${baseCode}-${suffix}`.slice(0, 120);
  }

  return `review-${Date.now()}`;
}

function revalidateTestimonialPaths() {
  revalidatePath("/admincp/testimonials", "page");
  revalidatePath("/", "page");
}

export async function createTestimonialAction(
  _prev: TestimonialActionState,
  formData: FormData
): Promise<TestimonialActionState> {
  const authError = await ensureEditorRole();
  if (authError) {
    return failure(authError.error);
  }

  if (!process.env.DATABASE_URL) {
    return failure("Thiếu DATABASE_URL nên chưa thể lưu testimonial.");
  }

  const parsed = testimonialSchema.safeParse({
    code: toCode(String(formData.get("code") ?? "") || String(formData.get("customerName") ?? "")),
    customerName: String(formData.get("customerName") ?? ""),
    content: String(formData.get("content") ?? ""),
    rating: String(formData.get("rating") ?? "5"),
    location: String(formData.get("location") ?? ""),
    serviceName: String(formData.get("serviceName") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? "0"),
    isFeatured: formData.get("isFeatured") === "on",
    isActive: formData.get("isActive") === "on"
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Dữ liệu testimonial không hợp lệ.");
  }

  try {
    const code = await resolveUniqueCode(parsed.data.code);

    await prisma.testimonial.create({
      data: {
        code,
        customerName: parsed.data.customerName,
        content: parsed.data.content,
        rating: parsed.data.rating,
        location: parsed.data.location || null,
        serviceName: parsed.data.serviceName || null,
        sortOrder: parsed.data.sortOrder,
        isFeatured: parsed.data.isFeatured,
        isActive: parsed.data.isActive
      }
    });

    revalidateTestimonialPaths();
    return success("Đã tạo testimonial mới.");
  } catch {
    return failure("Không thể tạo testimonial.");
  }
}

export async function updateTestimonialAction(
  _prev: TestimonialActionState,
  formData: FormData
): Promise<TestimonialActionState> {
  const authError = await ensureEditorRole();
  if (authError) {
    return failure(authError.error);
  }

  const parsed = updateTestimonialSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    code: toCode(String(formData.get("code") ?? "")),
    customerName: String(formData.get("customerName") ?? ""),
    content: String(formData.get("content") ?? ""),
    rating: String(formData.get("rating") ?? "5"),
    location: String(formData.get("location") ?? ""),
    serviceName: String(formData.get("serviceName") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? "0"),
    isFeatured: formData.get("isFeatured") === "on",
    isActive: formData.get("isActive") === "on"
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Dữ liệu testimonial không hợp lệ.");
  }

  try {
    const code = await resolveUniqueCode(parsed.data.code, parsed.data.id);

    await prisma.testimonial.update({
      where: { id: parsed.data.id },
      data: {
        code,
        customerName: parsed.data.customerName,
        content: parsed.data.content,
        rating: parsed.data.rating,
        location: parsed.data.location || null,
        serviceName: parsed.data.serviceName || null,
        sortOrder: parsed.data.sortOrder,
        isFeatured: parsed.data.isFeatured,
        isActive: parsed.data.isActive
      }
    });

    revalidateTestimonialPaths();
    return success("Đã cập nhật testimonial.");
  } catch {
    return failure("Không thể cập nhật testimonial.");
  }
}

export async function deleteTestimonialAction(
  _prev: TestimonialActionState,
  formData: FormData
): Promise<TestimonialActionState> {
  const authError = await ensureEditorRole();
  if (authError) {
    return failure(authError.error);
  }

  const parsed = deleteTestimonialSchema.safeParse({
    id: String(formData.get("id") ?? "")
  });

  if (!parsed.success) {
    return failure("ID testimonial không hợp lệ.");
  }

  try {
    await prisma.testimonial.delete({
      where: { id: parsed.data.id }
    });
    revalidateTestimonialPaths();
    return success("Đã xóa testimonial.");
  } catch {
    return failure("Không thể xóa testimonial.");
  }
}
