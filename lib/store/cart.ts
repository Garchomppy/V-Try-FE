import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

function itemKey(productId: string, size: string, color: string) {
  return `${productId}::${size}::${color}`;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQty: (productId: string, size: string, color: string, qty: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      addItem: (item) =>
        set((state) => {
          const key = itemKey(item.productId, item.size, item.color);
          const existing = state.items.find(
            (i) => itemKey(i.productId, i.size, i.color) === key,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                itemKey(i.productId, i.size, i.color) === key
                  ? { ...i, quantity: i.quantity + 1 }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),

      removeItem: (productId, size, color) =>
        set((state) => ({
          items: state.items.filter(
            (i) =>
              itemKey(i.productId, i.size, i.color) !==
              itemKey(productId, size, color),
          ),
        })),

      updateQty: (productId, size, color, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter(
                  (i) =>
                    itemKey(i.productId, i.size, i.color) !==
                    itemKey(productId, size, color),
                )
              : state.items.map((i) =>
                  itemKey(i.productId, i.size, i.color) ===
                  itemKey(productId, size, color)
                    ? { ...i, quantity: qty }
                    : i,
                ),
        })),

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    { name: "bb-cart" },
  ),
);

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function cartItemCount(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
