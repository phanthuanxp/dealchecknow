import { signOut } from "@/lib/auth";

import { AdminMobileNav } from "@/components/admin/mobile-nav";

type AdminTopbarProps = {
  email: string;
  roleLabel: string;
};

export function AdminTopbar({ email, roleLabel }: AdminTopbarProps) {
  async function logoutAction() {
    "use server";
    await signOut({ redirectTo: "/admin/login" });
  }

  return (
    <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Bảng điều khiển quản trị</p>
          <p className="text-xs text-slate-500">
            {email} - {roleLabel}
          </p>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Đăng xuất
          </button>
        </form>
      </div>
      <AdminMobileNav />
    </header>
  );
}
