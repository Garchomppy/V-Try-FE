"use client";

export type TryOnTab = "size" | "ar" | "3d";

interface Props {
  value: TryOnTab;
  onChange: (tab: TryOnTab) => void;
  available: TryOnTab[];
}

const TAB_LABELS: Record<TryOnTab, string> = {
  size: "AI Size",
  ar: "V-Style AR",
  "3d": "V-Fit 3D",
};

export default function TryOnTabs({ value, onChange, available }: Props) {
  return (
    <div className="flex border-b border-gray-200">
      {(["size", "ar", "3d"] as TryOnTab[]).map((tab) => {
        const enabled = available.includes(tab);
        const active = value === tab;
        return (
          <button
            key={tab}
            onClick={() => enabled && onChange(tab)}
            disabled={!enabled}
            className={`px-5 py-3.5 text-xs font-bold uppercase tracking-widest border-b-2 -mb-px transition-colors
              ${active ? "border-[#FF6F61] text-[#FF6F61]" : "border-transparent"}
              ${enabled ? "hover:text-gray-800 text-gray-500" : "text-gray-300 cursor-not-allowed"}
            `}
          >
            {TAB_LABELS[tab]}
          </button>
        );
      })}
    </div>
  );
}
