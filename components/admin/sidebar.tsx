"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminNavItems } from "@/lib/admin-navigation";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  roleLabel: string;
};

export function AdminSidebar({ roleLabel }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 border-r border-slate-200 bg-white md:flex md:flex-col">
      <div className="border-b border-slate-200 px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Taxi Ninh Bình</p>
        <h1 className="mt-1 text-lg font-bold text-slate-900">AdminCP</h1>
        <p className="mt-2 text-xs text-slate-500">{roleLabel}</p>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-lg px-3 py-2.5 transition",
                isActive ? "bg-teal-50 text-teal-700" : "text-slate-700 hover:bg-slate-50"
              )}
            >
              <p className="text-sm font-semibold">{item.label}</p>
              <p className={cn("text-xs", isActive ? "text-teal-600" : "text-slate-500")}>{item.description}</p>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
