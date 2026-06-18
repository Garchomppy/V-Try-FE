"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

export function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 h-12 text-sm font-medium shadow-sm flex items-center gap-2 transition-all"
    >
      {pending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Sparkles className="w-4 h-4" />
      )}
      {pending ? "Đang xử lý..." : isEdit ? "Lưu thay đổi" : "Tạo sản phẩm"}
    </Button>
  );
}
