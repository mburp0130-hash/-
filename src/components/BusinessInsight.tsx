import type { BusinessScore } from "@/types";
import BusinessScoreCard from "./BusinessScoreCard";

export default function BusinessInsight({ insights }: { insights: BusinessScore[] | null }) {
  return (
    <section className="mt-4">
      <h3 className="mb-2 text-base font-bold">이 지역과 잘 맞는 업종</h3>
      {insights ? (
        <ol className="space-y-2">
          {insights.map((item, i) => (
            <BusinessScoreCard key={item.type} item={item} rank={i + 1} />
          ))}
        </ol>
      ) : (
        <p className="text-sm text-slate-500">분석 중...</p>
      )}
      <p className="mt-2 text-xs text-slate-400">단순 규칙 기반 점수이며 실제 매출을 예측하지 않습니다.</p>
    </section>
  );
}
