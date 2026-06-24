"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deletePromotionAction } from "@/lib/actions/promotions";

interface Props {
  promotionId: string;
  promotionName: string;
  disabled?: boolean;
}

export default function DeletePromotionButton({ promotionId, promotionName, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await deletePromotionAction(promotionId);
      setOpen(false);
    });
  }

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        className="h-8 px-3 rounded-lg"
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        Xóa
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa khuyến mãi</DialogTitle>
            <DialogDescription>
              Chương trình khuyến mãi &quot;{promotionName}&quot; sẽ bị xóa hoàn toàn khỏi hệ thống và giá các sản phẩm liên kết sẽ khôi phục về giá gốc. Hành động này không thể hoàn tác. Xác nhận?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="rounded-xl"
            >
              Huỷ
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isPending}
              className="rounded-xl"
            >
              {isPending ? "Đang xử lý..." : "Xác nhận xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
