import type { Area } from "@/types";

/**
 * 데이터 공급자 인터페이스.
 * 공공데이터(서울 열린데이터, 교통 API 등)로 교체할 때 이 인터페이스만 구현하면 된다.
 */
export interface AreaProvider {
  getAreas(): Promise<Area[]>;
  getArea(id: string): Promise<Area | null>;
}
