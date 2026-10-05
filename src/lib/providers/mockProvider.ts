import { MOCK_AREAS } from "@/data/mockAreas";
import { withActivity } from "@/lib/scores";
import type { AreaProvider } from "./types";

export const mockProvider: AreaProvider = {
  async getAreas() {
    return MOCK_AREAS.map(withActivity);
  },
  async getArea(id) {
    const record = MOCK_AREAS.find((a) => a.id === id);
    return record ? withActivity(record) : null;
  },
};
