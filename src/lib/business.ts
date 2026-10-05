import type { Area, BusinessScore, BusinessType } from "@/types";
import { BUSINESS_META, BUSINESS_WEIGHTS, METRIC_LABEL, METRIC_REASON, type MetricKey } from "./businessConfig";

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function computeBusinessScore(area: Area, type: BusinessType): number {
  const weights = BUSINESS_WEIGHTS[type];
  let total = 0;
  for (const key of Object.keys(weights) as MetricKey[]) {
    total += area[key] * (weights[key] ?? 0);
  }
  return clamp(total);
}

/** peers 중 해당 지표 기준 상위 몇 %인지 (1~100) */
function topPercent(area: Area, peers: Area[], key: MetricKey): number {
  const higher = peers.filter((p) => p[key] > area[key]).length;
  return Math.max(1, Math.round(((higher + 1) / peers.length) * 100));
}

function buildReasons(area: Area, peers: Area[], type: BusinessType): string[] {
  const weights = BUSINESS_WEIGHTS[type];
  const keys = (Object.keys(weights) as MetricKey[]).sort(
    (a, b) => area[b] * (weights[b] ?? 0) - area[a] * (weights[a] ?? 0),
  );
  const strong = keys.filter((k) => area[k] >= 70);
  const picked = (strong.length > 0 ? strong : keys.slice(0, 2)).slice(0, 3);
  return picked.map((k) => {
    if (k === "peopleScore" && area[k] >= 70) return `보행량 상위 ${topPercent(area, peers, k)}%`;
    if (k === "vehicleScore" && area[k] >= 70) return `차량 유동 상위 ${topPercent(area, peers, k)}%`;
    return area[k] >= 70 ? METRIC_REASON[k] : `${METRIC_LABEL[k]}는 보통 수준`;
  });
}

/** 적합도 높은 순으로 정렬된 업종 추천 */
export function buildBusinessInsights(area: Area, peers: Area[]): BusinessScore[] {
  return (Object.keys(BUSINESS_META) as BusinessType[])
    .map((type) => {
      const reasons = buildReasons(area, peers, type);
      return {
        type,
        label: BUSINESS_META[type].label,
        emoji: BUSINESS_META[type].emoji,
        score: computeBusinessScore(area, type),
        summary: reasons[0],
        reasons,
      };
    })
    .sort((a, b) => b.score - a.score);
}
