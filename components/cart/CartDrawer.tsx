"use client";

import { useEffect, useState } from "react";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore, cartTotal, cartItemCount } from "@/lib/store/cart";
import CheckoutModal from "@/components/cart/CheckoutModal";
import { createBrowserSupabase } from "@/lib/supabase/client";

export default function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const clearCart = useCartStore((s) => s.clearCart);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [defaultValues, setDefaultValues] = useState<
    { customerName: string; customerPhone: string; customerAddress: string } | undefined
  >(undefined);

  useEffect(() => {
    if (!checkoutOpen) return;
    const supabase = createBrowserSupabase();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, address")
        .eq("id", data.user.id)
        .maybeSingle();
      if (profile) {
        setDefaultValues({
          customerName: profile.full_name ?? "",
          customerPhone: profile.phone ?? "",
          customerAddress: profile.address ?? "",
        });
      }
    });
  }, [checkoutOpen]);

  const subtotal = cartTotal(items);
  const count = cartItemCount(items);

  function handleSuccess() {
    clearCart();
    setCheckoutOpen(false);
    closeCart();
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={closeCart} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-base font-bold uppercase tracking-widest">
            Giỏ hàng {count > 0 && `(${count})`}
          </h2>
          <button
            onClick={closeCart}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
              <p className="text-sm">Giỏ hàng của bạn đang trống.</p>
              <button
                onClick={closeCart}
                className="text-xs underline hover:text-black"
              >
                Khám phá sản phẩm
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-5">
              {items.map((item) => (
                <li
                  key={`${item.productId}::${item.size}::${item.color}`}
                  className="flex gap-3"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-24 object-cover bg-gray-100 shrink-0"
                  />
                  <div className="flex flex-col flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Size: {item.size} · {item.color}
                    </p>
                    <p className="text-sm font-bold mt-1">
                      ${item.price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQty(
                            item.productId,
                            item.size,
                            item.color,
                            item.quantity - 1,
                          )
                        }
                        className="w-7 h-7 border border-gray-300 flex items-center justify-center hover:border-black"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQty(
                            item.productId,
                            item.size,
                            item.color,
                            item.quantity + 1,
                          )
                        }
                        className="w-7 h-7 border border-gray-300 flex items-center justify-center hover:border-black"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() =>
                          removeItem(item.productId, item.size, item.color)
                        }
                        className="ml-auto text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t">
            <div className="flex justify-between text-sm font-semibold mb-4">
              <span>Tạm tính</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <button
              onClick={() => setCheckoutOpen(true)}
              className="w-full bg-black text-white py-3 uppercase font-bold tracking-widest text-sm hover:bg-gray-900 transition-colors"
            >
              Đặt hàng (COD)
            </button>
          </div>
        )}
      </div>

      {checkoutOpen && (
        <CheckoutModal
          items={items}
          subtotal={subtotal}
          defaultValues={defaultValues}
          onSuccess={handleSuccess}
          onClose={() => setCheckoutOpen(false)}
        />
      )}
    </>
  );
}
