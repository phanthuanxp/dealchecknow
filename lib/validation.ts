import { z } from "zod";

export const tripTypeSchema = z.enum(["ONE_WAY", "ROUND_TRIP"]);

export const tripTypeLabelMap: Record<z.infer<typeof tripTypeSchema>, string> = {
  ONE_WAY: "Một chiều",
  ROUND_TRIP: "Hai chiều"
};

export const vehicleTypeSchema = z.enum(["SEDAN_4", "SUV_7", "VAN_16", "LIMOUSINE", "OTHER"]);

export const vehicleTypeLabelMap: Record<z.infer<typeof vehicleTypeSchema>, string> = {
  SEDAN_4: "Xe 4 chỗ",
  SUV_7: "Xe 7 chỗ",
  VAN_16: "Xe 16 chỗ",
  LIMOUSINE: "Limousine",
  OTHER: "Xe khác"
};

const vietnamDateTimeLocalPattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

function normalizeContact(value: string) {
  return value.replace(/[\s.-]+/g, "");
}

function normalizeOptionalText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function parseVietnamDateTimeLocal(value: string): Date | null {
  const matched = value.match(vietnamDateTimeLocalPattern);
  if (!matched) {
    return null;
  }

  const year = Number(matched[1]);
  const month = Number(matched[2]);
  const day = Number(matched[3]);
  const hour = Number(matched[4]);
  const minute = Number(matched[5]);

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    Number.isNaN(hour) ||
    Number.isNaN(minute)
  ) {
    return null;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day, hour - 7, minute, 0));
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const localInVietnamOffset = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  if (
    localInVietnamOffset.getUTCFullYear() !== year ||
    localInVietnamOffset.getUTCMonth() + 1 !== month ||
    localInVietnamOffset.getUTCDate() !== day ||
    localInVietnamOffset.getUTCHours() !== hour ||
    localInVietnamOffset.getUTCMinutes() !== minute
  ) {
    return null;
  }

  return date;
}

export const quoteRequestSchema = z.object({
  pickupLocation: z
    .string()
    .trim()
    .min(2, "Điểm đón phải có ít nhất 2 ký tự.")
    .max(200, "Điểm đón không được vượt quá 200 ký tự."),
  stopovers: z
    .string()
    .max(300, "Điểm dừng không được vượt quá 300 ký tự.")
    .optional()
    .transform((value) => (typeof value === "string" ? normalizeOptionalText(value) : undefined)),
  dropoffLocation: z
    .string()
    .trim()
    .min(2, "Điểm đến phải có ít nhất 2 ký tự.")
    .max(200, "Điểm đến không được vượt quá 200 ký tự."),
  pickupDateTime: z
    .string()
    .trim()
    .refine((value) => parseVietnamDateTimeLocal(value) !== null, {
      message: "Ngày giờ đón không hợp lệ."
    }),
  vehicleType: vehicleTypeSchema,
  tripType: tripTypeSchema,
  needVat: z.boolean().optional().default(false),
  desiredPrice: z
    .string()
    .max(30, "Giá cước mong muốn không hợp lệ.")
    .optional()
    .transform((value) => (typeof value === "string" ? normalizeOptionalText(value) : undefined))
    .refine((value) => !value || /^[\d.,\s]{4,30}$/.test(value), {
      message: "Giá cước mong muốn không hợp lệ."
    }),
  fullName: z
    .string()
    .trim()
    .min(2, "Vui lòng nhập họ tên.")
    .max(80, "Họ tên không được vượt quá 80 ký tự."),
  contactPhoneZalo: z
    .string()
    .trim()
    .min(8, "Số điện thoại / Zalo không hợp lệ.")
    .max(25, "Số điện thoại / Zalo không hợp lệ.")
    .transform(normalizeContact)
    .refine((value) => /^\+?\d{8,15}$/.test(value), {
      message: "Số điện thoại / Zalo không hợp lệ."
    }),
  note: z
    .string()
    .max(500, "Ghi chú không được vượt quá 500 ký tự.")
    .optional()
    .transform((value) => (typeof value === "string" ? normalizeOptionalText(value) : undefined))
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;
