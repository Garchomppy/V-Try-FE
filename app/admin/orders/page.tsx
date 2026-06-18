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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Đơn hàng</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Lọc theo trạng thái:</span>
          <OrderStatusFilter currentStatus={status ?? "all"} />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã đơn</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>SĐT</TableHead>
            <TableHead>Tổng tiền</TableHead>
            <TableHead>Ngày đặt</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Đổi trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-mono text-xs text-gray-500">
                {order.id.slice(0, 8)}…
              </TableCell>
              <TableCell>{order.customer_name}</TableCell>
              <TableCell>{order.customer_phone}</TableCell>
              <TableCell>${Number(order.subtotal).toFixed(2)}</TableCell>
              <TableCell>
                {new Date(order.created_at).toLocaleDateString("vi-VN")}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[order.status] ?? "outline"}>
                  {STATUS_LABELS[order.status] ?? order.status}
                </Badge>
              </TableCell>
              <TableCell>
                <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
              </TableCell>
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-400">
                Không có đơn hàng nào.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
