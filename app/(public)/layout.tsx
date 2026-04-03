import { ReactNode } from "react";

import { FloatingContact } from "@/components/public/floating-contact";
import { PublicFooter } from "@/components/public/footer";
import { PublicHeader } from "@/components/public/header";
import { MobileStickyBar } from "@/components/public/mobile-sticky-bar";

type PublicLayoutProps = {
  children: ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <>
      <PublicHeader />
      <main className="pb-24 md:pb-0">{children}</main>
      <PublicFooter />
      <FloatingContact />
      <MobileStickyBar />
    </>
  );
}
