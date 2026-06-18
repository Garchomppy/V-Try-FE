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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Sản phẩm</h1>
        <Link href="/admin/products/new" className={buttonVariants()}>
          + Thêm sản phẩm
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên</TableHead>
            <TableHead>Giá</TableHead>
            <TableHead>Giảm giá</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow
              key={p.id}
              className={p.isActive === false ? "opacity-50" : ""}
            >
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell>${p.price.toFixed(2)}</TableCell>
              <TableCell>
                {p.discountPercentage != null
                  ? `${p.discountPercentage}%`
                  : "—"}
              </TableCell>
              <TableCell>
                {p.isActive === false ? (
                  <Badge variant="secondary">Đã ẩn</Badge>
                ) : (
                  <Badge variant="default">Hiển thị</Badge>
                )}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Link
                  href={`/admin/products/${p.id}/edit`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
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
              <TableCell colSpan={5} className="text-center text-gray-400">
                Chưa có sản phẩm nào.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
