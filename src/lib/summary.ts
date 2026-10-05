import type { Area } from "@/types";

const pad = (h: number) => String(h % 24).padStart(2, "0");

/** 3시간 이동 구간 중 평균이 가장 높은 구간의 시작 시각 */
function peakWindowStart(values: number[], size = 3): number {
  let best = 0;
  let bestSum = -1;
  for (let start = 0; start <= values.length - size; start++) {
    const sum = values.slice(start, start + size).reduce((a, b) => a + b, 0);
    if (sum > bestSum) {
      bestSum = sum;
      best = start;
    }
  }
  return best;
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** AI 없이 데이터 규칙만으로 만드는 시간대 요약 문구 */
export function buildHourlySummary(area: Area): string[] {
  const lines: string[] = [];
  const start = peakWindowStart(area.hourlyPeople);
  lines.push(`이 지역은 ${pad(start)}~${pad(start + 3)}시에 사람이 가장 많이 몰립니다.`);

  const v = area.hourlyVehicle;
  const commute = sum(v.slice(7, 10)) + sum(v.slice(17, 20));
  if (commute / sum(v) >= 0.3) {
    lines.push("차량 유동은 출퇴근 시간에 집중됩니다.");
  } else {
    const vs = peakWindowStart(v);
    lines.push(`차량 유동은 ${pad(vs)}~${pad(vs + 3)}시에 가장 많습니다.`);
  }
  return lines;
}
