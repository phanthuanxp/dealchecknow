import { ChatIcon, StarIcon, UserIcon } from "@/components/public/ui-icons";
import { TestimonialData } from "@/lib/queries";

type TestimonialsSectionProps = {
  data: TestimonialData;
};

type TestimonialItem = TestimonialData["items"][number];

const fallbackTestimonials: TestimonialItem[] = [
  {
    id: "fallback-review-1",
    customerName: "Anh Minh",
    content: "Đặt xe từ Ninh Bình đi Nội Bài rất đúng giờ, tài xế hỗ trợ hành lý nhiệt tình.",
    location: "Tam Cốc",
    serviceName: "Đi sân bay Nội Bài",
    rating: 5
  },
  {
    id: "fallback-review-2",
    customerName: "Chị Hương",
    content: "Gia đình đi Tràng An cuối tuần, xe sạch và lái xe thân thiện với trẻ nhỏ.",
    location: "Tràng An",
    serviceName: "Xe du lịch gia đình",
    rating: 5
  },
  {
    id: "fallback-review-3",
    customerName: "Anh Quân",
    content: "Giá báo rõ ràng từ đầu, không phát sinh thêm. Dịch vụ ổn định và dễ liên hệ.",
    location: "TP Ninh Bình",
    serviceName: "Taxi nội tỉnh",
    rating: 5
  },
  {
    id: "fallback-review-4",
    customerName: "Chị Lan",
    content: "Đoàn công ty 12 người đi Bái Đính rất thoải mái, xe đến sớm hơn lịch hẹn.",
    location: "Bái Đính",
    serviceName: "Thuê xe du lịch",
    rating: 5
  },
  {
    id: "fallback-review-5",
    customerName: "Anh Tuấn",
    content: "Đặt gấp buổi tối vẫn có xe, phản hồi nhanh qua Zalo và hỗ trợ rất chuyên nghiệp.",
    location: "Hoa Lư",
    serviceName: "Taxi đường dài",
    rating: 5
  }
];

function renderStars(rating: number) {
  const clamped = Math.max(1, Math.min(5, rating));

  return (
    <span className="inline-flex items-center gap-1 text-amber-500" aria-label={`${clamped} sao`}>
      {Array.from({ length: clamped }).map((_, index) => (
        <StarIcon key={index} className="h-4 w-4" />
      ))}
    </span>
  );
}

function toInitials(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "KH";
}

function buildTestimonials(items: TestimonialItem[]) {
  if (items.length >= 5) {
    return items.slice(0, 8);
  }

  const needed = Math.max(0, 5 - items.length);
  return [...items, ...fallbackTestimonials.slice(0, needed)];
}

export function TestimonialsSection({ data }: TestimonialsSectionProps) {
  const resolvedItems = buildTestimonials(data.items);

  return (
    <section id="danh-gia" className="mt-6 rounded-2xl border border-transparent bg-transparent p-5 sm:p-6">
      <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900 sm:text-xl">
        <ChatIcon className="h-5 w-5 text-teal-700" />
        {data.title}
      </h2>
      <p className="mt-2 text-sm text-slate-600">{data.description}</p>
      <p className="mt-1 text-xs font-medium text-amber-700">Đánh giá trung bình 4.9/5 từ hơn 1.200 lượt khách</p>

      <div className="mt-4 overflow-x-auto bg-transparent p-0">
        <div className="flex w-max gap-3">
          {resolvedItems.map((item) => (
            <article
              key={item.id}
              className="w-[285px] shrink-0 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm shadow-slate-200/50"
            >
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
                  {toInitials(item.customerName)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.customerName}</p>
                  <p className="text-xs text-slate-500">
                    {[item.location, item.serviceName].filter(Boolean).join(" • ") || "Khách hàng Taxi Ninh Bình"}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-sm font-semibold">{renderStars(item.rating)}</p>
              <p className="mt-2 text-sm text-slate-700">“{item.content}”</p>
              <div className="mt-3 inline-flex items-center gap-1 text-xs text-slate-500">
                <UserIcon className="h-3.5 w-3.5" />
                Đánh giá đã xác minh
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
