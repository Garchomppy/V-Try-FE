import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getAllOrdersForAdmin } from "@/lib/db/orders";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import OrderStatusFilter from "@/components/admin/OrderStatusFilter";

const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipped: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã huỷ",
};

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  confirmed: "default",
  shipped: "default",
  delivered: "secondary",
  cancelled: "destructive",
};

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const orders = await getAllOrdersForAdmin(status);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Đơn hàng</h1>
          <p className="text-slate-500 mt-1">Quản lý và cập nhật trạng thái đơn hàng</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200/60 shadow-sm">
          <span className="text-sm font-medium text-slate-500 pl-2">Lọc theo trạng thái:</span>
          <OrderStatusFilter currentStatus={status ?? "all"} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="py-4">Mã đơn</TableHead>
              <TableHead className="py-4">Khách hàng</TableHead>
              <TableHead className="py-4">SĐT</TableHead>
              <TableHead className="py-4">Tổng tiền</TableHead>
              <TableHead className="py-4">Ngày đặt</TableHead>
              <TableHead className="py-4">Trạng thái</TableHead>
              <TableHead className="py-4 text-right">Đổi trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-slate-50/50">
                <TableCell className="font-mono text-xs text-slate-500 py-3">
                  {order.id.slice(0, 8)}…
                </TableCell>
                <TableCell className="font-medium text-slate-900 py-3">{order.customer_name}</TableCell>
                <TableCell className="text-slate-600 py-3">{order.customer_phone}</TableCell>
                <TableCell className="text-slate-600 font-medium py-3">${Number(order.subtotal).toFixed(2)}</TableCell>
                <TableCell className="text-slate-600 py-3">
                  {new Date(order.created_at).toLocaleDateString("vi-VN")}
                </TableCell>
                <TableCell className="py-3">
                  <Badge variant={STATUS_VARIANT[order.status] ?? "outline"} className={order.status === "pending" ? "bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200" : order.status === "shipped" || order.status === "confirmed" ? "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200" : order.status === "delivered" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200" : ""}>
                    {STATUS_LABELS[order.status] ?? order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right py-3">
                  <div className="flex justify-end">
                     <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                  Không có đơn hàng nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
