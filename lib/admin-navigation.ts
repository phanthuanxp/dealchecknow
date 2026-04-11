export type AdminNavItem = {
  label: string;
  href: string;
  description: string;
};

export const adminNavItems: AdminNavItem[] = [
  {
    label: "Tổng quan",
    href: "/admincp",
    description: "Bảng điều khiển"
  },
  {
    label: "Bài viết",
    href: "/admincp/blog",
    description: "Quản lý bài viết"
  },
  {
    label: "Danh mục",
    href: "/admincp/categories",
    description: "Phân loại bài viết"
  },
  {
    label: "Yêu cầu báo giá",
    href: "/admincp/leads",
    description: "Quản lý khách liên hệ"
  },
  {
    label: "Khối nội dung",
    href: "/admincp/blocks",
    description: "Nội dung trang chủ"
  },
  {
    label: "Thư viện ảnh",
    href: "/admincp/media",
    description: "Banner và ảnh dịch vụ"
  },
  {
    label: "Hỏi đáp",
    href: "/admincp/faq",
    description: "Câu hỏi thường gặp"
  },
  {
    label: "Bảng giá",
    href: "/admincp/pricing",
    description: "Tuyến và giá"
  },
  {
    label: "Dịch vụ SEO",
    href: "/admincp/services",
    description: "Trang dịch vụ động"
  },
  {
    label: "Đánh giá",
    href: "/admincp/testimonials",
    description: "Phản hồi khách hàng"
  },
  {
    label: "Cài đặt",
    href: "/admincp/settings",
    description: "Thiết lập hệ thống"
  }
];
