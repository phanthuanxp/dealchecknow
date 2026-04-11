import { redirect } from "next/navigation";

import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
import { auth } from "@/lib/auth";

type AdminDashboardLayoutProps = {
  children: React.ReactNode;
};

const roleLabel: Record<string, string> = {
  ADMIN: "Quản trị viên",
  EDITOR: "Biên tập viên"
};

export default async function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admincp/login");
  }

  const resolvedRoleLabel = roleLabel[session.user.role] ?? session.user.role;

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <AdminSidebar roleLabel={resolvedRoleLabel} />
      <div className="min-w-0 flex-1">
        <AdminTopbar email={session.user.email ?? "chua-co-email@taxininhbinh.com"} roleLabel={resolvedRoleLabel} />
        <main className="px-4 py-5 sm:px-6 sm:py-6">{children}</main>
      </div>
    </div>
  );
}
