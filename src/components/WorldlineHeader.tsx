import { S } from '../data/strings';
import type { Choice, HistoricalEvent, Worldline } from '../types/game';
import { formatWorldlineNumber } from '../utils/format';
import { SavedStamp } from './SavedStamp';
import { LabelBadge } from './ui/LabelBadge';

export function WorldlineHeader({
  number,
  worldline,
  choice,
  event,
  stamp,
  color,
}: {
  number: number;
  worldline: Worldline;
  choice: Choice;
  event: HistoricalEvent;
  stamp: 'saved' | 'revisited' | null;
  color: string;
}) {
  const n = formatWorldlineNumber(number);
  return (
    <section className="pt-2">
      <div className="h-8">
        {stamp && <SavedStamp text={stamp === 'saved' ? S.result.saved(n) : S.result.revisited(n)} />}
      </div>
      <div className="t-wl-no mt-3" style={{ color }} data-testid="worldline-number">
        {n}
      </div>
      <div className="font-serif text-[22px] mt-2 leading-tight">{worldline.nameEn}</div>
      <div className="t-h2 mt-1" data-testid="worldline-name">{worldline.name}</div>
      <p className="t-body-sm text-muted mt-2">“{worldline.tagline}”</p>

      <div className="card mt-5">
        <div className="t-label-ko text-dim mb-2">{worldline.isOrigin ? S.result.observedEvent : S.result.changedEvent}</div>
        <div className="font-mono text-sm">
          {event.dateLabel} · {event.place}
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="t-body font-bold">
            {choice.kind === 'observation' ? '◎' : '✦'} {choice.title}
          </span>
          {!worldline.isOrigin && <LabelBadge label="player_intervention" />}
        </div>
      </div>
    </section>
  );
}
