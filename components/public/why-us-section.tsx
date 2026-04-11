import { GenericSectionWithItems } from "@/lib/queries";
import { cn } from "@/lib/utils";
import {
  CheckCircleIcon,
  ShieldCheckIcon,
  resolveUiIcon
} from "@/components/public/ui-icons";

type WhyUsSectionProps = {
  data: GenericSectionWithItems;
  className?: string;
};

const defaultReasonItems = [
  {
    title: "Đón đúng giờ đã hẹn",
    description: "Xác nhận nhanh với tài xế, hỗ trợ đón đúng khung giờ đã chốt.",
    iconKey: "clock"
  },
  {
    title: "Xe sạch, tài xế lịch sự",
    description: "Phù hợp gia đình, nhóm bạn và khách đoàn cần chuyến đi thoải mái.",
    iconKey: "shield"
  },
  {
    title: "Giá minh bạch, không phụ phí",
    description: "Báo giá rõ trước chuyến, tư vấn đúng tuyến để tối ưu chi phí.",
    iconKey: "check"
  }
] as const;

export function WhyUsSection({ data, className }: WhyUsSectionProps) {
  const displayItems = defaultReasonItems.map((defaultItem, index) => {
    const currentItem = data.items[index];
    return {
      title: defaultItem.title,
      description: currentItem?.description?.trim() || defaultItem.description,
      iconKey: currentItem?.iconKey || defaultItem.iconKey
    };
  });

  return (
    <section
      id="ly-do-chon"
      className={cn("mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6", className)}
    >
      <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900 sm:text-xl">
        <ShieldCheckIcon className="h-5 w-5 text-teal-700" />
        {data.title}
      </h2>
      <p className="mt-2 text-sm text-slate-600">{data.description}</p>
      <div className="mt-4 grid gap-3">
        {displayItems.map((item) => {
          const Icon = resolveUiIcon(item.iconKey, CheckCircleIcon);

          return (
            <article key={item.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 sm:text-base">{item.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-600">{item.description}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
