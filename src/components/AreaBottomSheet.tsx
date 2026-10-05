"use client";

import { useEffect, useState } from "react";
import type { Area, AreaDetail, BusinessScore } from "@/types";
import { LEVEL_META, getScoreLevel } from "@/lib/scores";
import AreaScore from "./AreaScore";
import BusinessInsight from "./BusinessInsight";
import Sheet from "./Sheet";
import TrafficChart from "./TrafficChart";
import TrendIndicator, { TrendPercent } from "./TrendIndicator";

export default function AreaBottomSheet({ area, onClose }: { area: Area; onClose: () => void }) {
  const [showInsight, setShowInsight] = useState(false);
  const [insights, setInsights] = useState<BusinessScore[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/areas/${area.id}`)
      .then((r) => (r.ok ? (r.json() as Promise<AreaDetail>) : Promise.reject(new Error("fetch failed"))))
      .then((d) => !cancelled && setInsights(d.insights))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [area.id]);

  const level = LEVEL_META[getScoreLevel(area.activityScore)];

  return (
    <Sheet title={area.name} onClose={onClose}>
      <p className="text-sm text-slate-500">{area.description}</p>

      <div className="mt-3 rounded-2xl bg-slate-50 p-4">
        <div className="text-xs text-slate-500">현재 활성도</div>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-extrabold">{area.activityScore}</span>
          <span className="pb-1 text-slate-400">/ 100</span>
          <span className="ml-auto pb-1 text-sm font-bold" style={{ color: level.color }}>
            {area.activityScore > 60 ? "🔥 " : ""}
            {level.label}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-sm">
          <TrendPercent trend={area.trend} />
          <TrendIndicator trend={area.trend} />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <AreaScore label="사람" score={area.peopleScore} />
        <AreaScore label="차량" score={area.vehicleScore} />
        <AreaScore label="종합" score={area.activityScore} />
      </div>

      <h3 className="mb-1 mt-5 text-base font-bold">시간대별 변화</h3>
      <TrafficChart area={area} />

      {!showInsight ? (
        <button
          onClick={() => setShowInsight(true)}
          className="mt-5 w-full rounded-2xl bg-blue-600 py-3.5 text-base font-bold text-white shadow active:scale-[0.99]"
        >
          여기서 뭐하면 좋을까?
        </button>
      ) : error ? (
        <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-600">
          업종 분석을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
      ) : (
        <BusinessInsight insights={insights} />
      )}
    </Sheet>
  );
}
