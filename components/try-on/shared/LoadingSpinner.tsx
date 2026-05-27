import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ label = "Đang tải..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
      <Loader2 className="w-8 h-8 animate-spin" />
      <p className="text-xs uppercase tracking-widest">{label}</p>
    </div>
  );
}
