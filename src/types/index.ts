export type Layer = "people" | "vehicle" | "total";

export type BusinessType = "cafe" | "restaurant" | "convenience" | "carwash" | "drivethru";

export type ScoreLevel = "veryQuiet" | "quiet" | "normal" | "busy" | "veryBusy";

export type TrendLevel = "surgeUp" | "up" | "flat" | "down" | "surgeDown";

/** 시간대별(0~23시) 점수 배열 길이는 항상 24 */
export type Hourly = number[];

/** 저장되는 원본 지역 데이터 (activityScore 제외: 런타임 계산) */
export interface AreaRecord {
  id: string;
  name: string;
  lat: number;
  lng: number;

  peopleScore: number;
  vehicleScore: number;

  /** 평소 대비 변화율(%) */
  trend: number;

  hourlyPeople: Hourly;
  hourlyVehicle: Hourly;

  daytimeScore: number;
  eveningScore: number;
  nightScore: number;
  weekendScore: number;

  /** 차량 통행량 / 정체 정도 — 향후 분리용 (UI는 vehicleScore 하나만 사용) */
  trafficVolume: number;
  trafficCongestion: number;

  description: string;
}

export interface Area extends AreaRecord {
  activityScore: number;
}

export interface BusinessScore {
  type: BusinessType;
  label: string;
  emoji: string;
  score: number;
  summary: string;
  reasons: string[];
}

export interface AreaDetail {
  area: Area;
  insights: BusinessScore[];
}

export interface TrendingItem {
  rank: number;
  id: string;
  name: string;
  trend: number;
  activityScore: number;
  lat: number;
  lng: number;
}
