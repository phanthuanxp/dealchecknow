import { tripTypeLabelMap, type QuoteRequestInput } from "@/lib/validation";

type SendQuoteTelegramPayload = Pick<
  QuoteRequestInput,
  "pickupLocation" | "dropoffLocation" | "tripType" | "contactPhoneZalo"
> & {
  pickupDateTime: Date;
  submittedAt: Date;
  siteUrl: string;
};

type TelegramResult = {
  sent: boolean;
  error?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatDateTimeVN(value: Date | string) {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    dateStyle: "short",
    timeStyle: "medium"
  }).format(typeof value === "string" ? new Date(value) : value);
}

export async function sendQuoteRequestTelegram(payload: SendQuoteTelegramPayload): Promise<TelegramResult> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

  if (!botToken || !chatId) {
    return {
      sent: false,
      error: "Thiếu TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID."
    };
  }

  const messageLines = [
    "<b>Yêu cầu báo giá mới</b>",
    "",
    `<b>Điểm đi:</b> ${escapeHtml(payload.pickupLocation)}`,
    `<b>Điểm đến:</b> ${escapeHtml(payload.dropoffLocation)}`,
    `<b>Ngày giờ đón:</b> ${escapeHtml(formatDateTimeVN(payload.pickupDateTime))}`,
    `<b>Loại chuyến:</b> ${escapeHtml(tripTypeLabelMap[payload.tripType])}`,
    `<b>Số điện thoại/Zalo:</b> ${escapeHtml(payload.contactPhoneZalo)}`,
    `<b>Thời gian gửi:</b> ${escapeHtml(formatDateTimeVN(payload.submittedAt))}`,
    `<b>Nguồn website:</b> ${escapeHtml(payload.siteUrl)}`
  ];

  try {
    const timeoutSignal = AbortSignal.timeout(8000);
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      signal: timeoutSignal,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        parse_mode: "HTML",
        text: messageLines.join("\n"),
        disable_web_page_preview: true
      })
    });

    if (!response.ok) {
      const raw = await response.text();
      return {
        sent: false,
        error: `Telegram API lỗi (${response.status}): ${raw.slice(0, 300)}`
      };
    }

    return { sent: true };
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      return {
        sent: false,
        error: "Telegram timeout sau 8 giây."
      };
    }

    return {
      sent: false,
      error: error instanceof Error ? error.message : "Không thể gửi Telegram."
    };
  }
}
