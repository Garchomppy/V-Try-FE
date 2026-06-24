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
import { getAllPromotions } from "@/lib/db/promotions";
import DeletePromotionButton from "@/components/admin/DeletePromotionButton";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "Không giới hạn";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function AdminPromotionsPage() {
  const promotions = await getAllPromotions();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Chương trình Khuyến mãi
          </h1>
          <p className="text-slate-500 mt-1">
            Quản lý chiến dịch giảm giá và khuyến mãi sản phẩm
          </p>
        </div>
        <Link href="/admin/promotions/new" className={buttonVariants({ className: "rounded-xl" })}>
          + Thêm khuyến mãi
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="py-4">Tên chiến dịch</TableHead>
              <TableHead className="py-4">Mức giảm giá</TableHead>
              <TableHead className="py-4">Thời gian áp dụng</TableHead>
              <TableHead className="py-4">Trạng thái</TableHead>
              <TableHead className="py-4 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions.map((promo) => (
              <TableRow
                key={promo.id}
                className={!promo.isActive ? "opacity-65 bg-slate-50/50" : ""}
              >
                <TableCell className="font-semibold text-slate-900 py-4 max-w-xs">
                  <div>
                    <span className="block">{promo.name}</span>
                    {promo.description && (
                      <span className="block text-xs font-normal text-slate-500 truncate mt-0.5">
                        {promo.description}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge variant="default" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-indigo-200 font-bold px-2.5 py-1 text-sm rounded-lg">
                    -{promo.discountPercentage}%
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-600 text-sm py-4">
                  <div>
                    <span className="block text-xs text-slate-400">Từ: {formatDate(promo.startDate)}</span>
                    <span className="block text-xs text-slate-400">Đến: {formatDate(promo.endDate)}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  {promo.isActive ? (
                    <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 font-medium rounded-lg">
                      Hoạt động
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-100 font-medium rounded-lg">
                      Tạm ngưng
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2 py-4">
                  <Link
                    href={`/admin/promotions/${promo.id}/edit`}
                    className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 px-3 rounded-lg" })}
                  >
                    Sửa
                  </Link>
                  <DeletePromotionButton
                    promotionId={promo.id}
                    promotionName={promo.name}
                  />
                </TableCell>
              </TableRow>
            ))}
            {promotions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                  Chưa có chương trình khuyến mãi nào được tạo.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
