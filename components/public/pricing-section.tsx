import Image from "next/image";
import Link from "next/link";

import { CarIcon, PhoneCallIcon, RouteIcon } from "@/components/public/ui-icons";
import { PricingData } from "@/lib/queries";

type PricingSectionProps = {
  data: PricingData;
  hotlineTel: string;
  maxRoutes?: number;
};

type PricingItem = PricingData["items"][number];
type SeatKey = "4" | "7" | "16";

type RoutePricingCard = {
  id: string;
  title: string;
  fromLocation: string;
  toLocation: string;
  isPopular: boolean;
  description: string | null;
  tiers: Partial<Record<SeatKey, PricingItem>>;
};

const tierOrder: SeatKey[] = ["4", "7", "16"];

const defaultTierLabel: Record<SeatKey, string> = {
  "4": "Xe 4 chỗ",
  "7": "Xe 7 chỗ",
  "16": "Xe 16 chỗ"
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatCurrency(price: number, currency: string) {
  if (currency.toUpperCase() === "VND") {
    return `${new Intl.NumberFormat("vi-VN").format(price)}đ`;
  }

  return `${new Intl.NumberFormat("vi-VN").format(price)} ${currency}`;
}

function normalizeUnit(unit: string | null | undefined) {
  if (!unit?.trim()) {
    return "chuyến";
  }

  const normalized = normalizeText(unit);
  if (normalized === "trip") {
    return "chuyến";
  }

  return unit.trim();
}

function normalizeLocation(value: string) {
  const normalized = normalizeText(value);

  if (normalized === "ninh binh city") {
    return "TP Ninh Bình";
  }

  if (normalized === "ninh binh") {
    return "Ninh Bình";
  }

  if (normalized === "noi bai airport") {
    return "Sân bay Nội Bài";
  }

  return value.trim();
}

function toTwoWayArrowLabel(label: string) {
  return label
    .replace(/<->/g, " ↔ ")
    .replace(/->/g, " ↔ ")
    .replace(/→/g, " ↔ ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectSeatKey(vehicleType: string): SeatKey | null {
  const normalized = normalizeText(vehicleType);
  if (normalized.includes("16")) {
    return "16";
  }
  if (normalized.includes("7")) {
    return "7";
  }
  if (normalized.includes("4")) {
    return "4";
  }
  return null;
}

function displayVehicleLabel(item: PricingItem | undefined, seatKey: SeatKey) {
  if (!item?.vehicleType?.trim()) {
    return defaultTierLabel[seatKey];
  }

  const normalized = normalizeText(item.vehicleType);
  if (normalized.includes("16")) {
    return "Xe 16 chỗ";
  }
  if (normalized.includes("7")) {
    return "Xe 7 chỗ";
  }
  if (normalized.includes("4")) {
    return "Xe 4 chỗ";
  }

  return item.vehicleType.trim();
}

function resolveRouteImage(routeTitle: string) {
  const normalized = normalizeText(routeTitle);

  if (normalized.includes("noi bai")) {
    return "/images/services/service-noi-bai.jpg";
  }

  if (normalized.includes("ha noi")) {
    return "/images/services/service-ha-noi.webp";
  }

  return "/images/services/service-tour.jpg";
}

function buildRoutePricingCards(items: PricingItem[], maxRoutes?: number): RoutePricingCard[] {
  const cardMap = new Map<string, RoutePricingCard>();

  for (const item of items) {
    const fromLocation = normalizeLocation(item.fromLocation);
    const toLocation = normalizeLocation(item.toLocation);
    const routeBaseTitle = item.routeName?.trim()
      ? toTwoWayArrowLabel(item.routeName)
      : `${fromLocation} ↔ ${toLocation}`;

    const cardKey = normalizeText(`${fromLocation}-${toLocation}`);
    const seatKey = detectSeatKey(item.vehicleType);

    if (!cardMap.has(cardKey)) {
      cardMap.set(cardKey, {
        id: item.id,
        title: routeBaseTitle,
        fromLocation,
        toLocation,
        isPopular: item.isPopular,
        description: item.description,
        tiers: {}
      });
    }

    const card = cardMap.get(cardKey);
    if (!card) {
      continue;
    }

    card.isPopular = card.isPopular || item.isPopular;
    card.description = card.description || item.description;

    if (!seatKey) {
      continue;
    }

    if (!card.tiers[seatKey]) {
      card.tiers[seatKey] = item;
    }
  }

  const cards = [...cardMap.values()];
  if (typeof maxRoutes === "number" && maxRoutes > 0) {
    return cards.slice(0, maxRoutes);
  }
  return cards;
}

export function PricingSection({ data, hotlineTel, maxRoutes }: PricingSectionProps) {
  const routeCards = buildRoutePricingCards(data.items, maxRoutes);

  return (
    <section id="bang-gia" className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900 sm:text-xl">
            <RouteIcon className="h-5 w-5 text-teal-700" />
            {data.title}
          </h2>
          <p className="mt-2 text-sm text-slate-600">{data.description}</p>
        </div>
        <Link
          href={hotlineTel}
          className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700"
        >
          <PhoneCallIcon className="h-4 w-4" />
          Gọi để chốt giá tốt
        </Link>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {routeCards.map((card) => (
          <article
            key={card.id}
            className={`rounded-xl border p-4 ${
              card.isPopular ? "border-teal-300 bg-teal-50" : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="inline-flex items-center gap-1.5 text-base font-bold text-slate-900 sm:text-xl">
                <CarIcon className="h-4 w-4 text-teal-700" />
                {card.title}
              </h3>
              {card.isPopular ? (
                <span className="rounded-full bg-teal-700 px-2 py-1 text-xs font-semibold text-white">
                  Phổ biến
                </span>
              ) : null}
            </div>

            <Image
              src={resolveRouteImage(card.title)}
              alt={`Ảnh tuyến ${card.title}`}
              width={520}
              height={280}
              className="mt-3 h-32 w-full rounded-lg border border-slate-200 object-cover sm:h-36"
            />

            <div className="mt-3 grid grid-cols-3 gap-2">
              {tierOrder.map((seatKey) => {
                const tierItem = card.tiers[seatKey];
                const unit = normalizeUnit(tierItem?.unit);

                return (
                  <div
                    key={`${card.id}-${seatKey}`}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-center"
                  >
                    <p className="text-xs font-semibold text-slate-700">
                      {displayVehicleLabel(tierItem, seatKey)}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold leading-tight text-teal-800 sm:text-xs">
                      {tierItem ? `${formatCurrency(Number(tierItem.price), tierItem.currency)}/${unit}` : "Liên hệ"}
                    </p>
                  </div>
                );
              })}
            </div>

            {card.description ? (
              <p className="mt-3 text-xs text-slate-600">{card.description}</p>
            ) : null}
          </article>
        ))}
      </div>

      {data.note ? (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
          {data.note}
        </p>
      ) : null}
    </section>
  );
}
