import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/admin/SubmitButton";
import {
  Package,
  DollarSign,
  Image as ImageIcon,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import type { Product } from "@/lib/types/product";

interface Props {
  action: (formData: FormData) => Promise<void>;
  product?: Product;
  error?: string;
}

export default function ProductForm({ action, product, error }: Props) {
  const colorsDefault =
    product?.colors.map((c) => `${c.name}:${c.hex}`).join(", ") ?? "";
  const sizesDefault = product?.sizes.join(", ") ?? "";
  const imagesDefault = product?.images.join("\n") ?? "";

  return (
    <form action={action} className="flex flex-col gap-8">
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 font-medium border border-red-100">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Thông tin cơ bản */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Package className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-semibold text-slate-800">
            Thông tin cơ bản
          </h2>
        </div>

        <div className="grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700 font-medium">
              Tên sản phẩm
            </Label>
            <Input
              id="name"
              name="name"
              defaultValue={product?.name}
              required
              className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 rounded-xl"
              placeholder="Ví dụ: Áo thun nam Basic"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-700 font-medium">
              Mô tả
            </Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={product?.description}
              rows={4}
              required
              className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 rounded-xl resize-none"
              placeholder="Nhập mô tả chi tiết về sản phẩm..."
            />
          </div>
        </div>
      </div>

      {/* Giá cả */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <DollarSign className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-semibold text-slate-800">
            Giá & Khuyến mãi
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="price" className="text-slate-700 font-medium">
              Giá bán ($)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                $
              </span>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                defaultValue={product?.price}
                required
                className="bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 rounded-xl pl-8"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="discountPercentage"
              className="text-slate-700 font-medium"
            >
              Giảm giá (%)
            </Label>
            <div className="relative">
              <Input
                id="discountPercentage"
                name="discountPercentage"
                type="number"
                defaultValue={product?.discountPercentage ?? ""}
                className="bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 rounded-xl pr-8"
                placeholder="Ví dụ: 15"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Media & Phân loại */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <ImageIcon className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-semibold text-slate-800">
            Hình ảnh & Thuộc tính
          </h2>
        </div>

        <div className="grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="images" className="text-slate-700 font-medium">
              Link hình ảnh
            </Label>
            <Textarea
              id="images"
              name="images"
              defaultValue={imagesDefault}
              rows={3}
              required
              className="bg-slate-50 border-slate-200 focus-visible:ring-purple-500 rounded-xl font-mono text-sm resize-none"
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
            />
            <p className="text-xs text-slate-500">
              Mỗi URL hình ảnh nằm trên một dòng riêng biệt.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="colors" className="text-slate-700 font-medium">
                Màu sắc
              </Label>
              <Input
                id="colors"
                name="colors"
                defaultValue={colorsDefault}
                required
                className="bg-slate-50 border-slate-200 focus-visible:ring-purple-500 rounded-xl"
                placeholder="Đen:#000000, Trắng:#FFFFFF"
              />
              <p className="text-xs text-slate-500">
                Định dạng: TênMàu:#MãHex, cách nhau bằng dấu phẩy.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sizes" className="text-slate-700 font-medium">
                Kích cỡ
              </Label>
              <Input
                id="sizes"
                name="sizes"
                defaultValue={sizesDefault}
                required
                className="bg-slate-50 border-slate-200 focus-visible:ring-purple-500 rounded-xl"
                placeholder="S, M, L, XL"
              />
              <p className="text-xs text-slate-500">
                Các kích cỡ cách nhau bằng dấu phẩy.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <SubmitButton isEdit={!!product} />
      </div>
    </form>
  );
}
