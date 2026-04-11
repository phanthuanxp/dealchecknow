import { SectionType } from "@prisma/client";

export type HomeBlockFieldType = "text" | "textarea" | "url" | "lines" | "json" | "select";

export type HomeBlockFieldTemplate = {
  key: string;
  label: string;
  type: HomeBlockFieldType;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  options?: Array<{
    label: string;
    value: string;
  }>;
};

export type HomeBlockTemplate = {
  blockKey: string;
  label: string;
  blockType: string;
  sortOrder: number;
  description?: string;
  defaultContent: Record<string, unknown>;
  fields: HomeBlockFieldTemplate[];
};

export type HomeSectionTemplate = {
  key: string;
  name: string;
  type: SectionType;
  sortOrder: number;
  title: string;
  description: string;
  blocks: HomeBlockTemplate[];
};

export type HomeBlockEditorField = {
  key: string;
  label: string;
  type: HomeBlockFieldType;
  required: boolean;
  placeholder?: string;
  helperText?: string;
  options?: Array<{
    label: string;
    value: string;
  }>;
  value: string;
};

export type HomeBlockEditorItem = {
  blockKey: string;
  label: string;
  blockType: string;
  sortOrder: number;
  title: string;
  isActive: boolean;
  description?: string;
  mode: "template" | "raw";
  fields: HomeBlockEditorField[];
  rawJson: string;
};

export type HomeSectionEditorItem = {
  key: string;
  name: string;
  type: SectionType;
  sortOrder: number;
  title: string;
  description: string;
  isActive: boolean;
  blocks: HomeBlockEditorItem[];
};

export const LANDING_ICON_OPTIONS = [
  { value: "car", label: "Xe (car)" },
  { value: "clock", label: "Đồng hồ (clock)" },
  { value: "shield", label: "Khiên (shield)" },
  { value: "check", label: "Dấu tick (check)" },
  { value: "route", label: "Lộ trình (route)" },
  { value: "star", label: "Sao (star)" },
  { value: "phone", label: "Điện thoại (phone)" },
  { value: "chat", label: "Chat (chat)" }
] as const;

const commonServiceFields: HomeBlockFieldTemplate[] = [
  { key: "title", label: "Tiêu đề", type: "text", required: true },
  { key: "description", label: "Mô tả", type: "textarea", required: true },
  {
    key: "imageUrl",
    label: "URL ảnh minh họa",
    type: "url",
    placeholder: "https://...",
    helperText: "Dán URL ảnh từ thư viện ảnh hoặc nguồn CDN."
  },
  {
    key: "iconKey",
    label: "Icon hiển thị",
    type: "select",
    options: [...LANDING_ICON_OPTIONS]
  }
];

const commonWhyUsFields: HomeBlockFieldTemplate[] = [
  { key: "title", label: "Tiêu đề", type: "text", required: true },
  { key: "description", label: "Mô tả", type: "textarea", required: true },
  {
    key: "iconKey",
    label: "Icon hiển thị",
    type: "select",
    options: [...LANDING_ICON_OPTIONS]
  }
];

export const HOME_CONTENT_SECTION_TEMPLATES: HomeSectionTemplate[] = [
  {
    key: "home-hero",
    name: "Mở đầu trang chủ",
    type: SectionType.HERO,
    sortOrder: 1,
    title: "Taxi Ninh Bình - Xe sạch, đón nhanh, giá rõ ràng",
    description: "Đặt taxi và xe du lịch Ninh Bình 24/7, hỗ trợ nhanh qua điện thoại và Zalo.",
    blocks: [
      {
        blockKey: "hero-badge",
        label: "Nhãn nhỏ mở đầu",
        blockType: "text",
        sortOrder: 0,
        defaultContent: { text: "Taxi Ninh Bình" },
        fields: [{ key: "text", label: "Nội dung nhãn", type: "text", required: true }]
      },
      {
        blockKey: "hero-title",
        label: "Tiêu đề chính",
        blockType: "text",
        sortOrder: 1,
        defaultContent: { text: "Taxi và xe du lịch Ninh Bình cho gia đình, nhóm bạn và khách đoàn" },
        fields: [{ key: "text", label: "Tiêu đề", type: "textarea", required: true }]
      },
      {
        blockKey: "hero-description",
        label: "Mô tả mở đầu",
        blockType: "text",
        sortOrder: 2,
        defaultContent: {
          text: "Đón nhanh, xe sạch, tài xế lịch sự và báo giá minh bạch theo từng tuyến."
        },
        fields: [{ key: "text", label: "Mô tả", type: "textarea", required: true }]
      },
      {
        blockKey: "hero-primary-cta",
        label: "Nút chính",
        blockType: "cta",
        sortOrder: 3,
        defaultContent: {
          label: "Gọi ngay 0345 07 6789",
          href: "tel:0345076789",
          helperText: "Hotline: 0345 07 6789"
        },
        fields: [
          { key: "label", label: "Nhãn nút", type: "text", required: true },
          { key: "href", label: "Liên kết", type: "url", required: true },
          { key: "helperText", label: "Ghi chú", type: "text" }
        ]
      },
      {
        blockKey: "hero-secondary-cta",
        label: "Nút phụ",
        blockType: "cta",
        sortOrder: 4,
        defaultContent: {
          label: "Chat Zalo",
          href: "https://zalo.me/0345076789"
        },
        fields: [
          { key: "label", label: "Nhãn nút", type: "text", required: true },
          { key: "href", label: "Liên kết", type: "url", required: true }
        ]
      },
      {
        blockKey: "hero-highlight-1",
        label: "Điểm nhấn 1",
        blockType: "text",
        sortOrder: 5,
        defaultContent: { text: "Có mặt nhanh trong khu vực Ninh Bình" },
        fields: [{ key: "text", label: "Nội dung", type: "text", required: true }]
      },
      {
        blockKey: "hero-highlight-2",
        label: "Điểm nhấn 2",
        blockType: "text",
        sortOrder: 6,
        defaultContent: { text: "Giá minh bạch, không phụ phí mập mờ" },
        fields: [{ key: "text", label: "Nội dung", type: "text", required: true }]
      },
      {
        blockKey: "hero-highlight-3",
        label: "Điểm nhấn 3",
        blockType: "text",
        sortOrder: 7,
        defaultContent: { text: "Hỗ trợ khách du lịch và khách đoàn 24/7" },
        fields: [{ key: "text", label: "Nội dung", type: "text", required: true }]
      },
      {
        blockKey: "hero-banner-images",
        label: "Ảnh banner chạy",
        blockType: "gallery",
        sortOrder: 8,
        defaultContent: {
          images: ["/images/taxi-banner-1.svg", "/images/taxi-banner-2.svg", "/images/taxi-banner-3.svg"],
          alt: "Banner Taxi Ninh Bình"
        },
        fields: [
          {
            key: "images",
            label: "Danh sách ảnh banner (mỗi dòng 1 URL)",
            type: "lines",
            required: true
          },
          { key: "alt", label: "Mô tả ảnh (alt)", type: "text" }
        ]
      }
    ]
  },
  {
    key: "home-quote",
    name: "Biểu mẫu báo giá",
    type: SectionType.CTA,
    sortOrder: 2,
    title: "Nhận báo giá nhanh theo lộ trình",
    description: "Điền thông tin chuyến đi để nhận báo giá phù hợp.",
    blocks: [
      {
        blockKey: "quote-note",
        label: "Ghi chú dưới form",
        blockType: "text",
        sortOrder: 1,
        defaultContent: {
          text: "Đội ngũ điều phối sẽ liên hệ xác nhận và báo giá trong thời gian sớm nhất."
        },
        fields: [{ key: "text", label: "Nội dung", type: "textarea", required: true }]
      }
    ]
  },
  {
    key: "home-services",
    name: "Dịch vụ chính",
    type: SectionType.SERVICES,
    sortOrder: 3,
    title: "Dịch vụ chính",
    description: "Đa dạng dịch vụ đi lại cho khách địa phương và khách du lịch.",
    blocks: [
      {
        blockKey: "service-item-1",
        label: "Dịch vụ 1",
        blockType: "feature",
        sortOrder: 1,
        defaultContent: {
          title: "Taxi nội tỉnh Ninh Bình",
          description: "Đón nhanh tại trung tâm thành phố, ga Ninh Bình, khách sạn và điểm du lịch.",
          imageUrl: "/images/services/service-ha-noi.webp",
          iconKey: "car"
        },
        fields: [...commonServiceFields]
      },
      {
        blockKey: "service-item-2",
        label: "Dịch vụ 2",
        blockType: "feature",
        sortOrder: 2,
        defaultContent: {
          title: "Đưa đón sân bay Nội Bài",
          description: "Lịch trình rõ ràng, đón đúng giờ theo lịch bay, hỗ trợ hành lý đầy đủ.",
          imageUrl: "/images/services/service-noi-bai.jpg",
          iconKey: "route"
        },
        fields: [...commonServiceFields]
      },
      {
        blockKey: "service-item-3",
        label: "Dịch vụ 3",
        blockType: "feature",
        sortOrder: 3,
        defaultContent: {
          title: "Xe du lịch theo chuyến",
          description: "Phù hợp lịch trình Tam Cốc, Tràng An, Bái Đính, Hoa Lư.",
          imageUrl: "/images/services/service-tour.jpg",
          iconKey: "star"
        },
        fields: [...commonServiceFields]
      }
    ]
  },
  {
    key: "home-pricing",
    name: "Bảng giá tham khảo",
    type: SectionType.PRICING,
    sortOrder: 4,
    title: "Tuyến phổ biến / Bảng giá tham khảo",
    description: "Tham khảo nhanh các mức giá thường dùng trước khi đặt xe.",
    blocks: [
      {
        blockKey: "pricing-note",
        label: "Ghi chú bảng giá",
        blockType: "text",
        sortOrder: 1,
        defaultContent: {
          text: "Cam kết 100% xe riêng đời mới - Phục vụ 24/24 !"
        },
        fields: [{ key: "text", label: "Nội dung", type: "textarea", required: true }]
      }
    ]
  },
  {
    key: "home-why-us",
    name: "Lý do chọn chúng tôi",
    type: SectionType.SERVICES,
    sortOrder: 5,
    title: "Lý do chọn chúng tôi",
    description: "Cam kết trải nghiệm đi xe an toàn, đúng giờ và minh bạch.",
    blocks: [
      {
        blockKey: "why-item-1",
        label: "Lý do 1",
        blockType: "feature",
        sortOrder: 1,
        defaultContent: {
          title: "Đón đúng giờ đã hẹn",
          description: "Theo dõi lịch và chủ động liên hệ để đảm bảo chuyến đi đúng kế hoạch.",
          iconKey: "clock"
        },
        fields: [...commonWhyUsFields]
      },
      {
        blockKey: "why-item-2",
        label: "Lý do 2",
        blockType: "feature",
        sortOrder: 2,
        defaultContent: {
          title: "Xe sạch, tài xế lịch sự",
          description: "Xe được vệ sinh thường xuyên, tài xế thân thiện và hỗ trợ khách tận tình.",
          iconKey: "shield"
        },
        fields: [...commonWhyUsFields]
      },
      {
        blockKey: "why-item-3",
        label: "Lý do 3",
        blockType: "feature",
        sortOrder: 3,
        defaultContent: {
          title: "Giá minh bạch trước chuyến",
          description: "Thông tin chi phí được thống nhất rõ ràng trước khi khởi hành.",
          iconKey: "check"
        },
        fields: [...commonWhyUsFields]
      }
    ]
  },
  {
    key: "home-testimonials",
    name: "Đánh giá khách hàng",
    type: SectionType.TESTIMONIAL,
    sortOrder: 6,
    title: "Khách hàng nói gì về Taxi Ninh Bình",
    description: "Phản hồi thực tế từ khách đã sử dụng dịch vụ.",
    blocks: []
  },
  {
    key: "home-faq",
    name: "Hỏi đáp",
    type: SectionType.FAQ,
    sortOrder: 7,
    title: "Câu hỏi thường gặp",
    description: "Giải đáp nhanh các thắc mắc trước khi đặt xe.",
    blocks: [
      {
        blockKey: "faq-intro",
        label: "Mở đầu hỏi đáp",
        blockType: "text",
        sortOrder: 1,
        defaultContent: {
          text: "Giải đáp các câu hỏi về đặt xe, thanh toán và thay đổi lịch trình."
        },
        fields: [{ key: "text", label: "Nội dung", type: "textarea", required: true }]
      }
    ]
  },
  {
    key: "home-final-cta",
    name: "Kêu gọi hành động cuối trang",
    type: SectionType.CTA,
    sortOrder: 8,
    title: "Sẵn sàng đặt xe ngay hôm nay?",
    description: "Gọi hotline hoặc nhắn Zalo để được xác nhận chuyến nhanh.",
    blocks: [
      {
        blockKey: "final-cta-primary",
        label: "Nút chính",
        blockType: "cta",
        sortOrder: 1,
        defaultContent: {
          label: "Gọi hotline 0345 07 6789",
          href: "tel:0345076789"
        },
        fields: [
          { key: "label", label: "Nhãn nút", type: "text", required: true },
          { key: "href", label: "Liên kết", type: "url", required: true }
        ]
      },
      {
        blockKey: "final-cta-secondary",
        label: "Nút phụ",
        blockType: "cta",
        sortOrder: 2,
        defaultContent: {
          label: "Nhắn Zalo ngay",
          href: "https://zalo.me/0345076789"
        },
        fields: [
          { key: "label", label: "Nhãn nút", type: "text", required: true },
          { key: "href", label: "Liên kết", type: "url", required: true }
        ]
      }
    ]
  },
  {
    key: "home-footer",
    name: "Chân trang",
    type: SectionType.FOOTER,
    sortOrder: 9,
    title: "Taxi Ninh Bình",
    description: "Dịch vụ taxi và xe du lịch chuyên nghiệp, hỗ trợ đặt xe nhanh 24/7.",
    blocks: [
      {
        blockKey: "footer-company-name",
        label: "Tên thương hiệu",
        blockType: "text",
        sortOrder: 1,
        defaultContent: { text: "Taxi Ninh Bình" },
        fields: [{ key: "text", label: "Nội dung", type: "text", required: true }]
      },
      {
        blockKey: "footer-description",
        label: "Mô tả chân trang",
        blockType: "text",
        sortOrder: 2,
        defaultContent: {
          text: "Dịch vụ taxi và xe du lịch chuyên nghiệp, hỗ trợ đặt xe nhanh 24/7."
        },
        fields: [{ key: "text", label: "Nội dung", type: "textarea", required: true }]
      },
      {
        blockKey: "footer-service-areas",
        label: "Khu vực phục vụ",
        blockType: "list",
        sortOrder: 3,
        defaultContent: {
          items: ["TP Ninh Bình", "Tam Cốc", "Tràng An", "Bái Đính", "Hoa Lư", "Kim Sơn"]
        },
        fields: [
          {
            key: "items",
            label: "Mỗi dòng 1 khu vực",
            type: "lines",
            required: true
          }
        ]
      },
      {
        blockKey: "footer-bottom-note",
        label: "Dòng cuối chân trang",
        blockType: "text",
        sortOrder: 4,
        defaultContent: { text: "© {year} Taxi Ninh Bình. Bảo lưu mọi quyền." },
        fields: [{ key: "text", label: "Nội dung", type: "text", required: true }]
      }
    ]
  }
];

export const HOME_CONTENT_SECTION_KEY_SET = new Set(HOME_CONTENT_SECTION_TEMPLATES.map((section) => section.key));

export function getHomeSectionTemplate(sectionKey: string): HomeSectionTemplate | undefined {
  return HOME_CONTENT_SECTION_TEMPLATES.find((section) => section.key === sectionKey);
}

export function getHomeBlockTemplate(sectionKey: string, blockKey: string): HomeBlockTemplate | undefined {
  const section = getHomeSectionTemplate(sectionKey);
  if (!section) {
    return undefined;
  }

  return section.blocks.find((block) => block.blockKey === blockKey);
}
