"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { Product } from "@/app/data/products";
import { useSizeSuggestion } from "@/lib/try-on/hooks/useSizeSuggestion";
import SizeSuggestionResult from "./SizeSuggestionResult";

interface SliderProps {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}

function Slider({ label, unit, value, min, max, onChange }: SliderProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {label}
        </span>
        <span className="text-sm font-bold tabular-nums">
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-black"
      />
    </div>
  );
}

interface Props {
  product: Product;
}

export default function SizeSuggestionForm({ product }: Props) {
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(65);
  const [chest, setChest] = useState(95);
  const [waist, setWaist] = useState(82);
  const [hips, setHips] = useState(95);

  const { state, submit, reset } = useSizeSuggestion();
  const isCargo = product.id === "p1";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submit({
      productId: product.id,
      measurements: {
        heightCm: height,
        weightKg: weight,
        chestCm: chest,
        waistCm: waist,
        hipsCm: hips,
      },
    });
  }

  if (state.status === "success") {
    return <SizeSuggestionResult data={state.data} product={product} onReset={reset} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-xs text-gray-500 uppercase tracking-widest">
        Nhập số đo để nhận gợi ý size chính xác từ AI
      </p>

      <Slider label="Chiều cao" unit="cm" value={height} min={150} max={210} onChange={setHeight} />
      <Slider label="Cân nặng" unit="kg" value={weight} min={40} max={150} onChange={setWeight} />

      {!isCargo && (
        <Slider label="Vòng ngực" unit="cm" value={chest} min={70} max={130} onChange={setChest} />
      )}

      <Slider label="Vòng eo" unit="cm" value={waist} min={60} max={120} onChange={setWaist} />

      {isCargo && (
        <Slider label="Vòng mông" unit="cm" value={hips} min={70} max={130} onChange={setHips} />
      )}

      {state.status === "error" && (
        <p className="text-sm text-red-600 border border-red-200 bg-red-50 px-3 py-2">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={state.status === "loading"}
        className="w-full bg-black text-white py-3.5 text-sm font-bold uppercase tracking-widest hover:bg-gray-900 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
      >
        {state.status === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
        {state.status === "loading" ? "Đang phân tích..." : "Nhận gợi ý size"}
      </button>
    </form>
  );
}
