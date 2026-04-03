"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { cn } from "@/lib/utils";
import { quoteRequestSchema, tripTypeLabelMap, type QuoteRequestInput } from "@/lib/validation";

type QuoteSectionData = {
  title: string;
  description: string;
  note: string;
};

type QuoteFormSectionProps = {
  data: QuoteSectionData;
  hotlineDisplay: string;
  hotlineTel: string;
};

type QuoteApiResponse = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  telegramDelivered?: boolean;
};

type FormStatus = "idle" | "loading" | "success" | "warning" | "error";

function compactFieldErrors(input: Record<string, string[] | undefined>) {
  return Object.entries(input).reduce<Record<string, string[]>>((acc, [key, value]) => {
    if (Array.isArray(value) && value.length > 0) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

function getDefaultPickupDateTime() {
  const date = new Date(Date.now() + 30 * 60 * 1000);
  date.setSeconds(0, 0);
  const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

const initialFormValues: QuoteRequestInput = {
  pickupLocation: "",
  dropoffLocation: "",
  pickupDateTime: getDefaultPickupDateTime(),
  tripType: "ONE_WAY",
  contactPhoneZalo: ""
};

export function QuoteFormSection({ data, hotlineDisplay, hotlineTel }: QuoteFormSectionProps) {
  const [formValues, setFormValues] = useState<QuoteRequestInput>(initialFormValues);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const isSubmitting = status === "loading";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("idle");
    setSubmitMessage("");
    setFieldErrors({});

    const parsed = quoteRequestSchema.safeParse(formValues);
    if (!parsed.success) {
      setFieldErrors(compactFieldErrors(parsed.error.flatten().fieldErrors));
      setStatus("error");
      setSubmitMessage("Vui lòng kiểm tra lại thông tin trước khi gửi.");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(parsed.data)
      });

      let result: QuoteApiResponse | null = null;
      try {
        result = (await response.json()) as QuoteApiResponse;
      } catch {
        result = null;
      }

      if (!response.ok || !result?.success) {
        setStatus("error");
        setSubmitMessage(result?.message || "Không thể gửi yêu cầu. Vui lòng thử lại.");
        setFieldErrors(result?.errors ?? {});
        return;
      }

      setStatus(result.telegramDelivered === false ? "warning" : "success");
      setSubmitMessage(result.message);
      setFormValues({
        ...initialFormValues,
        pickupDateTime: getDefaultPickupDateTime()
      });
    } catch {
      setStatus("error");
      setSubmitMessage("Kết nối không ổn định. Vui lòng thử lại sau ít phút.");
    }
  }

  function getError(name: keyof QuoteRequestInput) {
    return fieldErrors[name]?.[0];
  }

  return (
    <section id="bao-gia" className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">{data.title}</h2>
          <p className="mt-2 text-sm text-slate-600">{data.description}</p>
        </div>
        <Link
          href={hotlineTel}
          className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
        >
          Gọi nhanh: {hotlineDisplay}
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-3 sm:grid-cols-2" noValidate>
        <div>
          <label htmlFor="pickupLocation" className="mb-1 block text-sm font-medium text-slate-700">
            Điểm đi
          </label>
          <input
            id="pickupLocation"
            name="pickupLocation"
            type="text"
            required
            placeholder="Ví dụ: TP Ninh Bình, Ga Ninh Bình..."
            value={formValues.pickupLocation}
            onChange={(event) =>
              setFormValues((prev) => ({ ...prev, pickupLocation: event.target.value }))
            }
            className={cn(
              "w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2",
              getError("pickupLocation")
                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                : "border-slate-300 focus:border-teal-600 focus:ring-teal-200"
            )}
          />
          {getError("pickupLocation") ? (
            <p className="mt-1 text-xs text-rose-600">{getError("pickupLocation")}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="dropoffLocation" className="mb-1 block text-sm font-medium text-slate-700">
            Điểm đến
          </label>
          <input
            id="dropoffLocation"
            name="dropoffLocation"
            type="text"
            required
            placeholder="Ví dụ: Tam Cốc, Tràng An, Nội Bài..."
            value={formValues.dropoffLocation}
            onChange={(event) =>
              setFormValues((prev) => ({ ...prev, dropoffLocation: event.target.value }))
            }
            className={cn(
              "w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2",
              getError("dropoffLocation")
                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                : "border-slate-300 focus:border-teal-600 focus:ring-teal-200"
            )}
          />
          {getError("dropoffLocation") ? (
            <p className="mt-1 text-xs text-rose-600">{getError("dropoffLocation")}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="pickupDateTime" className="mb-1 block text-sm font-medium text-slate-700">
            Ngày giờ đón
          </label>
          <input
            id="pickupDateTime"
            name="pickupDateTime"
            type="datetime-local"
            required
            value={formValues.pickupDateTime}
            onChange={(event) =>
              setFormValues((prev) => ({ ...prev, pickupDateTime: event.target.value }))
            }
            className={cn(
              "w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2",
              getError("pickupDateTime")
                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                : "border-slate-300 focus:border-teal-600 focus:ring-teal-200"
            )}
          />
          {getError("pickupDateTime") ? (
            <p className="mt-1 text-xs text-rose-600">{getError("pickupDateTime")}</p>
          ) : null}
        </div>

        <div>
          <p className="mb-1 block text-sm font-medium text-slate-700">Loại chuyến</p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(tripTypeLabelMap) as Array<QuoteRequestInput["tripType"]>).map((type) => (
              <label
                key={type}
                className={cn(
                  "flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2.5 text-sm font-medium transition",
                  formValues.tripType === type
                    ? "border-teal-600 bg-teal-50 text-teal-700"
                    : "border-slate-300 text-slate-700 hover:border-teal-300"
                )}
              >
                <input
                  type="radio"
                  name="tripType"
                  value={type}
                  checked={formValues.tripType === type}
                  onChange={() => setFormValues((prev) => ({ ...prev, tripType: type }))}
                  className="sr-only"
                />
                {tripTypeLabelMap[type]}
              </label>
            ))}
          </div>
          {getError("tripType") ? <p className="mt-1 text-xs text-rose-600">{getError("tripType")}</p> : null}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="contactPhoneZalo" className="mb-1 block text-sm font-medium text-slate-700">
            Số điện thoại / Zalo
          </label>
          <input
            id="contactPhoneZalo"
            name="contactPhoneZalo"
            type="tel"
            required
            placeholder={hotlineDisplay}
            value={formValues.contactPhoneZalo}
            onChange={(event) =>
              setFormValues((prev) => ({ ...prev, contactPhoneZalo: event.target.value }))
            }
            className={cn(
              "w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2",
              getError("contactPhoneZalo")
                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                : "border-slate-300 focus:border-teal-600 focus:ring-teal-200"
            )}
          />
          {getError("contactPhoneZalo") ? (
            <p className="mt-1 text-xs text-rose-600">{getError("contactPhoneZalo")}</p>
          ) : (
            <p className="mt-1 text-xs text-slate-500">Đội ngũ sẽ gọi hoặc nhắn Zalo qua số bạn cung cấp.</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "inline-flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold text-white transition sm:w-auto",
              isSubmitting ? "cursor-not-allowed bg-slate-400" : "bg-teal-700 hover:bg-teal-800"
            )}
          >
            {isSubmitting ? "Đang gửi yêu cầu..." : "Nhận báo giá ngay"}
          </button>
        </div>
      </form>

      {status === "success" ? (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {submitMessage}
        </div>
      ) : null}

      {status === "warning" ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {submitMessage}
        </div>
      ) : null}

      {status === "error" ? (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {submitMessage}
        </div>
      ) : null}

      <p className="mt-3 text-xs text-slate-500">{data.note}</p>
    </section>
  );
}
