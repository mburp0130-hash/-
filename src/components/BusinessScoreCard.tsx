"use client";

import { useState } from "react";
import type { BusinessScore } from "@/types";

export default function BusinessScoreCard({ item, rank }: { item: BusinessScore; rank: number }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
            {rank}
          </span>
          <span className="text-base font-bold">
            {item.emoji} {item.label}
          </span>
        </div>
        <span className="text-xl font-extrabold text-blue-600">{item.score}점</span>
      </div>
      <p className="mt-1 text-sm text-slate-600">{item.summary}</p>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
      >
        왜? {open ? "▲" : "▼"}
      </button>
      {open && (
        <ul className="mt-2 space-y-1 text-sm text-slate-700">
          {item.reasons.map((r) => (
            <li key={r}>- {r}</li>
          ))}
        </ul>
      )}
    </li>
  );
}
