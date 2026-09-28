import { choices, getWorldline, TOTAL_WORLDLINES, WORLDLINE_COLOR } from '../data';
import { S } from '../data/strings';
import { useGame } from '../state/GameContext';
import { discoveredCount } from '../state/selectors';
import type { ChoiceId } from '../types/game';
import { formatWorldlineNumber } from '../utils/format';

export function WorldlineCounter({
  variant,
  onTeaserClick,
}: {
  variant: 'compact' | 'full';
  onTeaserClick?: (choiceId: ChoiceId) => void;
}) {
  const { state } = useGame();
  const p = state.progress;
  const count = discoveredCount(p);

  if (variant === 'compact') {
    const dots = Array.from({ length: TOTAL_WORLDLINES }, (_, i) => (i < count ? '◆' : '◇')).join('');
    return (
      <span className="font-mono text-xs text-muted" data-testid="worldline-counter" aria-label={`발견한 세계선 ${count}/${TOTAL_WORLDLINES}`}>
        <span className="text-accent">{dots}</span> {count}/{TOTAL_WORLDLINES}
      </span>
    );
  }

  // 발견된 것 → 번호 순, 미발견 → 선택지 순
  const discoveredSlots = choices
    .filter((c) => p.discovered[c.worldlineId])
    .sort((a, b) => (p.discovered[a.worldlineId]?.number ?? 0) - (p.discovered[b.worldlineId]?.number ?? 0));
  const undiscovered = choices.filter((c) => !p.discovered[c.worldlineId]);

  return (
    <section className="mt-10" data-testid="worldline-counter-full">
      <div className="flex items-baseline justify-between mb-3">
        <div className="t-label text-accent">{S.result.discovered}</div>
        <div className="font-mono text-lg" data-testid="discovered-count">
          {count} / {TOTAL_WORLDLINES}
        </div>
      </div>
      <div className="space-y-2">
        {discoveredSlots.map((c) => {
          const rec = p.discovered[c.worldlineId]!;
          const wl = getWorldline(c.worldlineId);
          return (
            <div key={c.id} className="card flex items-center gap-3 !py-3">
              <span style={{ color: WORLDLINE_COLOR[wl.id] }}>◆</span>
              <span className="font-mono text-xs text-muted shrink-0">{formatWorldlineNumber(rec.number).replace('WORLDLINE ', '')}</span>
              <span className="t-body-sm flex-1">{wl.name}</span>
              {wl.id === state.activeWorldlineId && <span className="t-label text-dim">NOW</span>}
            </div>
          );
        })}
        {undiscovered.map((c) => (
          <button
            key={c.id}
            type="button"
            data-testid={`slot-teaser-${c.id}`}
            onClick={() => onTeaserClick?.(c.id)}
            disabled={!onTeaserClick}
            className="pressable w-full text-left rounded-xl bg-surface px-4 py-3 flex items-center gap-3 border anim-teaser"
            style={{ borderColor: 'color-mix(in srgb, var(--c-accent) 60%, transparent)' }}
          >
            <span className="text-dim">◇</span>
            <span className="font-mono text-xs text-dim shrink-0">{S.result.unknown}</span>
            <span className="t-body-sm flex-1 text-accent">{c.teaserQuestion}</span>
            <span className="text-accent" aria-hidden>⟲</span>
          </button>
        ))}
      </div>
    </section>
  );
}
