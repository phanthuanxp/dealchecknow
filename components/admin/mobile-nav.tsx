"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminNavItems } from "@/lib/admin-navigation";
import { cn } from "@/lib/utils";

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="-mx-4 mt-4 overflow-x-auto px-4 pb-1 md:hidden">
      <ul className="flex min-w-max items-center gap-2">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "inline-flex rounded-full border px-3 py-2 text-xs font-semibold transition",
                  isActive
                    ? "border-teal-300 bg-teal-50 text-teal-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
