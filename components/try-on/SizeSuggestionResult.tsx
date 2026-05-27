import type { SizeSuggestion } from "@/lib/try-on/claude/schema";

interface Props {
  data: SizeSuggestion;
  onReset: () => void;
}

export default function SizeSuggestionResult({ data, onReset }: Props) {
  const bar = Math.round(data.fit_percentage);
  const label =
    bar >= 90 ? "Rất phù hợp" : bar >= 75 ? "Phù hợp" : bar >= 60 ? "Vừa được" : "Có thể hơi chật/rộng";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6 border border-black p-6">
        <div className="text-center min-w-[5rem]">
          <p className="text-5xl font-black tracking-tight">{data.recommended_size}</p>
          <p className="text-xs uppercase tracking-widest text-gray-500 mt-1">Size</p>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
            <span className="text-sm font-bold">{bar}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100">
            <div
              className="h-full bg-black transition-all duration-700"
              style={{ width: `${bar}%` }}
            />
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-700 leading-relaxed">{data.advice}</p>

      <button
        onClick={onReset}
        className="text-xs uppercase tracking-widest underline hover:no-underline text-gray-500"
      >
        Đo lại
      </button>
    </div>
  );
}
