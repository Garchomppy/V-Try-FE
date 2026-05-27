"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { X } from "lucide-react";
import type { Product } from "@/app/data/products";
import TryOnTabs, { type TryOnTab } from "./TryOnTabs";
import SizeSuggestionForm from "./SizeSuggestionForm";
import LoadingSpinner from "./shared/LoadingSpinner";

// Heavy deps — dynamic import, no SSR
const ARTryOn = dynamic(() => import("./ARTryOn"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-zinc-950">
      <LoadingSpinner label="Đang tải V-Style AR..." />
    </div>
  ),
});

const Avatar3DTryOn = dynamic(() => import("./Avatar3DTryOn"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <LoadingSpinner label="Đang tải V-Fit 3D..." />
    </div>
  ),
});

interface Props {
  product: Product;
  open: boolean;
  onClose: () => void;
  selectedSize: string;
  selectedColor: string;
}

export default function TryOnModal({
  product,
  open,
  onClose,
  selectedSize,
  selectedColor,
}: Props) {
  // AR and 3D are always available — garment selection is done inside those components
  const hasSizing = Boolean(product.tryOn?.sizing?.sizeChart?.length);

  const available: TryOnTab[] = [
    ...(hasSizing ? ["size" as const] : []),
    "ar" as const,
    "3d" as const,
  ];

  const [tab, setTab] = useState<TryOnTab>(hasSizing ? "size" : "ar");

  // Prevent body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const isARTab = tab === "ar";
  const is3DTab = tab === "3d";
  const isSizeTab = tab === "size";

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex-none border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">
              V-TRY AI
            </p>
            <h2 className="text-sm font-bold uppercase tracking-wider">
              {product.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 transition-colors rounded-lg"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6">
          <TryOnTabs value={tab} onChange={setTab} available={available} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isSizeTab && (
          <div className="h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 py-8 w-full">
              <SizeSuggestionForm product={product} />
            </div>
          </div>
        )}

        {isARTab && (
          <div className="h-full">
            {/* Pass the current product so ARTryOn uses its overlay image & config */}
            <ARTryOn product={product} />
          </div>
        )}

        {is3DTab && (
          <div className="h-full">
            <Avatar3DTryOn />
          </div>
        )}
      </div>
    </div>
  );
}
