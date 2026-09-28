import { S } from '../data/strings';
import type { Choice, TravelerNote } from '../types/game';
import { formatWorldlineNumber } from '../utils/format';

export function ChoiceCard({
  choice,
  selected,
  dimmed,
  discoveredNumber,
  notes,
  onSelect,
}: {
  choice: Choice;
  selected: boolean;
  dimmed: boolean;
  discoveredNumber?: number;
  notes: TravelerNote[];
  onSelect: () => void;
}) {
  const discovered = discoveredNumber !== undefined;
  const opacity = dimmed ? 0.45 : discovered && !selected ? 0.85 : 1;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      data-testid={`choice-${choice.id}`}
      onClick={onSelect}
      className={`pressable w-full text-left rounded-xl p-4 transition-all duration-200 ${
        selected ? 'bg-surface-2' : 'bg-surface'
      }`}
      style={{
        border: selected ? '2px solid var(--c-accent)' : '1px solid var(--c-border)',
        transform: selected ? 'scale(1.02)' : undefined,
        opacity,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-accent text-lg leading-6 shrink-0 w-5 text-center" aria-hidden>
            {choice.kind === 'observation' ? '◎' : '✦'}
          </span>
          <span className="t-label text-dim truncate">{choice.titleEn}</span>
        </div>
        {discovered ? (
          <span className="shrink-0 font-mono text-[10px] tracking-wider text-muted border border-line rounded px-1.5 py-0.5">
            {S.choice.discoveredBadge(formatWorldlineNumber(discoveredNumber))}
          </span>
        ) : (
          <span className="shrink-0 t-label !text-[10px] text-bg bg-accent rounded px-1.5 py-0.5">{S.choice.newBadge}</span>
        )}
      </div>
      <div className="pl-8 mt-1">
        <div className="t-body font-bold">{choice.title}</div>
        <div className="t-caption text-muted mt-1">{choice.summary}</div>
      </div>
      {selected && <p className="t-body-sm mt-3 pl-8 text-ink/90 anim-fade-in">{choice.detail}</p>}
      {notes.length > 0 && (
        <div className="mt-3 pl-8 space-y-1" data-testid={`note-${choice.id}`}>
          {notes.slice(0, 2).map((n) => (
            <p key={n.text} className="t-caption italic" style={{ color: 'color-mix(in srgb, var(--c-accent) 75%, var(--c-text-muted))' }}>
              <span className="t-label not-italic mr-1.5">{S.choice.note}</span>
              {n.text}
            </p>
          ))}
        </div>
      )}
    </button>
  );
}
