import { LEVEL_META, getScoreLevel } from "@/lib/scores";

export default function AreaScore({ label, score, big }: { label: string; score: number; big?: boolean }) {
  const color = LEVEL_META[getScoreLevel(score)].color;
  return (
    <div className="flex items-center gap-3">
      <span className={`w-10 shrink-0 text-slate-500 ${big ? "text-base" : "text-sm"}`}>{label}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="w-8 text-right text-sm font-bold tabular-nums">{score}</span>
    </div>
  );
}
