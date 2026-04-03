import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { getBaseSiteUrl } from "@/lib/seo";
import { sendQuoteRequestTelegram } from "@/lib/telegram";
import { parseVietnamDateTimeLocal, quoteRequestSchema, tripTypeLabelMap } from "@/lib/validation";

type ErrorFieldMap = Record<string, string[]>;

function compactFieldErrors(input: Record<string, string[] | undefined>) {
  return Object.entries(input).reduce<ErrorFieldMap>((acc, [key, value]) => {
    if (Array.isArray(value) && value.length > 0) {
      acc[key] = value;
    }
    return acc;
  }, {});
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

  let quoteRequestId = "";
  try {
    const createdLead = await prisma.quoteRequest.create({
      data: {
        fullName: "Khách từ website",
        phone: data.contactPhoneZalo,
        pickupLocation: data.pickupLocation,
        dropoffLocation: data.dropoffLocation,
        pickupTime,
        vehicleType: data.tripType,
        message: `Loại chuyến: ${tripTypeLabelMap[data.tripType]}\nSố điện thoại/Zalo: ${data.contactPhoneZalo}`,
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
    pickupLocation: data.pickupLocation,
    dropoffLocation: data.dropoffLocation,
    pickupDateTime: pickupTime,
    tripType: data.tripType,
    contactPhoneZalo: data.contactPhoneZalo,
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
