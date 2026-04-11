"use client";

import { FormEvent, useMemo, useState } from "react";

import {
  CalendarIcon,
  CarIcon,
  MapPinIcon,
  MoneyIcon,
  PhoneCallIcon,
  PlusIcon,
  UserIcon
} from "@/components/public/ui-icons";
import { cn } from "@/lib/utils";
import {
  quoteRequestSchema,
  type QuoteRequestInput,
  vehicleTypeLabelMap
} from "@/lib/validation";

type QuoteSectionData = {
  title: string;
  description: string;
  note: string;
};

type QuoteFormSectionProps = {
  data: QuoteSectionData;
  hotlineDisplay: string;
  className?: string;
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

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const initialFormValues: QuoteRequestInput = {
  pickupLocation: "",
  stopovers: undefined,
  dropoffLocation: "",
  pickupDateTime: getDefaultPickupDateTime(),
  vehicleType: "SEDAN_4",
  tripType: "ONE_WAY",
  needVat: false,
  desiredPrice: undefined,
  fullName: "",
  contactPhoneZalo: "",
  note: undefined
};

export function QuoteFormSection({ data, hotlineDisplay, className }: QuoteFormSectionProps) {
  const [formValues, setFormValues] = useState<QuoteRequestInput>(initialFormValues);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [showStopoverField, setShowStopoverField] = useState(false);

  const isSubmitting = status === "loading";

  const mainTitle = useMemo(() => {
    const rawTitle = data.title?.trim();

    if (!rawTitle) {
      return "Đặt Xe & Nhận Báo Giá";
    }

    if (normalizeText(rawTitle).includes("nhan bao gia nhanh theo lo trinh")) {
      return "Đặt Xe & Nhận Báo Giá";
    }

    return rawTitle;
  }, [data.title]);

  const mainDescription = useMemo(() => {
    const rawDescription = data.description?.trim();

    if (!rawDescription) {
      return "Điền thông tin chuyến đi để đề xuất mức giá hợp lý";
    }

    if (normalizeText(rawDescription).includes("dien thong tin chuyen di de nhan tu van va bao gia phu hop")) {
      return "Điền thông tin chuyến đi để đề xuất mức giá hợp lý";
    }

    return rawDescription;
  }, [data.description]);

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
      setShowStopoverField(false);
    } catch {
      setStatus("error");
      setSubmitMessage("Kết nối không ổn định. Vui lòng thử lại sau ít phút.");
    }
  }

  function getError(name: keyof QuoteRequestInput) {
    return fieldErrors[name]?.[0];
  }

  return (
    <section
      id="bao-gia"
      className={cn(
        "mt-6 rounded-[28px] border-2 border-sky-600/35 bg-white/95 p-4 shadow-sm sm:p-5 lg:h-full",
        className
      )}
    >
      <div className="text-center">
        <h2 className="bg-gradient-to-r from-blue-700 to-sky-500 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
          {mainTitle}
        </h2>
        <p className="mt-1.5 text-sm font-medium text-slate-600">{mainDescription}</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-2.5" noValidate>
        <div>
          <label htmlFor="pickupLocation" className="mb-1 block text-sm font-semibold text-slate-900">
            <span className="inline-flex items-center gap-1.5">
              <MapPinIcon className="h-4 w-4 text-rose-500" />
              Điểm đón *
            </span>
          </label>
          <input
            id="pickupLocation"
            name="pickupLocation"
            type="text"
            required
            placeholder="Nhập địa chỉ đón"
            value={formValues.pickupLocation}
            onChange={(event) =>
              setFormValues((prev) => ({ ...prev, pickupLocation: event.target.value }))
            }
            className={cn(
              "w-full rounded-xl border px-3.5 py-2.5 text-base text-slate-900 outline-none transition focus:ring-2",
              getError("pickupLocation")
                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                : "border-slate-300 focus:border-sky-500 focus:ring-sky-100"
            )}
          />
          {getError("pickupLocation") ? (
            <p className="mt-1 text-xs text-rose-600">{getError("pickupLocation")}</p>
          ) : null}
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowStopoverField((prev) => !prev)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 transition hover:text-indigo-800"
          >
            <PlusIcon className="h-4 w-4" />
            {showStopoverField ? "Ẩn điểm dừng" : "Thêm điểm dừng"}
          </button>
        </div>

        {showStopoverField ? (
          <div>
            <label htmlFor="stopovers" className="mb-1 block text-sm font-semibold text-slate-900">
              Điểm dừng
            </label>
            <input
              id="stopovers"
              name="stopovers"
              type="text"
              placeholder="Ví dụ: qua bến xe, qua khách sạn..."
              value={formValues.stopovers ?? ""}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, stopovers: event.target.value }))
              }
              className={cn(
                "w-full rounded-xl border px-3.5 py-2.5 text-base text-slate-900 outline-none transition focus:ring-2",
                getError("stopovers")
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                  : "border-slate-300 focus:border-sky-500 focus:ring-sky-100"
              )}
            />
            {getError("stopovers") ? (
              <p className="mt-1 text-xs text-rose-600">{getError("stopovers")}</p>
            ) : null}
          </div>
        ) : null}

        <div>
          <label htmlFor="dropoffLocation" className="mb-1 block text-sm font-semibold text-slate-900">
            <span className="inline-flex items-center gap-1.5">
              <MapPinIcon className="h-4 w-4 text-rose-500" />
              Điểm đến *
            </span>
          </label>
          <input
            id="dropoffLocation"
            name="dropoffLocation"
            type="text"
            required
            placeholder="Nhập địa chỉ đến"
            value={formValues.dropoffLocation}
            onChange={(event) =>
              setFormValues((prev) => ({ ...prev, dropoffLocation: event.target.value }))
            }
            className={cn(
              "w-full rounded-xl border px-3.5 py-2.5 text-base text-slate-900 outline-none transition focus:ring-2",
              getError("dropoffLocation")
                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                : "border-slate-300 focus:border-sky-500 focus:ring-sky-100"
            )}
          />
          {getError("dropoffLocation") ? (
            <p className="mt-1 text-xs text-rose-600">{getError("dropoffLocation")}</p>
          ) : null}
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          <div>
            <label htmlFor="pickupDateTime" className="mb-1 block text-sm font-semibold text-slate-900">
              <span className="inline-flex items-center gap-1.5">
                <CalendarIcon className="h-4 w-4 text-indigo-500" />
                Ngày giờ đón *
              </span>
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
                "quote-datetime-input min-w-0 w-full rounded-xl border px-3 py-2.5 text-sm text-slate-900 outline-none transition sm:px-3.5 sm:text-base focus:ring-2",
                getError("pickupDateTime")
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                  : "border-slate-300 focus:border-sky-500 focus:ring-sky-100"
              )}
            />
            {getError("pickupDateTime") ? (
              <p className="mt-1 text-xs text-rose-600">{getError("pickupDateTime")}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="vehicleType" className="mb-1 block text-sm font-semibold text-slate-900">
              <span className="inline-flex items-center gap-1.5">
                <CarIcon className="h-4 w-4 text-indigo-500" />
                Loại xe *
              </span>
            </label>
            <select
              id="vehicleType"
              name="vehicleType"
              value={formValues.vehicleType}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  vehicleType: event.target.value as QuoteRequestInput["vehicleType"]
                }))
              }
              className={cn(
                "w-full rounded-xl border bg-white px-3.5 py-2.5 text-base text-slate-900 outline-none transition focus:ring-2",
                getError("vehicleType")
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                  : "border-slate-300 focus:border-sky-500 focus:ring-sky-100"
              )}
            >
              {(Object.keys(vehicleTypeLabelMap) as Array<QuoteRequestInput["vehicleType"]>).map((type) => (
                <option key={type} value={type}>
                  {vehicleTypeLabelMap[type]}
                </option>
              ))}
            </select>
            {getError("vehicleType") ? (
              <p className="mt-1 text-xs text-rose-600">{getError("vehicleType")}</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap justify-start gap-5 pt-0.5">
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
            <input
              type="checkbox"
              checked={formValues.tripType === "ROUND_TRIP"}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  tripType: event.target.checked ? "ROUND_TRIP" : "ONE_WAY"
                }))
              }
              className="h-4.5 w-4.5 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
            />
            Hai chiều
          </label>

          <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
            <input
              type="checkbox"
              checked={Boolean(formValues.needVat)}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  needVat: event.target.checked
                }))
              }
              className="h-4.5 w-4.5 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
            />
            Xuất hóa đơn (VAT)
          </label>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-cyan-50 p-3">
          <label htmlFor="desiredPrice" className="mb-1 block text-sm font-bold text-emerald-900">
            <span className="inline-flex items-center gap-1.5">
              <MoneyIcon className="h-4 w-4 text-emerald-600" />
              Giá cước mong muốn (VNĐ)
            </span>
          </label>
          <input
            id="desiredPrice"
            name="desiredPrice"
            type="text"
            inputMode="numeric"
            placeholder="Nhập mức giá bạn mong muốn"
            value={formValues.desiredPrice ?? ""}
            onChange={(event) =>
              setFormValues((prev) => ({ ...prev, desiredPrice: event.target.value }))
            }
            className={cn(
              "w-full rounded-xl border bg-white px-3.5 py-2.5 text-base font-semibold text-slate-900 outline-none transition focus:ring-2",
              getError("desiredPrice")
                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                : "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-100"
            )}
          />
          {getError("desiredPrice") ? (
            <p className="mt-1 text-xs text-rose-600">{getError("desiredPrice")}</p>
          ) : (
            <p className="mt-1 text-[11px] font-medium text-emerald-800">
              Nhập mức giá dự kiến để đội ngũ tư vấn tuyến xe phù hợp nhanh hơn.
            </p>
          )}
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          <div>
            <label htmlFor="fullName" className="mb-1 block text-sm font-semibold text-slate-900">
              <span className="inline-flex items-center gap-1.5">
                <UserIcon className="h-4 w-4 text-indigo-500" />
                Tên của bạn *
              </span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              placeholder="Nhập họ và tên"
              value={formValues.fullName}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, fullName: event.target.value }))
              }
              className={cn(
                "w-full rounded-xl border px-3.5 py-2.5 text-base text-slate-900 outline-none transition focus:ring-2",
                getError("fullName")
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                  : "border-slate-300 focus:border-sky-500 focus:ring-sky-100"
              )}
            />
            {getError("fullName") ? (
              <p className="mt-1 text-xs text-rose-600">{getError("fullName")}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="contactPhoneZalo" className="mb-1 block text-sm font-semibold text-slate-900">
              <span className="inline-flex items-center gap-1.5">
                <PhoneCallIcon className="h-4 w-4 text-pink-600" />
                Số điện thoại / Zalo *
              </span>
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
                "w-full rounded-xl border px-3.5 py-2.5 text-base text-slate-900 outline-none transition focus:ring-2",
                getError("contactPhoneZalo")
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                  : "border-slate-300 focus:border-sky-500 focus:ring-sky-100"
              )}
            />
            {getError("contactPhoneZalo") ? (
              <p className="mt-1 text-xs text-rose-600">{getError("contactPhoneZalo")}</p>
            ) : null}
          </div>
        </div>

        <div className="pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-500 px-4 py-3 text-2xl font-bold text-white transition",
              isSubmitting
                ? "cursor-not-allowed opacity-70"
                : "hover:from-blue-800 hover:to-cyan-600"
            )}
          >
            {isSubmitting ? "Đang gửi yêu cầu..." : "Đặt Giá Mong Muốn"}
          </button>
        </div>
      </form>

      {status === "success" ? (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {submitMessage}
        </div>
      ) : null}

      {status === "warning" ? (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {submitMessage}
        </div>
      ) : null}

      {status === "error" ? (
        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {submitMessage}
        </div>
      ) : null}

      <p className="mt-2.5 text-xs text-slate-500">{data.note}</p>
    </section>
  );
}
