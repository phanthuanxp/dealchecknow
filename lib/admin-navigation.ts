export type AdminNavItem = {
  label: string;
  href: string;
  description: string;
};

export const adminNavItems: AdminNavItem[] = [
  {
    label: "Tong quan",
    href: "/admincp",
    description: "Bang dieu khien"
  },
  {
    label: "Bai viet",
    href: "/admincp/blog",
    description: "Quan ly bai viet"
  },
  {
    label: "Danh muc",
    href: "/admincp/categories",
    description: "Phan loai bai viet"
  },
  {
    label: "Yeu cau bao gia",
    href: "/admincp/leads",
    description: "Quan ly khach lien he"
  },
  {
    label: "Khoi noi dung",
    href: "/admincp/blocks",
    description: "Noi dung trang chu va page"
  },
  {
    label: "Thu vien anh",
    href: "/admincp/media",
    description: "Banner va anh dich vu"
  },
  {
    label: "Hoi dap",
    href: "/admincp/faq",
    description: "Cau hoi thuong gap"
  },
  {
    label: "Bang gia",
    href: "/admincp/pricing",
    description: "Tuyen va gia"
  },
  {
    label: "Dich vu SEO",
    href: "/admincp/services",
    description: "Trang dich vu dong"
  },
  {
    label: "Danh gia",
    href: "/admincp/testimonials",
    description: "Phan hoi khach hang"
  },
  {
    label: "Cai dat",
    href: "/admincp/settings",
    description: "Thiet lap he thong"
  }
];
