import { Camera } from "lucide-react";

interface Props {
  error?: string;
  onRetry: () => void;
}

export default function CameraPermissionPrompt({ error, onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center">
      <div className="w-16 h-16 border border-black flex items-center justify-center">
        <Camera className="w-8 h-8" />
      </div>
      <div>
        <h3 className="font-bold uppercase tracking-widest text-sm mb-2">
          {error ? "Không thể truy cập camera" : "Cần quyền truy cập camera"}
        </h3>
        <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
          {error ??
            "V-Style AR cần webcam để hoạt động. Cho phép truy cập camera trong trình duyệt để tiếp tục."}
        </p>
      </div>
      <button
        onClick={onRetry}
        className="square-button bg-black text-white text-xs hover:bg-gray-900"
      >
        Thử lại
      </button>
    </div>
  );
}
