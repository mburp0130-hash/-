import type { AreaProvider } from "./providers/types";
import { mockProvider } from "./providers/mockProvider";
import type { TrendingItem } from "@/types";

/** 현재 사용 중인 데이터 공급자. 추후 SeoulOpenDataProvider 등으로 교체. */
export const provider: AreaProvider = mockProvider;

export async function getTrending(limit = 5): Promise<TrendingItem[]> {
  const areas = await provider.getAreas();
  return [...areas]
    .sort((a, b) => b.trend - a.trend)
    .slice(0, limit)
    .map((a, i) => ({
      rank: i + 1,
      id: a.id,
      name: a.name,
      trend: a.trend,
      activityScore: a.activityScore,
      lat: a.lat,
      lng: a.lng,
    }));
}
