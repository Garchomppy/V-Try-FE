"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { CartItem } from "@/lib/store/cart";

interface Props {
  items: CartItem[];
  subtotal: number;
  defaultValues?: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
  };
  onSuccess: (orderId: string) => void;
  onClose: () => void;
}

type FormState = {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  note: string;
};

type ScreenState = "form" | "loading" | "success" | "error";

export default function CheckoutModal({ items, subtotal, defaultValues, onSuccess, onClose }: Props) {
  const [form, setForm] = useState<FormState>({
    customerName: defaultValues?.customerName ?? "",
    customerPhone: defaultValues?.customerPhone ?? "",
    customerAddress: defaultValues?.customerAddress ?? "",
    note: "",
  });
  const [screen, setScreen] = useState<ScreenState>("form");
  const [orderId, setOrderId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  function update(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !form.customerName.trim() ||
      !form.customerPhone.trim() ||
      !form.customerAddress.trim()
    )
      return;
    setScreen("loading");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items, subtotal }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { id } = await res.json();
      setOrderId(id);
      setScreen("success");
      onSuccess(id);
    } catch (err) {
      setErrorMsg(
        (err as Error).message || "Đặt hàng thất bại, vui lòng thử lại.",
      );
      setScreen("error");
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold uppercase tracking-widest">
            {screen === "success" ? "Đặt hàng thành công" : "Thông tin giao hàng"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {screen === "form" && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
                  Họ tên *
                </label>
                <input
                  required
                  value={form.customerName}
                  onChange={update("customerName")}
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
                  Số điện thoại *
                </label>
                <input
                  required
                  value={form.customerPhone}
                  onChange={update("customerPhone")}
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
                  placeholder="0901234567"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
                  Địa chỉ giao hàng *
                </label>
                <input
                  required
                  value={form.customerAddress}
                  onChange={update("customerAddress")}
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
                  placeholder="123 Lê Lợi, Q.1, TP.HCM"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
                  Ghi chú
                </label>
                <textarea
                  value={form.note}
                  onChange={update("note")}
                  rows={2}
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black resize-none"
                  placeholder="Giao giờ hành chính, gọi trước..."
                />
              </div>

              <div className="border-t pt-4 mt-2 flex justify-between text-sm font-semibold">
                <span>Tổng tiền (COD)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-3 uppercase font-bold tracking-widest text-sm hover:bg-gray-900 transition-colors mt-2"
              >
                Xác nhận đặt hàng
              </button>
            </form>
          )}

          {screen === "loading" && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Đang xử lý đơn hàng...</p>
            </div>
          )}

          {screen === "success" && (
            <div className="flex flex-col items-center text-center py-8 gap-4">
              <div className="w-14 h-14 bg-black text-white flex items-center justify-center rounded-full text-2xl">
                ✓
              </div>
              <p className="text-base font-semibold">Cảm ơn bạn đã đặt hàng!</p>
              <p className="text-sm text-gray-500">
                Mã đơn hàng:{" "}
                <span className="font-mono font-bold text-black">
                  {orderId.slice(0, 8).toUpperCase()}
                </span>
              </p>
              <p className="text-xs text-gray-400">
                Chúng tôi sẽ liên hệ xác nhận qua SĐT trong vòng 24h.
              </p>
              <button
                onClick={onClose}
                className="mt-4 w-full bg-black text-white py-3 uppercase font-bold tracking-widest text-sm hover:bg-gray-900 transition-colors"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          )}

          {screen === "error" && (
            <div className="flex flex-col items-center text-center py-8 gap-4">
              <p className="text-red-600 text-sm">{errorMsg}</p>
              <button
                onClick={() => setScreen("form")}
                className="w-full border border-black py-3 uppercase font-bold tracking-widest text-sm hover:bg-gray-50"
              >
                Thử lại
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
