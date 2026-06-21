import type { OrderRow } from "@/lib/db/orders";

const statusLabel: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipped: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

const statusBadgeStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  confirmed: "bg-blue-50 text-blue-700 border-blue-100",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-100",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
  cancelled: "bg-rose-50 text-rose-700 border-rose-100",
};

export default function OrderHistoryList({ orders }: { orders: OrderRow[] }) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p className="text-sm">Bạn chưa có đơn hàng nào.</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-5">
      {orders.map((order) => {
        const badgeStyle = statusBadgeStyles[order.status] ?? "bg-slate-50 text-slate-700 border-slate-100";
        return (
          <li
            key={order.id}
            className="border border-slate-100 rounded-2xl p-5 hover:shadow-sm transition-all bg-white"
          >
            <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
              <div>
                <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                  #{order.id.slice(0, 8).toUpperCase()}
                </span>
                <span className="text-xs text-slate-400 ml-3">
                  {new Date(order.created_at).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${badgeStyle}`}>
                {statusLabel[order.status] ?? order.status}
              </span>
            </div>

            <div className="border-y border-slate-50 py-3 my-3">
              <ul className="space-y-2">
                {order.items.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center text-sm text-slate-600">
                    <span className="font-medium">
                      {item.name} <span className="text-slate-400 text-xs">× {item.quantity}</span>
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Size: {item.size} | Color: {item.color}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Tổng thanh toán</span>
              <span className="text-base font-extrabold text-slate-900">${order.subtotal.toFixed(2)}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
