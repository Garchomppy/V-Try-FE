"use client";

import { ShoppingBag } from "lucide-react";
import { useCartStore, cartItemCount } from "@/lib/store/cart";

export default function CartButton() {
  const items = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  const count = cartItemCount(items);

  return (
    <button
      aria-label="Cart"
      onClick={openCart}
      className="relative hover:text-gray-600"
    >
      <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full leading-none">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}
