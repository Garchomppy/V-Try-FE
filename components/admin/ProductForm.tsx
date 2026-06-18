import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types/product";

interface Props {
  action: (formData: FormData) => Promise<void>;
  product?: Product;
  error?: string;
}

export default function ProductForm({ action, product, error }: Props) {
  const colorsDefault = product?.colors.map((c) => `${c.name}:${c.hex}`).join(", ") ?? "";
  const sizesDefault = product?.sizes.join(", ") ?? "";
  const imagesDefault = product?.images.join("\n") ?? "";

  return (
    <form action={action} className="flex flex-col gap-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <Label htmlFor="name">Tên sản phẩm</Label>
        <Input id="name" name="name" defaultValue={product?.name} required />
      </div>
      <div>
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={product?.description}
          rows={4}
          required
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="price">Giá ($)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            defaultValue={product?.price}
            required
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="discountPercentage">Giảm giá (%)</Label>
          <Input
            id="discountPercentage"
            name="discountPercentage"
            type="number"
            defaultValue={product?.discountPercentage ?? ""}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="images">Ảnh (mỗi dòng 1 URL)</Label>
        <Textarea id="images" name="images" defaultValue={imagesDefault} rows={3} required />
      </div>
      <div>
        <Label htmlFor="colors">{'Màu sắc (dạng "Tên:#hex, Tên:#hex")'}</Label>
        <Input id="colors" name="colors" defaultValue={colorsDefault} required />
      </div>
      <div>
        <Label htmlFor="sizes">Sizes (phân cách bởi dấu phẩy)</Label>
        <Input id="sizes" name="sizes" defaultValue={sizesDefault} required />
      </div>
      <Button type="submit" className="mt-2">
        {product ? "Lưu thay đổi" : "Thêm sản phẩm"}
      </Button>
    </form>
  );
}
