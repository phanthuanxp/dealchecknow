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

const routePricingSchema = z.object({
  routeName: z.string().trim().min(4, "Tên tuyến phải có ít nhất 4 ký tự.").max(200, "Tên tuyến quá dài."),
  fromLocation: z.string().trim().min(2, "Điểm đi phải có ít nhất 2 ký tự.").max(120, "Điểm đi quá dài."),
  toLocation: z.string().trim().min(2, "Điểm đến phải có ít nhất 2 ký tự.").max(120, "Điểm đến quá dài."),
  price4: z.coerce.number().min(1000, "Giá xe 4 chỗ phải lớn hơn 1.000."),
  price7: z.coerce.number().min(1000, "Giá xe 7 chỗ phải lớn hơn 1.000."),
  price16: z.coerce.number().min(1000, "Giá xe 16 chỗ phải lớn hơn 1.000."),
  currency: z.string().trim().min(2).max(8),
  unit: z.string().trim().min(2).max(30),
  description: z.string().trim().max(1000),
  sortOrder: z.coerce.number().int().min(-999).max(9999),
  isPopular: z.boolean(),
  isActive: z.boolean(),
  showOnHome: z.boolean(),
  baseCode: z.string().trim().max(120)
});

const updateRoutePricingSchema = routePricingSchema.extend({
  tier4Id: z.string().trim().optional(),
  tier7Id: z.string().trim().optional(),
  tier16Id: z.string().trim().optional()
});

const deleteRoutePricingSchema = z.object({
  ids: z.string().trim().min(1)
});

type SeatTierConfig = {
  vehicleType: string;
  codeSuffix: string;
  sortOffset: number;
  price: number;
  id?: string;
};

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

function buildTierConfigs(params: {
  price4: number;
  price7: number;
  price16: number;
  tier4Id?: string;
  tier7Id?: string;
  tier16Id?: string;
}): SeatTierConfig[] {
  return [
    {
      vehicleType: "Xe 4 chỗ",
      codeSuffix: "xe-4-cho",
      sortOffset: 0,
      price: params.price4,
      id: params.tier4Id?.trim() || undefined
    },
    {
      vehicleType: "Xe 7 chỗ",
      codeSuffix: "xe-7-cho",
      sortOffset: 1,
      price: params.price7,
      id: params.tier7Id?.trim() || undefined
    },
    {
      vehicleType: "Xe 16 chỗ",
      codeSuffix: "xe-16-cho",
      sortOffset: 2,
      price: params.price16,
      id: params.tier16Id?.trim() || undefined
    }
  ];
}

export async function createPricingRouteAction(
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

  const parsed = routePricingSchema.safeParse({
    routeName: String(formData.get("routeName") ?? ""),
    fromLocation: String(formData.get("fromLocation") ?? ""),
    toLocation: String(formData.get("toLocation") ?? ""),
    price4: String(formData.get("price4") ?? ""),
    price7: String(formData.get("price7") ?? ""),
    price16: String(formData.get("price16") ?? ""),
    currency: String(formData.get("currency") ?? "VND"),
    unit: String(formData.get("unit") ?? "chuyến"),
    description: String(formData.get("description") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? "0"),
    isPopular: formData.get("isPopular") === "on",
    isActive: formData.get("isActive") === "on",
    showOnHome: formData.get("showOnHome") === "on",
    baseCode: String(formData.get("baseCode") ?? "")
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Dữ liệu bảng giá không hợp lệ.");
  }

  const baseCode = toCode(
    parsed.data.baseCode || `${parsed.data.fromLocation}-${parsed.data.toLocation}`
  );

  if (!baseCode) {
    return failure("Không thể tạo mã tuyến. Vui lòng nhập lại điểm đi và điểm đến.");
  }

  const tiers = buildTierConfigs({
    price4: parsed.data.price4,
    price7: parsed.data.price7,
    price16: parsed.data.price16
  });

  try {
    for (const tier of tiers) {
      const code = await resolveUniqueCode(`${baseCode}-${tier.codeSuffix}`);
      await prisma.pricingItem.create({
        data: {
          code,
          routeName: parsed.data.routeName,
          fromLocation: parsed.data.fromLocation,
          toLocation: parsed.data.toLocation,
          vehicleType: tier.vehicleType,
          price: new Prisma.Decimal(tier.price.toFixed(2)),
          currency: parsed.data.currency.toUpperCase(),
          unit: parsed.data.unit,
          description: parsed.data.description || null,
          sortOrder: parsed.data.sortOrder + tier.sortOffset,
          isPopular: parsed.data.isPopular,
          isActive: parsed.data.isActive,
          showOnHome: parsed.data.showOnHome
        }
      });
    }

    revalidatePricingPaths();
    return success("Đã tạo tuyến giá mới với 3 loại xe.");
  } catch {
    return failure("Không thể tạo tuyến giá.");
  }
}

export async function updatePricingRouteAction(
  _prev: PricingActionState,
  formData: FormData
): Promise<PricingActionState> {
  const authError = await ensureEditorRole();
  if (authError) {
    return failure(authError.error);
  }

  const parsed = updateRoutePricingSchema.safeParse({
    routeName: String(formData.get("routeName") ?? ""),
    fromLocation: String(formData.get("fromLocation") ?? ""),
    toLocation: String(formData.get("toLocation") ?? ""),
    price4: String(formData.get("price4") ?? ""),
    price7: String(formData.get("price7") ?? ""),
    price16: String(formData.get("price16") ?? ""),
    currency: String(formData.get("currency") ?? "VND"),
    unit: String(formData.get("unit") ?? "chuyến"),
    description: String(formData.get("description") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? "0"),
    isPopular: formData.get("isPopular") === "on",
    isActive: formData.get("isActive") === "on",
    showOnHome: formData.get("showOnHome") === "on",
    baseCode: String(formData.get("baseCode") ?? ""),
    tier4Id: String(formData.get("tier4Id") ?? ""),
    tier7Id: String(formData.get("tier7Id") ?? ""),
    tier16Id: String(formData.get("tier16Id") ?? "")
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Dữ liệu bảng giá không hợp lệ.");
  }

  const baseCode = toCode(
    parsed.data.baseCode || `${parsed.data.fromLocation}-${parsed.data.toLocation}`
  );
  if (!baseCode) {
    return failure("Không thể tạo mã tuyến. Vui lòng nhập lại điểm đi và điểm đến.");
  }

  const tiers = buildTierConfigs({
    price4: parsed.data.price4,
    price7: parsed.data.price7,
    price16: parsed.data.price16,
    tier4Id: parsed.data.tier4Id,
    tier7Id: parsed.data.tier7Id,
    tier16Id: parsed.data.tier16Id
  });

  try {
    for (const tier of tiers) {
      const commonData = {
        routeName: parsed.data.routeName,
        fromLocation: parsed.data.fromLocation,
        toLocation: parsed.data.toLocation,
        vehicleType: tier.vehicleType,
        price: new Prisma.Decimal(tier.price.toFixed(2)),
        currency: parsed.data.currency.toUpperCase(),
        unit: parsed.data.unit,
        description: parsed.data.description || null,
        sortOrder: parsed.data.sortOrder + tier.sortOffset,
        isPopular: parsed.data.isPopular,
        isActive: parsed.data.isActive,
        showOnHome: parsed.data.showOnHome
      };

      if (tier.id) {
        await prisma.pricingItem.update({
          where: { id: tier.id },
          data: commonData
        });
        continue;
      }

      const code = await resolveUniqueCode(`${baseCode}-${tier.codeSuffix}`);
      await prisma.pricingItem.create({
        data: {
          code,
          ...commonData
        }
      });
    }

    revalidatePricingPaths();
    return success("Đã cập nhật tuyến giá.");
  } catch {
    return failure("Không thể cập nhật tuyến giá.");
  }
}

export async function deletePricingRouteAction(
  _prev: PricingActionState,
  formData: FormData
): Promise<PricingActionState> {
  const authError = await ensureEditorRole();
  if (authError) {
    return failure(authError.error);
  }

  const parsed = deleteRoutePricingSchema.safeParse({
    ids: String(formData.get("ids") ?? "")
  });

  if (!parsed.success) {
    return failure("Không xác định được tuyến cần xóa.");
  }

  const ids = parsed.data.ids
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (ids.length === 0) {
    return failure("Không xác định được tuyến cần xóa.");
  }

  try {
    await prisma.pricingItem.deleteMany({
      where: { id: { in: ids } }
    });
    revalidatePricingPaths();
    return success("Đã xóa tuyến giá.");
  } catch {
    return failure("Không thể xóa tuyến giá.");
  }
}
