import Image from "next/image";
import Link from "next/link";

import { CarIcon, CheckCircleIcon, resolveUiIcon } from "@/components/public/ui-icons";
import { GenericSectionWithItems } from "@/lib/queries";

type ServicesSectionProps = {
  data: GenericSectionWithItems;
};

const fallbackServiceImages = [
  "/images/services/service-ha-noi.webp",
  "/images/services/service-noi-bai.jpg",
  "/images/services/service-tour.jpg"
];

const keywordLinks = [
  { href: "/taxi-ha-noi-ninh-binh", label: "taxi hà nội ninh bình" },
  { href: "/taxi-noi-bai-ninh-binh", label: "taxi nội bài ninh bình" },
  { href: "/taxi-ninh-binh-ha-noi", label: "taxi ninh bình hà nội" },
  { href: "/taxi-ninh-binh-noi-bai", label: "taxi ninh bình nội bài" },
  { href: "/bang-gia", label: "bảng giá taxi ninh bình" }
];

export function ServicesSection({ data }: ServicesSectionProps) {
  return (
    <section id="dich-vu" className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900 sm:text-xl">
        <CarIcon className="h-5 w-5 text-teal-700" />
        {data.title}
      </h2>
      <p className="mt-2 text-sm text-slate-600">{data.description}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {keywordLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100"
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {data.items.map((item, index) => {
          const imageUrl = item.imageUrl || fallbackServiceImages[index % fallbackServiceImages.length];
          const ItemIcon = resolveUiIcon(item.iconKey, CheckCircleIcon);

          return (
            <article key={item.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <Image
                src={imageUrl}
                alt={`Hình xe dịch vụ: ${item.title}`}
                width={640}
                height={360}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 30vw"
                className="h-32 w-full rounded-lg border border-slate-200 object-cover sm:h-36"
              />
              <h3 className="mt-3 text-sm font-semibold text-slate-900 sm:text-base">{item.title}</h3>
              <p className="mt-2 flex items-start gap-2 text-sm text-slate-600">
                <ItemIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{item.description}</span>
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
