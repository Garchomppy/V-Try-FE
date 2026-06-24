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
import { deleteLiveSessionAction } from "@/lib/actions/liveSessions";

interface Props {
  sessionId: string;
  sessionTitle: string;
}

export default function DeleteLiveButton({ sessionId, sessionTitle }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await deleteLiveSessionAction(sessionId);
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
      >
        Xóa
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa phiên live</DialogTitle>
            <DialogDescription>
              Phiên live &quot;{sessionTitle}&quot; cùng toàn bộ bình luận sẽ bị xóa
              vĩnh viễn. Hành động này không thể hoàn tác. Xác nhận?
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
