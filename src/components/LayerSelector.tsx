"use client";

import type { Layer } from "@/types";

const OPTIONS: { value: Layer; label: string }[] = [
  { value: "people", label: "사람" },
  { value: "vehicle", label: "차량" },
  { value: "total", label: "종합" },
];

export default function LayerSelector({ value, onChange }: { value: Layer; onChange: (l: Layer) => void }) {
  return (
    <div className="flex gap-2" role="tablist" aria-label="지도 레이어">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
            value === o.value ? "bg-blue-600 text-white shadow" : "bg-slate-100 text-slate-600"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
