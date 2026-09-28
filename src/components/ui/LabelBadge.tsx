import type { EpistemicLabel } from '../../types/game';

const MAP: Record<EpistemicLabel, { text: string; color: string; aria: string; dashed?: boolean }> = {
  historical_fact: { text: 'FACT', color: 'var(--c-fact)', aria: '실제 역사' },
  player_intervention: { text: 'INTERVENTION', color: 'var(--c-intervention)', aria: '플레이어의 개입' },
  simulated_consequence: { text: 'SIMULATED', color: 'var(--c-simulated)', aria: '게임 내 시뮬레이션 결과' },
  speculative_outcome: { text: 'SPECULATIVE', color: 'var(--c-speculative)', aria: '추정된 대체역사', dashed: true },
};

export function LabelBadge({ label, className = '' }: { label: EpistemicLabel; className?: string }) {
  const m = MAP[label];
  return (
    <span
      role="img"
      aria-label={m.aria}
      data-label={label}
      className={`inline-flex items-center shrink-0 h-[18px] px-1.5 rounded font-mono text-[10px] font-semibold uppercase tracking-[0.08em] align-middle ${className}`}
      style={{
        color: m.color,
        background: `color-mix(in srgb, ${m.color} 12%, transparent)`,
        border: `1px ${m.dashed ? 'dashed' : 'solid'} color-mix(in srgb, ${m.color} 40%, transparent)`,
      }}
    >
      {m.text}
    </span>
  );
}

export function SubBadge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center h-[18px] px-1.5 rounded text-[10px] text-muted border border-line align-middle">
      {text}
    </span>
  );
}
