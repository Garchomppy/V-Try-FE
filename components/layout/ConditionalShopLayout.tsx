"use client";

import { usePathname } from "next/navigation";
import React from "react";

interface Props {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
  floatingActions: React.ReactNode;
  cartDrawer: React.ReactNode;
}

export default function ConditionalShopLayout({
  children,
  header,
  footer,
  floatingActions,
  cartDrawer,
}: Props) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (isAdmin || isAuthPage) {
    return <div className="min-h-screen bg-slate-50 flex flex-col">{children}</div>;
  }

  return (
    <>
      {header}
      <main className="flex-grow">{children}</main>
      {footer}
      {floatingActions}
      {cartDrawer}
    </>
  );
}
