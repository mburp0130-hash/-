"use client";

import { useEffect, useState } from "react";
import type { TrendingItem } from "@/types";
import { formatTrend } from "@/lib/scores";
import Sheet from "./Sheet";

export default function TrendingAreas({
  onSelect,
  onClose,
}: {
  onSelect: (item: TrendingItem) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<TrendingItem[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/trending")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("fetch failed"))))
      .then((d: { items: TrendingItem[] }) => setItems(d.items))
      .catch(() => setError(true));
  }, []);

  return (
    <Sheet title="🔥 지금 뜨는 곳" onClose={onClose}>
      {error && <p className="text-sm text-red-600">불러오지 못했습니다.</p>}
      {!items && !error && <p className="text-sm text-slate-500">불러오는 중...</p>}
      <ol className="mt-2 space-y-2">
        {items?.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => onSelect(item)}
              className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left active:bg-slate-50"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                {item.rank}
              </span>
              <span className="flex-1 font-semibold">{item.name}</span>
              <span className="font-bold text-red-600">{formatTrend(item.trend)}</span>
            </button>
          </li>
        ))}
      </ol>
    </Sheet>
  );
}
