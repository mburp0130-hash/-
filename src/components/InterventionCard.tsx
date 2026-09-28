import { S } from '../data/strings';
import type { LabeledText } from '../types/game';
import { LabelBadge } from './ui/LabelBadge';

export function InterventionCard({ intervention }: { intervention: LabeledText | null }) {
  if (!intervention) {
    return (
      <div className="card mb-3" data-testid="intervention-card">
        <p className="t-body-sm text-muted">◎ {S.timeline.observing}</p>
      </div>
    );
  }
  return (
    <div className="card-strong mb-3" data-testid="intervention-card">
      <div className="mb-1.5">
        <LabelBadge label={intervention.label} />
      </div>
      <p className="t-body-sm">✦ {intervention.text}</p>
    </div>
  );
}
