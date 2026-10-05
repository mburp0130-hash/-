import type { Area, AreaRecord, Layer, ScoreLevel, TrendLevel } from "@/types";

export function computeActivityScore(peopleScore: number, vehicleScore: number): number {
  return Math.round(peopleScore * 0.6 + vehicleScore * 0.4);
}

export function withActivity(record: AreaRecord): Area {
  return { ...record, activityScore: computeActivityScore(record.peopleScore, record.vehicleScore) };
}

export function getLayerScore(area: Area, layer: Layer): number {
  if (layer === "people") return area.peopleScore;
  if (layer === "vehicle") return area.vehicleScore;
  return area.activityScore;
}

export function getScoreLevel(score: number): ScoreLevel {
  if (score <= 20) return "veryQuiet";
  if (score <= 40) return "quiet";
  if (score <= 60) return "normal";
  if (score <= 80) return "busy";
  return "veryBusy";
}

export const LEVEL_META: Record<ScoreLevel, { label: string; color: string }> = {
  veryQuiet: { label: "매우 한산", color: "#94a3b8" },
  quiet: { label: "한산", color: "#38bdf8" },
  normal: { label: "보통", color: "#facc15" },
  busy: { label: "붐빔", color: "#fb923c" },
  veryBusy: { label: "매우 붐빔", color: "#ef4444" },
};

export function getTrendLevel(trend: number): TrendLevel {
  if (trend >= 20) return "surgeUp";
  if (trend >= 5) return "up";
  if (trend > -5) return "flat";
  if (trend > -20) return "down";
  return "surgeDown";
}

export const TREND_META: Record<TrendLevel, { label: string; arrow: string; className: string }> = {
  surgeUp: { label: "빠르게 증가 중", arrow: "↑", className: "text-red-600" },
  up: { label: "증가 중", arrow: "↗", className: "text-orange-600" },
  flat: { label: "평소 수준", arrow: "→", className: "text-slate-500" },
  down: { label: "감소 중", arrow: "↘", className: "text-sky-600" },
  surgeDown: { label: "빠르게 감소 중", arrow: "↓", className: "text-blue-700" },
};

export function formatTrend(trend: number): string {
  return `${trend > 0 ? "+" : ""}${trend}%`;
}
