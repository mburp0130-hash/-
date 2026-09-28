import { t } from '../config/timing';
import { S } from '../data/strings';
import type { Category, Era, LabeledText } from '../types/game';
import { InterventionCard } from './InterventionCard';
import { LabelBadge } from './ui/LabelBadge';

const ICON: Record<Category, string> = {
  politics: '⚖',
  trade: '⚓',
  technology: '⚙',
  culture: '✦',
  powers: '♜',
};

export function EraCard({
  era,
  intervention,
  showIntervention,
}: {
  era: Era;
  intervention: LabeledText | null;
  showIntervention: boolean;
}) {
  const stagger = t('entryStagger');
  const cardIn = t('eraCardIn');
  return (
    <div data-testid={`era-card-${era.year}`}>
      {showIntervention && <InterventionCard intervention={intervention} />}
      <div className="card anim-fade-up" style={{ ['--d' as string]: `${cardIn}ms`, ['--dy' as string]: '16px' }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="t-label text-dim">ERA {era.year}</span>
          <LabelBadge label={era.headline.label} />
        </div>
        <h2 className="t-h2 mb-3" data-testid="era-headline">{era.headline.text}</h2>
        <ul className="space-y-3">
          {era.entries.map((e, i) => (
            <li
              key={e.text}
              className="anim-slide-in"
              style={{ ['--delay' as string]: `${cardIn + i * stagger}ms` }}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-muted text-sm w-4 text-center" aria-hidden>{ICON[e.category]}</span>
                <span className="text-[11px] text-dim">{S.timeline.categories[e.category]}</span>
                <LabelBadge label={e.label} />
              </div>
              <p className="t-body-sm pl-6">{e.text}</p>
            </li>
          ))}
        </ul>
        {era.originalHistory && (
          <div
            className="mt-4 pt-3 border-t border-line anim-fade-in"
            style={{ ['--to' as string]: 0.85, ['--delay' as string]: `${cardIn + era.entries.length * stagger + 200}ms` }}
            data-testid="era-original"
          >
            <div className="flex items-center gap-2 mb-0.5">
              <span className="t-label-ko text-dim">{S.timeline.originalHistory}</span>
              <LabelBadge label={era.originalHistory.label} />
            </div>
            <p className="t-caption text-muted">{era.originalHistory.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}
