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

  if (isAdmin) {
    return <>{children}</>;
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
