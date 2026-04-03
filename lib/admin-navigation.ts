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
    label: "Blog",
    href: "/admincp/blog",
    description: "Bài viết"
  },
  {
    label: "Danh mục",
    href: "/admincp/categories",
    description: "Phân loại bài viết"
  },
  {
    label: "Leads",
    href: "/admincp/leads",
    description: "Yêu cầu báo giá"
  },
  {
    label: "Blocks",
    href: "/admincp/blocks",
    description: "Nội dung trang"
  },
  {
    label: "FAQ",
    href: "/admincp/faq",
    description: "Câu hỏi thường gặp"
  },
  {
    label: "Bảng giá",
    href: "/admincp/pricing",
    description: "Tuyến và giá"
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
