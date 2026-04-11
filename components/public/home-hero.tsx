/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { CarIcon, CheckCircleIcon, PhoneCallIcon, ZaloIcon } from "@/components/public/ui-icons";
import { HeroData } from "@/lib/queries";
import { cn } from "@/lib/utils";

type HomeHeroProps = {
  data: HeroData;
  hotlineTel: string;
  zaloUrl: string;
  className?: string;
};

const defaultBannerImages = [
  { src: "/images/taxi-banner-1.svg", alt: "Taxi phục vụ khách du lịch tại Ninh Bình" },
  { src: "/images/taxi-banner-2.svg", alt: "Xe đưa đón tuyến Ninh Bình đi sân bay Nội Bài" },
  { src: "/images/taxi-banner-3.svg", alt: "Taxi đường dài và xe đoàn tại Ninh Bình" }
];

const fallbackTitle = "Taxi Ninh Bình - Dịch vụ xe riêng an toàn, đặt nhanh 24/7";
const fallbackDescription =
  "Dịch vụ taxi ninh bình hỗ trợ đón nhanh, lái xe thân thiện, xe sạch và tư vấn lộ trình rõ ràng trước chuyến đi.";

const routeLinks = [
  { href: "/taxi-ha-noi-ninh-binh", label: "taxi hà nội ninh bình" },
  { href: "/taxi-noi-bai-ninh-binh", label: "taxi nội bài ninh bình" },
  { href: "/taxi-ninh-binh-ha-noi", label: "taxi ninh bình hà nội" },
  { href: "/taxi-ninh-binh-noi-bai", label: "taxi ninh bình nội bài" }
];

export function HomeHero({ data, hotlineTel, zaloUrl, className }: HomeHeroProps) {
  const bannerImages = useMemo(
    () => (data.bannerImages.length > 0 ? data.bannerImages : defaultBannerImages),
    [data.bannerImages]
  );
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (bannerImages.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % bannerImages.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [bannerImages.length]);

  return (
    <section
      className={cn(
        "rounded-3xl border border-teal-100 bg-white p-5 shadow-sm sm:p-6 lg:h-full lg:p-7",
        className
      )}
    >
      <p className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 sm:text-sm">
        <CarIcon className="h-4 w-4" />
        {data.badge}
      </p>

      <h1 className="mt-3 text-3xl font-black leading-[1.08] tracking-tight sm:text-4xl">
        <span className="bg-gradient-to-r from-slate-900 via-teal-700 to-sky-700 bg-clip-text text-transparent">
          {data.title?.trim() || fallbackTitle}
        </span>
      </h1>

      <p className="mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">
        {data.description?.trim() || fallbackDescription}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {routeLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100"
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="relative mt-5 hidden h-56 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 md:block lg:h-64">
        {bannerImages.map((image, index) => (
          <div
            key={`${image.src}-${index}`}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              activeSlide === index ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          >
            <img src={image.src} alt={image.alt} className="h-full w-full object-cover" />
          </div>
        ))}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/65 to-transparent px-4 py-3">
          <p className="text-xs font-semibold text-white sm:text-sm">
            Taxi ninh bình hỗ trợ xe riêng, xe gia đình và xe đoàn 24/7.
          </p>
        </div>

        <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
          {bannerImages.map((image, index) => (
            <button
              key={`${image.src}-dot-${index}`}
              type="button"
              onClick={() => setActiveSlide(index)}
              className={cn(
                "h-2.5 w-2.5 rounded-full border border-white/80 transition",
                activeSlide === index ? "bg-white" : "bg-white/40"
              )}
              aria-label={`Chuyển đến ảnh banner ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 sm:gap-3">
        <Link
          href={hotlineTel}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <PhoneCallIcon className="h-4 w-4" />
          {data.primaryCtaText}
        </Link>
        <Link
          href={zaloUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
        >
          <ZaloIcon className="h-4 w-4" />
          {data.secondaryCtaText}
        </Link>
      </div>

      <ul className="mt-5 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
        {data.highlights.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
          >
            <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
