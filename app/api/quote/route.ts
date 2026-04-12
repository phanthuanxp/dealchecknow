import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { getBaseSiteUrl } from "@/lib/seo";
import { sendQuoteRequestTelegram } from "@/lib/telegram";
import { resolveTenantForRequest } from "@/lib/tenant";
import {
  parseVietnamDateTimeLocal,
  quoteRequestSchema,
  tripTypeLabelMap,
  vehicleTypeLabelMap
} from "@/lib/validation";

type ErrorFieldMap = Record<string, string[]>;

function compactFieldErrors(input: Record<string, string[] | undefined>) {
  return Object.entries(input).reduce<ErrorFieldMap>((acc, [key, value]) => {
    if (Array.isArray(value) && value.length > 0) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

function normalizeDesiredPrice(rawValue?: string) {
  if (!rawValue) {
    return undefined;
  }

  const digits = rawValue.replace(/[^\d]/g, "");
  return digits.length > 0 ? Number(digits) : undefined;
}

function buildLeadNote(input: {
  tripType: keyof typeof tripTypeLabelMap;
  vehicleType: keyof typeof vehicleTypeLabelMap;
  contactPhoneZalo: string;
  stopovers?: string;
  needVat?: boolean;
  desiredPrice?: string;
  note?: string;
}) {
  const lines = [
    `Loại chuyến: ${tripTypeLabelMap[input.tripType]}`,
    `Loại xe: ${vehicleTypeLabelMap[input.vehicleType]}`,
    `Số điện thoại/Zalo: ${input.contactPhoneZalo}`
  ];

  if (input.stopovers) {
    lines.push(`Điểm dừng: ${input.stopovers}`);
  }

  if (input.needVat) {
    lines.push("Yêu cầu xuất hóa đơn VAT: Có");
  }

  if (input.desiredPrice) {
    lines.push(`Giá cước mong muốn: ${input.desiredPrice} VNĐ`);
  }

  if (input.note) {
    lines.push(`Ghi chú: ${input.note}`);
  }

  return lines.join("\n");
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Payload không hợp lệ."
      },
      { status: 400 }
    );
  }

  const parsed = quoteRequestSchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors = compactFieldErrors(parsed.error.flatten().fieldErrors);
    return NextResponse.json(
      {
        success: false,
        message: "Vui lòng kiểm tra lại thông tin biểu mẫu.",
        errors: fieldErrors
      },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const pickupTime = parseVietnamDateTimeLocal(data.pickupDateTime);
  if (!pickupTime) {
    return NextResponse.json(
      {
        success: false,
        message: "Ngày giờ đón không hợp lệ."
      },
      { status: 400 }
    );
  }

  const submittedAt = new Date();
  const siteUrl = getBaseSiteUrl();
  const tenant = await resolveTenantForRequest(request);

  const estimatedPriceNumber = normalizeDesiredPrice(data.desiredPrice);

  let quoteRequestId = "";
  try {
    const createdLead = await prisma.quoteRequest.create({
      data: {
        tenantId: tenant?.id ?? null,
        fullName: data.fullName,
        phone: data.contactPhoneZalo,
        pickupLocation: data.pickupLocation,
        dropoffLocation: data.dropoffLocation,
        pickupTime,
        vehicleType: data.tripType,
        estimatedPrice: typeof estimatedPriceNumber === "number" ? estimatedPriceNumber : undefined,
        message: buildLeadNote({
          tripType: data.tripType,
          vehicleType: data.vehicleType,
          contactPhoneZalo: data.contactPhoneZalo,
          stopovers: data.stopovers,
          needVat: data.needVat,
          desiredPrice: data.desiredPrice,
          note: data.note
        }),
        utmSource: "website"
      },
      select: {
        id: true
      }
    });

    quoteRequestId = createdLead.id;
  } catch (error) {
    console.error("Quote API - cannot save lead:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Không thể lưu yêu cầu báo giá. Vui lòng thử lại."
      },
      { status: 500 }
    );
  }

  const telegramResult = await sendQuoteRequestTelegram({
    fullName: data.fullName,
    pickupLocation: data.pickupLocation,
    stopovers: data.stopovers,
    dropoffLocation: data.dropoffLocation,
    pickupDateTime: pickupTime,
    tripType: data.tripType,
    vehicleType: data.vehicleType,
    needVat: data.needVat,
    desiredPrice: data.desiredPrice,
    contactPhoneZalo: data.contactPhoneZalo,
    note: data.note,
    submittedAt,
    siteUrl
  });

  if (!telegramResult.sent) {
    console.warn("Quote API - telegram notify failed:", telegramResult.error);
    return NextResponse.json(
      {
        success: true,
        telegramDelivered: false,
        leadId: quoteRequestId,
        message:
          "Đã nhận yêu cầu báo giá thành công. Hệ thống thông báo nội bộ đang tạm gián đoạn, đội ngũ vẫn sẽ liên hệ sớm."
      },
      { status: 201 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      telegramDelivered: true,
      leadId: quoteRequestId,
      message: "Đã nhận yêu cầu báo giá. Chúng tôi sẽ liên hệ bạn sớm nhất."
    },
    { status: 201 }
  );
}
