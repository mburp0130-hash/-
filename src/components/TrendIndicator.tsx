import { TREND_META, formatTrend, getTrendLevel } from "@/lib/scores";

export default function TrendIndicator({ trend }: { trend: number }) {
  const meta = TREND_META[getTrendLevel(trend)];
  return (
    <span className={`font-semibold ${meta.className}`}>
      {meta.arrow} {meta.label}
    </span>
  );
}

export function TrendPercent({ trend }: { trend: number }) {
  return <span>평소보다 {formatTrend(trend)}</span>;
}
