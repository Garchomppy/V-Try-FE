import { getAllProductsForAdmin } from "@/lib/db/products";
import { getAllOrdersForAdmin } from "@/lib/db/orders";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [products, orders] = await Promise.all([
    getAllProductsForAdmin(),
    getAllOrdersForAdmin(),
  ]);

  const totalRevenue = orders.reduce((sum, order) => {
    // Tùy theo logic doanh thu, có thể chỉ tính order "completed"
    if (order.status !== "cancelled") {
      return sum + order.subtotal;
    }
    return sum;
  }, 0);

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;

  const stats = [
    {
      title: "Tổng doanh thu",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      trend: "+12.5%",
      description: "So với tháng trước",
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      title: "Tổng đơn hàng",
      value: orders.length.toString(),
      icon: ShoppingCart,
      trend: "+5.2%",
      description: `${pendingOrders} đơn đang chờ xử lý`,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Sản phẩm",
      value: products.length.toString(),
      icon: Package,
      trend: "Mới cập nhật",
      description: `${products.filter((p) => p.isActive).length} sản phẩm đang bán`,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
    },
    {
      title: "Tỷ lệ hoàn thành",
      value: orders.length ? `${Math.round((completedOrders / orders.length) * 100)}%` : "0%",
      icon: TrendingUp,
      trend: "+2.1%",
      description: "Tỷ lệ đơn hàng thành công",
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-2">Tổng quan về tình hình kinh doanh của cửa hàng.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="p-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className={`text-xs font-medium ${stat.color}`}>{stat.trend}</span>
                <span className="text-xs text-slate-500">{stat.description}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Đơn hàng gần đây</h2>
          {orders.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có đơn hàng nào.</p>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{order.customer_name}</p>
                    <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString("vi-VN")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">${order.subtotal.toFixed(2)}</p>
                    <p className="text-xs text-slate-500">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col items-center justify-center text-center">
           <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
              <Package className="w-10 h-10 text-indigo-500" />
           </div>
           <h3 className="text-lg font-semibold text-slate-900">Sẵn sàng mở rộng</h3>
           <p className="text-sm text-slate-500 max-w-sm mt-2">
             Mọi thứ đang hoạt động ổn định. Hệ thống sẵn sàng cho những tính năng mới.
           </p>
        </div>
      </div>
    </div>
  );
}
