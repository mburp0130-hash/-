import type { BusinessType } from "@/types";

export type MetricKey =
  | "peopleScore"
  | "vehicleScore"
  | "daytimeScore"
  | "eveningScore"
  | "nightScore"
  | "weekendScore";

export const BUSINESS_META: Record<BusinessType, { label: string; emoji: string }> = {
  cafe: { label: "카페", emoji: "☕" },
  restaurant: { label: "음식점", emoji: "🍽️" },
  convenience: { label: "편의점", emoji: "🏪" },
  carwash: { label: "세차장", emoji: "🚗" },
  drivethru: { label: "드라이브스루", emoji: "🍔" },
};

/** 업종별 가중치 (각 업종 합계 = 1) */
export const BUSINESS_WEIGHTS: Record<BusinessType, Partial<Record<MetricKey, number>>> = {
  cafe: { peopleScore: 0.55, vehicleScore: 0.15, eveningScore: 0.15, weekendScore: 0.15 },
  restaurant: { peopleScore: 0.5, eveningScore: 0.35, vehicleScore: 0.15 },
  convenience: { peopleScore: 0.45, vehicleScore: 0.25, nightScore: 0.3 },
  carwash: { vehicleScore: 0.7, daytimeScore: 0.15, weekendScore: 0.15 },
  drivethru: { vehicleScore: 0.6, daytimeScore: 0.2, peopleScore: 0.2 },
};

export const METRIC_REASON: Record<MetricKey, string> = {
  peopleScore: "보행량이 많음",
  vehicleScore: "차량 통행이 많음",
  daytimeScore: "낮 시간 유동 높음",
  eveningScore: "저녁 유동 높음",
  nightScore: "야간 유동 안정적",
  weekendScore: "주말 방문 증가",
};

export const METRIC_LABEL: Record<MetricKey, string> = {
  peopleScore: "보행량",
  vehicleScore: "차량 유동",
  daytimeScore: "낮 유동",
  eveningScore: "저녁 유동",
  nightScore: "야간 유동",
  weekendScore: "주말 방문",
};
