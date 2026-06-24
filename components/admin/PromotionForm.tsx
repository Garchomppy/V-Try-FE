"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tag, Calendar, CheckSquare, AlertCircle, Percent } from "lucide-react";
import type { Product } from "@/lib/types/product";
import type { Promotion } from "@/lib/db/promotions";

interface Props {
  action: (formData: FormData, selectedProductIds: string[]) => Promise<void>;
  promotion?: Promotion;
  products: Product[];
  initialSelectedProductIds?: string[];
  error?: string;
}

export default function PromotionForm({
  action,
  promotion,
  products,
  initialSelectedProductIds = [],
  error,
}: Props) {
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    initialSelectedProductIds,
  );
  const [loading, setLoading] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const displayError = clientError || error;

  function toggleProduct(productId: string) {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  }

  function handleSelectAll() {
    if (selectedProductIds.length === products.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products.map((p) => p.id));
    }
  }

  const defaultStartDate = promotion?.startDate
    ? new Date(promotion.startDate).toISOString().slice(0, 16)
    : "";
  const defaultEndDate = promotion?.endDate
    ? new Date(promotion.endDate).toISOString().slice(0, 16)
    : "";

  const [nowLocalStr, setNowLocalStr] = useState<string>("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNowLocalStr(
      new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16),
    );
  }, []);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        setClientError(null);

        const form = e.currentTarget;
        const formData = new FormData(form);
        const name = formData.get("name") as string;
        const discountPercentageStr = formData.get(
          "discountPercentage",
        ) as string;
        const startDate = formData.get("startDate") as string;
        const endDate = formData.get("endDate") as string;

        if (!name || !name.trim()) {
          setClientError("Vui lòng nhập tên chương trình khuyến mãi");
          setLoading(false);
          return;
        }

        const discountPercentage = parseInt(discountPercentageStr, 10);
        if (
          isNaN(discountPercentage) ||
          discountPercentage < 0 ||
          discountPercentage > 100
        ) {
          setClientError("Phần trăm giảm giá phải từ 0% đến 100%");
          setLoading(false);
          return;
        }

        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
          setClientError("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc");
          setLoading(false);
          return;
        }

        // Validate past dates (only when creating a new promotion)
        if (!promotion) {
          const nowWithBuffer = new Date(Date.now() - 60000); // 1 minute tolerance
          if (startDate && new Date(startDate) < nowWithBuffer) {
            setClientError("Ngày bắt đầu không được ở trong quá khứ");
            setLoading(false);
            return;
          }
          if (endDate && new Date(endDate) < nowWithBuffer) {
            setClientError("Ngày kết thúc không được ở trong quá khứ");
            setLoading(false);
            return;
          }
        }

        if (selectedProductIds.length === 0) {
          setClientError(
            "Vui lòng chọn ít nhất 01 sản phẩm để áp dụng chương trình khuyến mãi",
          );
          setLoading(false);
          return;
        }

        try {
          await action(formData, selectedProductIds);
        } finally {
          setLoading(false);
        }
      }}
      className="flex flex-col gap-8"
    >
      {displayError && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 font-medium border border-red-100">
          <AlertCircle className="w-4 h-4" />
          {displayError}
        </div>
      )}

      {/* Thông tin cơ bản */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Tag className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-semibold text-slate-800">
            Thông tin Khuyến mãi
          </h2>
        </div>

        <div className="grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700 font-medium">
              Tên chương trình khuyến mãi
            </Label>
            <Input
              id="name"
              name="name"
              defaultValue={promotion?.name}
              required
              className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 rounded-xl"
              placeholder="Ví dụ: Giảm giá mùa Hè cực sốc"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-700 font-medium">
              Mô tả chiến dịch
            </Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={promotion?.description ?? ""}
              rows={3}
              className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 rounded-xl resize-none"
              placeholder="Nhập mô tả chi tiết chương trình..."
            />
          </div>
        </div>
      </div>

      {/* Mức giảm giá & Trạng thái */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Percent className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-semibold text-slate-800">
            Mức giảm & Trạng thái
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label
              htmlFor="discountPercentage"
              className="text-slate-700 font-medium"
            >
              Phần trăm giảm giá (%)
            </Label>
            <div className="relative">
              <Input
                id="discountPercentage"
                name="discountPercentage"
                type="number"
                min="0"
                max="100"
                defaultValue={promotion?.discountPercentage}
                required
                className="bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 rounded-xl pr-8"
                placeholder="Ví dụ: 20"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                %
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="isActive" className="text-slate-700 font-medium">
              Trạng thái hoạt động
            </Label>
            <select
              id="isActive"
              name="isActive"
              defaultValue={promotion?.isActive ? "true" : "false"}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="true">Kích hoạt (Áp dụng giảm giá ngay)</option>
              <option value="false">Tạm khóa (Không áp dụng giảm giá)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Thời hạn chương trình */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Calendar className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-slate-800">
            Thời hạn áp dụng
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-slate-700 font-medium">
              Từ ngày
            </Label>
            <Input
              id="startDate"
              name="startDate"
              type="datetime-local"
              defaultValue={defaultStartDate}
              min={!promotion ? nowLocalStr : undefined}
              className="bg-slate-50 border-slate-200 focus-visible:ring-amber-500 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-slate-700 font-medium">
              Đến ngày
            </Label>
            <Input
              id="endDate"
              name="endDate"
              type="datetime-local"
              defaultValue={defaultEndDate}
              min={!promotion ? nowLocalStr : undefined}
              className="bg-slate-50 border-slate-200 focus-visible:ring-amber-500 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Danh sách sản phẩm áp dụng */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-slate-800 font-medium">
              Sản phẩm được áp dụng ({selectedProductIds.length})
            </h2>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="rounded-lg text-xs"
          >
            {selectedProductIds.length === products.length
              ? "Bỏ chọn tất cả"
              : "Chọn tất cả"}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto p-2 border border-slate-200/50 rounded-xl bg-slate-50/50">
          {products.map((product) => {
            const isChecked = selectedProductIds.includes(product.id);
            return (
              <div
                key={product.id}
                onClick={() => toggleProduct(product.id)}
                className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 select-none ${
                  isChecked
                    ? "bg-indigo-50/80 border-indigo-200 shadow-sm"
                    : "bg-white border-slate-150 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`w-4.5 h-4.5 rounded flex items-center justify-center border transition-colors ${
                    isChecked
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "border-slate-300 text-transparent"
                  }`}
                >
                  {isChecked && (
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <Button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl px-6 py-2.5 transition-all shadow-sm"
        >
          {loading
            ? "Đang lưu..."
            : promotion
              ? "Cập nhật khuyến mãi"
              : "Tạo khuyến mãi"}
        </Button>
      </div>
    </form>
  );
}
