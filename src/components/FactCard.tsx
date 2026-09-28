import { S } from '../data/strings';
import type { LabeledText } from '../types/game';
import { LabelBadge, SubBadge } from './ui/LabelBadge';

export function FactCard({
  fact,
  index,
  emphasis,
  title,
  delay = 0,
}: {
  fact: LabeledText;
  index?: number;
  emphasis?: 'outcome';
  title?: string;
  delay?: number;
}) {
  return (
    <div
      className="card anim-fade-up"
      style={{
        ['--delay' as string]: `${delay}ms`,
        ...(emphasis === 'outcome' ? { borderLeft: '3px solid var(--c-danger)' } : {}),
      }}
      data-testid={emphasis === 'outcome' ? 'fact-outcome' : 'fact-card'}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`${title ? 't-label-ko' : 't-label'} text-dim`}>{title ?? `RECORD ${String((index ?? 0) + 1).padStart(2, '0')}`}</span>
        <LabelBadge label={fact.label} />
        {fact.certainty === 'estimate' && <SubBadge text={S.context.estimate} />}
        {fact.certainty === 'disputed' && <SubBadge text={S.context.disputed} />}
      </div>
      <p className="t-body-sm">{fact.text}</p>
    </div>
  );
}
