import { AdminSettingsForm } from "@/components/admin/settings-form";
import { getPublicSiteSettings } from "@/lib/site-settings";

export default async function AdminSettingsPage() {
  const settings = await getPublicSiteSettings();
  const databaseReady = Boolean(process.env.DATABASE_URL);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Cài đặt hệ thống</h1>
        <p className="mt-2 text-sm text-slate-600">
          Chỉnh hotline, email, Zalo, domain và tên website. Public site sẽ đọc trực tiếp các giá trị này từ SQL.
        </p>
      </section>

      <AdminSettingsForm
        databaseReady={databaseReady}
        defaultValues={{
          siteName: settings.siteName,
          siteDomain: settings.siteDomain,
          siteTagline: settings.tagline,
          hotlineValue: settings.hotlineValue,
          hotlineDisplay: settings.hotlineDisplay,
          email: settings.email,
          zaloNumber: settings.zaloNumber
        }}
      />
    </div>
  );
}
