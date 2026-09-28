import { t } from '../config/timing';
import { useTypewriter } from '../hooks/useTypewriter';
import type { HistoricalEvent } from '../types/game';
import { LabelBadge } from './ui/LabelBadge';

export function HistoricalEventCard({ event }: { event: HistoricalEvent }) {
  const date = useTypewriter(event.dateLabel, t('typewriterPerChar'));
  return (
    <div className="flex flex-col items-center text-center">
      <div className="font-mono text-[40px] leading-none text-accent min-h-[40px]" data-testid="event-date">
        {date}
        <span className="opacity-0">{event.dateLabel.slice(date.length)}</span>
      </div>
      <div className="mt-6 font-serif text-[28px] leading-tight">{event.place}</div>
      <div className="t-body-sm text-muted mt-1">{event.placeKo}</div>
      <div className="t-label text-dim mt-8">{event.titleEn}</div>
      <div className="t-h2 mt-2">{event.title}</div>
      <p className="t-body text-ink/90 mt-6 max-w-[320px]">
        {event.arrivalLine} <LabelBadge label="historical_fact" />
      </p>
    </div>
  );
}
