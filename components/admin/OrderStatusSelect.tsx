"use client";

import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateOrderStatus } from "@/lib/actions/orders";

const STATUS_OPTIONS = [
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "shipped", label: "Đang giao" },
  { value: "delivered", label: "Đã giao" },
  { value: "cancelled", label: "Đã huỷ" },
];

interface Props {
  orderId: string;
  currentStatus: string;
}

export default function OrderStatusSelect({ orderId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleChange(newStatus: string | null) {
    if (!newStatus) return;
    startTransition(async () => {
      await updateOrderStatus(orderId, newStatus);
    });
  }

  return (
    <Select value={currentStatus} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger id={`order-status-${orderId}`} className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((s) => (
          <SelectItem key={s.value} value={s.value}>
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
