import type { OrderRow } from "@/lib/db/orders";

const statusLabel: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipped: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

export default function OrderHistoryList({ orders }: { orders: OrderRow[] }) {
  if (orders.length === 0) {
    return <p className="text-sm text-gray-400">Bạn chưa có đơn hàng nào.</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {orders.map((order) => (
        <li key={order.id} className="border border-gray-200 p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="font-mono text-xs font-bold">
              {order.id.slice(0, 8).toUpperCase()}
            </span>
            <span className="text-xs uppercase font-semibold px-2 py-1 bg-gray-100">
              {statusLabel[order.status] ?? order.status}
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-2">
            {new Date(order.created_at).toLocaleDateString("vi-VN")}
          </p>
          <ul className="text-sm text-gray-600 mb-2">
            {order.items.map((item, idx) => (
              <li key={idx}>
                {item.name} × {item.quantity} ({item.size}, {item.color})
              </li>
            ))}
          </ul>
          <p className="text-sm font-bold">${order.subtotal.toFixed(2)}</p>
        </li>
      ))}
    </ul>
  );
}
