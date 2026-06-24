import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAllProductsForAdmin } from "@/lib/db/products";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export default async function AdminProductsPage() {
  const products = await getAllProductsForAdmin();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sản phẩm</h1>
          <p className="text-slate-500 mt-1">Quản lý danh mục sản phẩm của cửa hàng</p>
        </div>
        <Link href="/admin/products/new" className={buttonVariants()}>
          + Thêm sản phẩm
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="py-4">Tên</TableHead>
              <TableHead className="py-4">Giá</TableHead>
              <TableHead className="py-4">Giảm giá</TableHead>
              <TableHead className="py-4">Trạng thái</TableHead>
              <TableHead className="py-4 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow
                key={p.id}
                className={p.isActive === false ? "opacity-50 bg-slate-50/50" : ""}
              >
                <TableCell className="font-medium text-slate-900 py-3">{p.name}</TableCell>
                <TableCell className="text-slate-600 py-3">${p.price.toFixed(2)}</TableCell>
                <TableCell className="text-slate-600 py-3">
                  {p.discountPercentage != null
                    ? `${p.discountPercentage}%`
                    : "—"}
                </TableCell>
                <TableCell className="py-3">
                  {p.isActive === false ? (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-100 font-medium">Đã ẩn</Badge>
                  ) : (
                    <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 font-medium">Hiển thị</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2 py-3">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 px-3" })}
                  >
                    Sửa
                  </Link>
                  <DeleteProductButton
                    productId={p.id}
                    productName={p.name}
                    disabled={p.isActive === false}
                  />
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                  Chưa có sản phẩm nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
