import { ChatIcon } from "@/components/public/ui-icons";
import { FaqData } from "@/lib/queries";
import { cn } from "@/lib/utils";

type FaqSectionProps = {
  data: FaqData;
  className?: string;
};

const fallbackFaqs: FaqData["items"] = [
  {
    id: "faq-fallback-1",
    slug: "dat-xe-bao-truoc-bao-lau",
    question: "Tôi nên đặt xe trước bao lâu?",
    answer:
      "Bạn nên đặt trước từ 30 phút đến 2 giờ để được điều xe nhanh và đúng loại xe mong muốn. Với chuyến đi sân bay hoặc đi tỉnh, nên đặt sớm hơn."
  },
  {
    id: "faq-fallback-2",
    slug: "co-don-duoc-ban-dem-khong",
    question: "Taxi Ninh Bình có đón ban đêm không?",
    answer:
      "Có. Dịch vụ hoạt động 24/7, bao gồm cả sáng sớm và ban đêm. Bạn chỉ cần gửi điểm đón, thời gian và số điện thoại để xác nhận chuyến."
  },
  {
    id: "faq-fallback-3",
    slug: "gia-cuoc-tinh-nhu-the-nao",
    question: "Giá cước được tính như thế nào?",
    answer:
      "Giá cước phụ thuộc vào quãng đường, loại xe, thời điểm đón và yêu cầu phát sinh. Chúng tôi sẽ báo giá rõ ràng trước khi chốt chuyến."
  },
  {
    id: "faq-fallback-4",
    slug: "co-ho-tro-di-noi-bai-khong",
    question: "Có hỗ trợ tuyến Ninh Bình đi sân bay Nội Bài không?",
    answer:
      "Có. Đây là tuyến thường xuyên của chúng tôi. Bạn có thể đặt xe 4 chỗ, 7 chỗ hoặc xe lớn hơn tùy số người và hành lý."
  },
  {
    id: "faq-fallback-5",
    slug: "co-xuat-hoa-don-vat-khong",
    question: "Dịch vụ có xuất hóa đơn VAT không?",
    answer:
      "Có hỗ trợ xuất hóa đơn VAT theo yêu cầu. Bạn vui lòng chọn mục VAT khi gửi form hoặc báo trước cho điều phối viên."
  }
];

const vietnameseCharacterPattern =
  /[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i;
const englishMarkerPattern =
  /\b(what|how|when|where|why|service|price|airport|booking|customer|support|trip|route|vehicle|contact)\b/i;
const vietnameseHintPattern =
  /\b(ninh bình|ninh binh|đặt xe|dat xe|báo giá|bao gia|zalo|sân bay|san bay|nội bài|noi bai|tam cốc|tam coc|tràng an|trang an)\b/i;

function isLikelyVietnamese(question: string, answer: string) {
  const combined = `${question} ${answer}`;

  if (vietnameseCharacterPattern.test(combined)) {
    return true;
  }

  if (englishMarkerPattern.test(combined)) {
    return false;
  }

  return vietnameseHintPattern.test(combined.toLowerCase());
}

function buildFaqItems(items: FaqData["items"]) {
  const validItems = items.filter((item) => item.question.trim() && item.answer.trim());
  const vietnameseItems = validItems.filter((item) => isLikelyVietnamese(item.question, item.answer));

  const baseItems = vietnameseItems.length > 0 ? vietnameseItems : [];
  const existingQuestions = new Set(baseItems.map((item) => item.question.trim().toLowerCase()));
  const additional = fallbackFaqs.filter(
    (item) => !existingQuestions.has(item.question.trim().toLowerCase())
  );

  return [...baseItems, ...additional].slice(0, 8);
}

export function FaqSection({ data, className }: FaqSectionProps) {
  const faqItems = buildFaqItems(data.items);
  const heading = isLikelyVietnamese(data.title, data.description)
    ? data.title
    : "Các câu hỏi thường gặp";
  const description = isLikelyVietnamese(data.title, data.description)
    ? data.description
    : "Giải đáp nhanh các thắc mắc trước khi đặt xe tại Ninh Bình.";

  return (
    <section
      id="faq"
      className={cn("mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6", className)}
    >
      <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900 sm:text-xl">
        <ChatIcon className="h-5 w-5 text-teal-700" />
        {heading}
      </h2>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      <div className="mt-4 space-y-2">
        {faqItems.map((item) => (
          <details key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <summary className="cursor-pointer text-sm font-semibold text-slate-900">{item.question}</summary>
            <p className="mt-2 text-sm text-slate-600">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
