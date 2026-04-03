"use server";

import { Prisma, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

type ActionStatus = "idle" | "success" | "error";

export type PricingActionState = {
  status: ActionStatus;
  message: string;
};

const pricingSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Mã tuyến phải có ít nhất 2 ký tự.")
    .max(120, "Mã tuyến quá dài.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Mã tuyến chỉ gồm chữ thường, số và dấu gạch ngang."),
  routeName: z.string().trim().min(4, "Tên tuyến phải có ít nhất 4 ký tự.").max(200, "Tên tuyến quá dài."),
  fromLocation: z.string().trim().min(2, "Điểm đi phải có ít nhất 2 ký tự.").max(120, "Điểm đi quá dài."),
  toLocation: z.string().trim().min(2, "Điểm đến phải có ít nhất 2 ký tự.").max(120, "Điểm đến quá dài."),
  vehicleType: z.string().trim().min(2, "Loại xe phải có ít nhất 2 ký tự.").max(120, "Loại xe quá dài."),
  price: z.coerce.number().min(1000, "Giá phải lớn hơn 1.000."),
  currency: z.string().trim().min(2).max(8),
  unit: z.string().trim().min(2).max(30),
  description: z.string().trim().max(1000),
  sortOrder: z.coerce.number().int().min(-999).max(9999),
  isPopular: z.boolean(),
  isActive: z.boolean()
});

const updatePricingSchema = pricingSchema.extend({
  id: z.string().trim().min(1)
});

const deletePricingSchema = z.object({
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
    return { error: "Bạn không có quyền thao tác bảng giá." };
  }

  return null;
}

function success(message: string): PricingActionState {
  return { status: "success", message };
}

function failure(message: string): PricingActionState {
  return { status: "error", message };
}

async function resolveUniqueCode(baseCode: string, currentId?: string) {
  let candidate = baseCode;
  let suffix = 1;

  while (candidate) {
    const existing = await prisma.pricingItem.findUnique({ where: { code: candidate } });
    if (!existing || existing.id === currentId) {
      return candidate;
    }
    suffix += 1;
    candidate = `${baseCode}-${suffix}`.slice(0, 120);
  }

  return `price-${Date.now()}`;
}

function revalidatePricingPaths() {
  revalidatePath("/admincp/pricing", "page");
  revalidatePath("/", "page");
  revalidatePath("/bang-gia", "page");
}

export async function createPricingAction(
  _prev: PricingActionState,
  formData: FormData
): Promise<PricingActionState> {
  const authError = await ensureEditorRole();
  if (authError) {
    return failure(authError.error);
  }

  if (!process.env.DATABASE_URL) {
    return failure("Thiếu DATABASE_URL nên chưa thể lưu bảng giá.");
  }

  const rawCode = String(formData.get("code") ?? "");
  const parsed = pricingSchema.safeParse({
    code: toCode(rawCode || `${String(formData.get("fromLocation") ?? "")}-${String(formData.get("toLocation") ?? "")}-${String(formData.get("vehicleType") ?? "")}`),
    routeName: String(formData.get("routeName") ?? ""),
    fromLocation: String(formData.get("fromLocation") ?? ""),
    toLocation: String(formData.get("toLocation") ?? ""),
    vehicleType: String(formData.get("vehicleType") ?? ""),
    price: String(formData.get("price") ?? ""),
    currency: String(formData.get("currency") ?? "VND"),
    unit: String(formData.get("unit") ?? "chuyến"),
    description: String(formData.get("description") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? "0"),
    isPopular: formData.get("isPopular") === "on",
    isActive: formData.get("isActive") === "on"
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Dữ liệu bảng giá không hợp lệ.");
  }

  try {
    const code = await resolveUniqueCode(parsed.data.code);

    await prisma.pricingItem.create({
      data: {
        code,
        routeName: parsed.data.routeName,
        fromLocation: parsed.data.fromLocation,
        toLocation: parsed.data.toLocation,
        vehicleType: parsed.data.vehicleType,
        price: new Prisma.Decimal(parsed.data.price.toFixed(2)),
        currency: parsed.data.currency.toUpperCase(),
        unit: parsed.data.unit,
        description: parsed.data.description || null,
        sortOrder: parsed.data.sortOrder,
        isPopular: parsed.data.isPopular,
        isActive: parsed.data.isActive
      }
    });

    revalidatePricingPaths();
    return success("Đã tạo tuyến giá mới.");
  } catch {
    return failure("Không thể tạo bảng giá.");
  }
}

export async function updatePricingAction(
  _prev: PricingActionState,
  formData: FormData
): Promise<PricingActionState> {
  const authError = await ensureEditorRole();
  if (authError) {
    return failure(authError.error);
  }

  const parsed = updatePricingSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    code: toCode(String(formData.get("code") ?? "")),
    routeName: String(formData.get("routeName") ?? ""),
    fromLocation: String(formData.get("fromLocation") ?? ""),
    toLocation: String(formData.get("toLocation") ?? ""),
    vehicleType: String(formData.get("vehicleType") ?? ""),
    price: String(formData.get("price") ?? ""),
    currency: String(formData.get("currency") ?? "VND"),
    unit: String(formData.get("unit") ?? "chuyến"),
    description: String(formData.get("description") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? "0"),
    isPopular: formData.get("isPopular") === "on",
    isActive: formData.get("isActive") === "on"
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Dữ liệu bảng giá không hợp lệ.");
  }

  try {
    const code = await resolveUniqueCode(parsed.data.code, parsed.data.id);

    await prisma.pricingItem.update({
      where: { id: parsed.data.id },
      data: {
        code,
        routeName: parsed.data.routeName,
        fromLocation: parsed.data.fromLocation,
        toLocation: parsed.data.toLocation,
        vehicleType: parsed.data.vehicleType,
        price: new Prisma.Decimal(parsed.data.price.toFixed(2)),
        currency: parsed.data.currency.toUpperCase(),
        unit: parsed.data.unit,
        description: parsed.data.description || null,
        sortOrder: parsed.data.sortOrder,
        isPopular: parsed.data.isPopular,
        isActive: parsed.data.isActive
      }
    });

    revalidatePricingPaths();
    return success("Đã cập nhật bảng giá.");
  } catch {
    return failure("Không thể cập nhật bảng giá.");
  }
}

export async function deletePricingAction(
  _prev: PricingActionState,
  formData: FormData
): Promise<PricingActionState> {
  const authError = await ensureEditorRole();
  if (authError) {
    return failure(authError.error);
  }

  const parsed = deletePricingSchema.safeParse({
    id: String(formData.get("id") ?? "")
  });

  if (!parsed.success) {
    return failure("ID bảng giá không hợp lệ.");
  }

  try {
    await prisma.pricingItem.delete({
      where: { id: parsed.data.id }
    });
    revalidatePricingPaths();
    return success("Đã xóa bảng giá.");
  } catch {
    return failure("Không thể xóa bảng giá.");
  }
}
