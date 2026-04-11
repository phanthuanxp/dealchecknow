import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { createBreadcrumbSchema, createPageMetadata, getSeoContext } from "@/lib/seo";
import { getPublicSiteSettings } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Chính Sách Bảo Mật",
    description:
      "Chính sách bảo mật của Taxi Ninh Bình về việc thu thập, sử dụng và bảo vệ dữ liệu khách hàng khi đặt dịch vụ taxi và xe du lịch.",
    path: "/chinh-sach-bao-mat",
    keywords: [
      "chính sách bảo mật taxi ninh bình",
      "bảo mật thông tin khách hàng",
      "taxininhbinh.com"
    ]
  });
}

export default async function PrivacyPolicyPage() {
  const [seo, settings] = await Promise.all([getSeoContext(), getPublicSiteSettings()]);
  const breadcrumbSchema = createBreadcrumbSchema(seo.siteUrl, [
    { name: "Trang chủ", path: "/" },
    { name: "Chính sách bảo mật", path: "/chinh-sach-bao-mat" }
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Chính sách bảo mật</h1>
        <p className="mt-3 text-sm text-slate-600">
          Taxi Ninh Bình cam kết bảo vệ thông tin cá nhân của khách hàng khi sử dụng website và dịch vụ đặt xe.
        </p>
        <Image
          src="/images/cover-contact.svg"
          alt="Chính sách bảo mật thông tin khách hàng của Taxi Ninh Bình"
          width={1000}
          height={520}
          className="mt-4 h-40 w-full rounded-xl border border-slate-200 object-cover sm:h-48"
        />
      </section>

      <section className="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <article>
          <h2 className="text-base font-semibold text-slate-900">1. Thông tin thu thập</h2>
          <p className="mt-2 text-sm text-slate-600">
            Chúng tôi có thể thu thập các thông tin cần thiết như điểm đi, điểm đến, thời gian đón, số điện thoại/Zalo
            để phục vụ điều phối xe và hỗ trợ khách hàng.
          </p>
        </article>
        <article>
          <h2 className="text-base font-semibold text-slate-900">2. Mục đích sử dụng dữ liệu</h2>
          <p className="mt-2 text-sm text-slate-600">
            Dữ liệu được dùng để xác nhận chuyến, liên hệ tư vấn báo giá, nâng cao chất lượng dịch vụ và xử lý vấn đề
            phát sinh trong quá trình vận chuyển.
          </p>
        </article>
        <article>
          <h2 className="text-base font-semibold text-slate-900">3. Chia sẻ thông tin</h2>
          <p className="mt-2 text-sm text-slate-600">
            Chúng tôi không bán hoặc trao đổi dữ liệu khách hàng cho bên thứ ba ngoài phạm vi cần thiết để cung cấp
            dịch vụ theo yêu cầu hợp pháp.
          </p>
        </article>
        <article>
          <h2 className="text-base font-semibold text-slate-900">4. Quyền của khách hàng</h2>
          <p className="mt-2 text-sm text-slate-600">
            Bạn có thể yêu cầu kiểm tra, chỉnh sửa hoặc xóa thông tin cá nhân bằng cách liên hệ trực tiếp qua hotline
            hoặc email hỗ trợ.
          </p>
        </article>
        <article>
          <h2 className="text-base font-semibold text-slate-900">5. Liên hệ</h2>
          <p className="mt-2 text-sm text-slate-600">
            Hotline:{" "}
            <Link href={settings.hotlineTel} className="text-teal-700 hover:underline">
              {settings.hotlineDisplay}
            </Link>{" "}
            - Email:{" "}
            <Link href={`mailto:${settings.email}`} className="text-teal-700 hover:underline">
              {settings.email}
            </Link>
          </p>
        </article>
      </section>
    </div>
  );
}
