export type AdminNavItem = {
  label: string;
  href: string;
  description: string;
};

export const adminNavItems: AdminNavItem[] = [
  {
    label: "Tổng quan",
    href: "/admin",
    description: "Bảng điều khiển"
  },
  {
    label: "Blog",
    href: "/admin/blog",
    description: "Bài viết"
  },
  {
    label: "Danh mục",
    href: "/admin/categories",
    description: "Phân loại bài viết"
  },
  {
    label: "Leads",
    href: "/admin/leads",
    description: "Yêu cầu báo giá"
  },
  {
    label: "Blocks",
    href: "/admin/blocks",
    description: "Nội dung trang"
  },
  {
    label: "FAQ",
    href: "/admin/faq",
    description: "Câu hỏi thường gặp"
  },
  {
    label: "Bảng giá",
    href: "/admin/pricing",
    description: "Tuyến và giá"
  },
  {
    label: "Đánh giá",
    href: "/admin/testimonials",
    description: "Phản hồi khách hàng"
  },
  {
    label: "Cài đặt",
    href: "/admin/settings",
    description: "Thiết lập hệ thống"
  }
];
