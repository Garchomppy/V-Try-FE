import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingActions from "@/components/ui/FloatingActions";
import CartDrawer from "@/components/cart/CartDrawer";

import ConditionalShopLayout from "@/components/layout/ConditionalShopLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Blue Banana - Modern Minimalist MVP",
  description: "High-end minimalist e-commerce fashion site",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-black">
        <ConditionalShopLayout
          header={<Header />}
          footer={<Footer />}
          floatingActions={<FloatingActions />}
          cartDrawer={<CartDrawer />}
        >
          {children}
        </ConditionalShopLayout>
      </body>
    </html>
  );
}
