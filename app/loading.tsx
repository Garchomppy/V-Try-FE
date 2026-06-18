import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 text-black animate-spin" />
      <p className="text-sm text-gray-500 font-medium animate-pulse tracking-widest uppercase">
        Đang tải...
      </p>
    </div>
  );
}
