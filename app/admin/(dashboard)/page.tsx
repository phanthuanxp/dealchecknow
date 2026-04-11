import Link from "next/link";
import { PublishStatus } from "@prisma/client";

import prisma from "@/lib/prisma";

type DashboardStats = {
  leadCount: number;
  blogCount: number;
  faqCount: number;
  pricingCount: number;
  testimonialCount: number;
  serviceCount: number;
};

async function getDashboardStats(): Promise<DashboardStats> {
  if (!process.env.DATABASE_URL) {
    return {
      leadCount: 0,
      blogCount: 0,
      faqCount: 0,
      pricingCount: 0,
      testimonialCount: 0,
      serviceCount: 0
    };
  }

  try {
    const serviceTableCheck = await prisma.$queryRaw<Array<{ table_exists: boolean }>>`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'ServicePage'
      ) AS table_exists
    `;
    const hasServiceTable = Boolean(serviceTableCheck[0]?.table_exists);

    const [leadCount, blogCount, faqCount, pricingCount, testimonialCount, serviceCount] = await Promise.all([
      prisma.quoteRequest.count(),
      prisma.blogPost.count({
        where: { status: PublishStatus.PUBLISHED }
      }),
      prisma.faq.count({
        where: { isActive: true }
      }),
      prisma.pricingItem.count({
        where: { isActive: true }
      }),
      prisma.testimonial.count({
        where: { isActive: true }
      }),
      hasServiceTable
        ? prisma.servicePage.count({
            where: { isPublished: true }
          })
        : Promise.resolve(0)
    ]);

    return {
      leadCount,
      blogCount,
      faqCount,
      pricingCount,
      testimonialCount,
      serviceCount
    };
  } catch {
    return {
      leadCount: 0,
      blogCount: 0,
      faqCount: 0,
      pricingCount: 0,
      testimonialCount: 0,
      serviceCount: 0
    };
  }
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    { label: "Yêu cầu báo giá", value: stats.leadCount, href: "/admincp/leads" },
    { label: "Bài viết công khai", value: stats.blogCount, href: "/admincp/blog" },
    { label: "Hỏi đáp", value: stats.faqCount, href: "/admincp/faq" },
    { label: "Bảng giá", value: stats.pricingCount, href: "/admincp/pricing" },
    { label: "Đánh giá", value: stats.testimonialCount, href: "/admincp/testimonials" },
    { label: "Dịch vụ SEO", value: stats.serviceCount, href: "/admincp/services" }
  ];

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Tổng quan hệ thống</h1>
        <p className="mt-2 text-sm text-slate-600">
          Theo dõi nhanh dữ liệu chính của website Taxi Ninh Bình để điều hành nội dung và xử lý khách liên hệ hiệu quả.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-teal-300 hover:bg-teal-50"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
            <p className="mt-2 text-xs text-teal-700">Mở mục quản lý</p>
          </Link>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Truy cập nhanh</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/admincp/blog/new"
            className="inline-flex items-center rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            Tạo bài viết mới
          </Link>
          <Link
            href="/admincp/blocks"
            className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Quản lý khối nội dung trang chủ
          </Link>
          <Link
            href="/admincp/leads"
            className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Xem danh sách yêu cầu báo giá
          </Link>
          <Link
            href="/admincp/services"
            className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Quản lý dịch vụ SEO
          </Link>
        </div>
      </section>
    </div>
  );
}
