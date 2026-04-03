import type { Metadata } from "next";
import Link from "next/link";

import { createBreadcrumbSchema, createPageMetadata, getSeoContext } from "@/lib/seo";
import { getPublicSiteSettings } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Điều Khoản Sử Dụng",
    description:
      "Điều khoản sử dụng dịch vụ Taxi Ninh Bình: quyền và nghĩa vụ giữa khách hàng và đơn vị vận chuyển khi đặt taxi hoặc thuê xe du lịch.",
    path: "/dieu-khoan-su-dung",
    keywords: ["điều khoản sử dụng taxi ninh bình", "điều kiện đặt xe", "taxininhbinh.com"]
  });
}

export default async function TermsOfUsePage() {
  const [seo, settings] = await Promise.all([getSeoContext(), getPublicSiteSettings()]);
  const breadcrumbSchema = createBreadcrumbSchema(seo.siteUrl, [
    { name: "Trang chủ", path: "/" },
    { name: "Điều khoản sử dụng", path: "/dieu-khoan-su-dung" }
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Điều khoản sử dụng</h1>
        <p className="mt-3 text-sm text-slate-600">
          Khi sử dụng website và đặt dịch vụ tại Taxi Ninh Bình, bạn đồng ý với các điều khoản dưới đây.
        </p>
      </section>

      <section className="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <article>
          <h2 className="text-base font-semibold text-slate-900">1. Xác nhận thông tin chuyến đi</h2>
          <p className="mt-2 text-sm text-slate-600">
            Khách hàng cần cung cấp thông tin chính xác về điểm đón, điểm đến, thời gian và số điện thoại liên hệ để
            đảm bảo điều phối xe đúng yêu cầu.
          </p>
        </article>
        <article>
          <h2 className="text-base font-semibold text-slate-900">2. Giá và thanh toán</h2>
          <p className="mt-2 text-sm text-slate-600">
            Giá chuyến đi được tư vấn trước khi xác nhận đặt xe. Các khoản phát sinh (nếu có) sẽ được thông báo rõ dựa
            trên thay đổi thực tế của hành trình.
          </p>
        </article>
        <article>
          <h2 className="text-base font-semibold text-slate-900">3. Hủy/chuyển lịch</h2>
          <p className="mt-2 text-sm text-slate-600">
            Khách hàng vui lòng thông báo sớm khi cần thay đổi lịch để chúng tôi hỗ trợ tốt nhất. Một số chuyến đặc
            thù có thể phát sinh chi phí theo mức độ thay đổi.
          </p>
        </article>
        <article>
          <h2 className="text-base font-semibold text-slate-900">4. Trách nhiệm của hai bên</h2>
          <p className="mt-2 text-sm text-slate-600">
            Chúng tôi cam kết phục vụ đúng theo thông tin đã xác nhận. Khách hàng cam kết tuân thủ quy định an toàn
            khi di chuyển và phối hợp với tài xế trong quá trình đón trả.
          </p>
        </article>
        <article>
          <h2 className="text-base font-semibold text-slate-900">5. Liên hệ hỗ trợ</h2>
          <p className="mt-2 text-sm text-slate-600">
            Mọi thắc mắc vui lòng liên hệ hotline{" "}
            <Link href={settings.hotlineTel} className="text-teal-700 hover:underline">
              {settings.hotlineDisplay}
            </Link>{" "}
            hoặc email{" "}
            <Link href={`mailto:${settings.email}`} className="text-teal-700 hover:underline">
              {settings.email}
            </Link>
            .
          </p>
        </article>
      </section>
    </div>
  );
}
