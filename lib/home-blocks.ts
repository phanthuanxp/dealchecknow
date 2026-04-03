import { SectionType } from "@prisma/client";

export type HomeBlockFieldType = "text" | "textarea" | "url" | "lines" | "json";

export type HomeBlockFieldTemplate = {
  key: string;
  label: string;
  type: HomeBlockFieldType;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
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

export const HOME_CONTENT_SECTION_TEMPLATES: HomeSectionTemplate[] = [
  {
    key: "home-hero",
    name: "Homepage Hero",
    type: SectionType.HERO,
    sortOrder: 1,
    title: "Taxi Ninh Bình - Xe sạch, đón nhanh, giá rõ ràng",
    description: "Đặt taxi và xe du lịch Ninh Bình 24/7, hỗ trợ nhanh qua điện thoại và Zalo.",
    blocks: [
      {
        blockKey: "hero-badge",
        label: "Hero Badge",
        blockType: "text",
        sortOrder: 0,
        defaultContent: { text: "Taxi Ninh Bình" },
        fields: [{ key: "text", label: "Nội dung badge", type: "text", required: true }]
      },
      {
        blockKey: "hero-title",
        label: "Hero Title",
        blockType: "text",
        sortOrder: 1,
        defaultContent: { text: "Taxi và xe du lịch Ninh Bình cho khách địa phương và khách du lịch" },
        fields: [{ key: "text", label: "Tiêu đề chính", type: "textarea", required: true }]
      },
      {
        blockKey: "hero-description",
        label: "Hero Description",
        blockType: "text",
        sortOrder: 2,
        defaultContent: {
          text: "Đón nhanh, xe sạch, tài xế lịch sự và báo giá minh bạch theo từng tuyến."
        },
        fields: [{ key: "text", label: "Mô tả", type: "textarea", required: true }]
      },
      {
        blockKey: "hero-primary-cta",
        label: "Hero Primary CTA",
        blockType: "cta",
        sortOrder: 3,
        defaultContent: {
          label: "Gọi ngay 0345 07 6789",
          href: "tel:0345076789",
          helperText: "Hotline: 0345 07 6789"
        },
        fields: [
          { key: "label", label: "Nhãn nút", type: "text", required: true },
          { key: "href", label: "Liên kết CTA", type: "url", required: true },
          { key: "helperText", label: "Ghi chú ngắn", type: "text" }
        ]
      },
      {
        blockKey: "hero-secondary-cta",
        label: "Hero Secondary CTA",
        blockType: "cta",
        sortOrder: 4,
        defaultContent: {
          label: "Chat Zalo",
          href: "https://zalo.me/0345076789"
        },
        fields: [
          { key: "label", label: "Nhãn nút", type: "text", required: true },
          { key: "href", label: "Liên kết CTA", type: "url", required: true }
        ]
      },
      {
        blockKey: "hero-highlight-1",
        label: "Hero Highlight 1",
        blockType: "text",
        sortOrder: 5,
        defaultContent: { text: "Có mặt nhanh trong khu vực Ninh Bình" },
        fields: [{ key: "text", label: "Nội dung điểm nhấn", type: "text", required: true }]
      },
      {
        blockKey: "hero-highlight-2",
        label: "Hero Highlight 2",
        blockType: "text",
        sortOrder: 6,
        defaultContent: { text: "Giá minh bạch, không phụ phí mập mờ" },
        fields: [{ key: "text", label: "Nội dung điểm nhấn", type: "text", required: true }]
      },
      {
        blockKey: "hero-highlight-3",
        label: "Hero Highlight 3",
        blockType: "text",
        sortOrder: 7,
        defaultContent: { text: "Hỗ trợ khách du lịch và khách đoàn 24/7" },
        fields: [{ key: "text", label: "Nội dung điểm nhấn", type: "text", required: true }]
      }
    ]
  },
  {
    key: "home-quote",
    name: "Homepage Quote Form",
    type: SectionType.CTA,
    sortOrder: 2,
    title: "Nhận báo giá nhanh theo lộ trình",
    description: "Điền thông tin chuyến đi để nhận báo giá phù hợp.",
    blocks: [
      {
        blockKey: "quote-note",
        label: "Quote Note",
        blockType: "text",
        sortOrder: 1,
        defaultContent: {
          text: "Đội ngũ điều phối sẽ liên hệ xác nhận và báo giá trong thời gian sớm nhất."
        },
        fields: [{ key: "text", label: "Ghi chú dưới form", type: "textarea", required: true }]
      }
    ]
  },
  {
    key: "home-services",
    name: "Homepage Services",
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
          description: "Đón nhanh tại trung tâm thành phố, ga Ninh Bình, khách sạn và điểm du lịch."
        },
        fields: [
          { key: "title", label: "Tiêu đề dịch vụ", type: "text", required: true },
          { key: "description", label: "Mô tả dịch vụ", type: "textarea", required: true }
        ]
      },
      {
        blockKey: "service-item-2",
        label: "Dịch vụ 2",
        blockType: "feature",
        sortOrder: 2,
        defaultContent: {
          title: "Đưa đón sân bay Nội Bài",
          description: "Lịch trình rõ ràng, đón đúng giờ theo lịch bay, hỗ trợ hành lý đầy đủ."
        },
        fields: [
          { key: "title", label: "Tiêu đề dịch vụ", type: "text", required: true },
          { key: "description", label: "Mô tả dịch vụ", type: "textarea", required: true }
        ]
      },
      {
        blockKey: "service-item-3",
        label: "Dịch vụ 3",
        blockType: "feature",
        sortOrder: 3,
        defaultContent: {
          title: "Xe du lịch theo chuyến",
          description: "Phù hợp lịch trình Tam Cốc, Tràng An, Bái Đính, Hoa Lư."
        },
        fields: [
          { key: "title", label: "Tiêu đề dịch vụ", type: "text", required: true },
          { key: "description", label: "Mô tả dịch vụ", type: "textarea", required: true }
        ]
      }
    ]
  },
  {
    key: "home-pricing",
    name: "Homepage Pricing",
    type: SectionType.PRICING,
    sortOrder: 4,
    title: "Tuyến phổ biến / Bảng giá tham khảo",
    description: "Tham khảo nhanh các mức giá thường dùng trước khi đặt xe.",
    blocks: [
      {
        blockKey: "pricing-note",
        label: "Pricing Note",
        blockType: "text",
        sortOrder: 1,
        defaultContent: {
          text: "Giá có thể thay đổi theo khung giờ, lễ tết và phụ phí cầu đường."
        },
        fields: [{ key: "text", label: "Ghi chú bảng giá", type: "textarea", required: true }]
      }
    ]
  },
  {
    key: "home-why-us",
    name: "Homepage Why Us",
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
          description: "Theo dõi lịch và chủ động liên hệ để đảm bảo chuyến đi đúng kế hoạch."
        },
        fields: [
          { key: "title", label: "Tiêu đề lý do", type: "text", required: true },
          { key: "description", label: "Mô tả lý do", type: "textarea", required: true }
        ]
      },
      {
        blockKey: "why-item-2",
        label: "Lý do 2",
        blockType: "feature",
        sortOrder: 2,
        defaultContent: {
          title: "Xe sạch, tài xế lịch sự",
          description: "Xe được vệ sinh thường xuyên, tài xế thân thiện và hỗ trợ khách tận tình."
        },
        fields: [
          { key: "title", label: "Tiêu đề lý do", type: "text", required: true },
          { key: "description", label: "Mô tả lý do", type: "textarea", required: true }
        ]
      },
      {
        blockKey: "why-item-3",
        label: "Lý do 3",
        blockType: "feature",
        sortOrder: 3,
        defaultContent: {
          title: "Giá minh bạch trước chuyến",
          description: "Thông tin chi phí được thống nhất rõ ràng trước khi khởi hành."
        },
        fields: [
          { key: "title", label: "Tiêu đề lý do", type: "text", required: true },
          { key: "description", label: "Mô tả lý do", type: "textarea", required: true }
        ]
      }
    ]
  },
  {
    key: "home-testimonials",
    name: "Homepage Testimonials",
    type: SectionType.TESTIMONIAL,
    sortOrder: 6,
    title: "Khách hàng nói gì về Taxi Ninh Bình",
    description: "Phản hồi thực tế từ khách đã sử dụng dịch vụ.",
    blocks: []
  },
  {
    key: "home-faq",
    name: "Homepage FAQ",
    type: SectionType.FAQ,
    sortOrder: 7,
    title: "Câu hỏi thường gặp",
    description: "Giải đáp nhanh các thắc mắc trước khi đặt xe.",
    blocks: [
      {
        blockKey: "faq-intro",
        label: "FAQ Intro",
        blockType: "text",
        sortOrder: 1,
        defaultContent: {
          text: "Giải đáp các câu hỏi về đặt xe, thanh toán và thay đổi lịch trình."
        },
        fields: [{ key: "text", label: "Đoạn mở đầu FAQ", type: "textarea", required: true }]
      }
    ]
  },
  {
    key: "home-final-cta",
    name: "Homepage Final CTA",
    type: SectionType.CTA,
    sortOrder: 8,
    title: "Sẵn sàng đặt xe ngay hôm nay?",
    description: "Gọi hotline hoặc nhắn Zalo để được xác nhận chuyến nhanh.",
    blocks: [
      {
        blockKey: "final-cta-primary",
        label: "Final CTA Primary",
        blockType: "cta",
        sortOrder: 1,
        defaultContent: {
          label: "Gọi hotline 0345 07 6789",
          href: "tel:0345076789"
        },
        fields: [
          { key: "label", label: "Nhãn nút", type: "text", required: true },
          { key: "href", label: "Liên kết CTA", type: "url", required: true }
        ]
      },
      {
        blockKey: "final-cta-secondary",
        label: "Final CTA Secondary",
        blockType: "cta",
        sortOrder: 2,
        defaultContent: {
          label: "Nhắn Zalo ngay",
          href: "https://zalo.me/0345076789"
        },
        fields: [
          { key: "label", label: "Nhãn nút", type: "text", required: true },
          { key: "href", label: "Liên kết CTA", type: "url", required: true }
        ]
      }
    ]
  },
  {
    key: "home-footer",
    name: "Homepage Footer",
    type: SectionType.FOOTER,
    sortOrder: 9,
    title: "Taxi Ninh Bình",
    description: "Dịch vụ taxi và xe du lịch chuyên nghiệp, hỗ trợ đặt xe nhanh 24/7.",
    blocks: [
      {
        blockKey: "footer-company-name",
        label: "Footer Company Name",
        blockType: "text",
        sortOrder: 1,
        defaultContent: { text: "Taxi Ninh Bình" },
        fields: [{ key: "text", label: "Tên thương hiệu", type: "text", required: true }]
      },
      {
        blockKey: "footer-description",
        label: "Footer Description",
        blockType: "text",
        sortOrder: 2,
        defaultContent: {
          text: "Dịch vụ taxi và xe du lịch chuyên nghiệp, hỗ trợ đặt xe nhanh 24/7."
        },
        fields: [{ key: "text", label: "Mô tả footer", type: "textarea", required: true }]
      },
      {
        blockKey: "footer-service-areas",
        label: "Footer Service Areas",
        blockType: "list",
        sortOrder: 3,
        defaultContent: {
          items: ["TP Ninh Bình", "Tam Cốc", "Tràng An", "Bái Đính", "Hoa Lư", "Kim Sơn"]
        },
        fields: [
          {
            key: "items",
            label: "Khu vực phục vụ (mỗi dòng 1 mục)",
            type: "lines",
            required: true
          }
        ]
      },
      {
        blockKey: "footer-bottom-note",
        label: "Footer Bottom Note",
        blockType: "text",
        sortOrder: 4,
        defaultContent: { text: "© {year} Taxi Ninh Bình. All rights reserved." },
        fields: [{ key: "text", label: "Dòng cuối footer", type: "text", required: true }]
      }
    ]
  }
];

export const HOME_CONTENT_SECTION_KEY_SET = new Set(
  HOME_CONTENT_SECTION_TEMPLATES.map((section) => section.key)
);

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
