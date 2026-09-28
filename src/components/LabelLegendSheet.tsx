import { event } from '../data';
import { S } from '../data/strings';
import type { EpistemicLabel } from '../types/game';
import { BottomSheet } from './ui/BottomSheet';
import { LabelBadge } from './ui/LabelBadge';

const LABELS: EpistemicLabel[] = ['historical_fact', 'player_intervention', 'simulated_consequence', 'speculative_outcome'];

export function LabelLegendSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <BottomSheet open={open} onClose={onClose} title={S.legend.title} closeLabel={S.legend.close}>
      <ul className="space-y-3">
        {LABELS.map((l) => (
          <li key={l} className="flex flex-col gap-1">
            <div>
              <LabelBadge label={l} />
            </div>
            <p className="t-caption text-ink/85">{S.legend[l]}</p>
          </li>
        ))}
      </ul>
      <h3 className="t-label text-accent mt-6 mb-2">{S.legend.sourcesTitle}</h3>
      <ul className="space-y-2 list-disc pl-4">
        {event.sourcesNote.map((n) => (
          <li key={n} className="t-caption text-muted">
            {n}
          </li>
        ))}
      </ul>
    </BottomSheet>
  );
}
