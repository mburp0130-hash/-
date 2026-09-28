import { useState } from 'react';
import { t } from '../config/timing';
import { event } from '../data';
import { S } from '../data/strings';
import { FactCard } from '../components/FactCard';
import { LabelLegendSheet } from '../components/LabelLegendSheet';
import { ScreenShell } from '../components/layout/ScreenShell';
import { StickyCTA } from '../components/layout/StickyCTA';
import { TopBar } from '../components/layout/TopBar';
import { useOnce } from '../hooks/useOnce';
import { useGame } from '../state/GameContext';
import { track } from '../utils/analytics';

export function InfoButton({ onClick, screen }: { onClick: () => void; screen: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        track('legend_opened', { screen });
        onClick();
      }}
      className="pressable w-8 h-8 rounded-full border border-line text-muted text-sm"
      aria-label="기록의 종류 보기"
      data-testid="btn-legend"
    >
      i
    </button>
  );
}

export function ContextScreen() {
  const { dispatch } = useGame();
  const [legend, setLegend] = useState(false);
  useOnce(() => track('context_viewed'));
  const stagger = t('factStagger');

  return (
    <ScreenShell
      screenId="context"
      topBar={<TopBar left={`${event.dateLabel} · ${event.place.toUpperCase()}`} right={<InfoButton onClick={() => setLegend(true)} screen="context" />} />}
    >
      <div className="t-label text-accent mt-4">{S.context.kicker}</div>
      <h1 className="t-h1 mt-1 mb-5">{S.context.title}</h1>
      <div className="space-y-3">
        {event.contextFacts.map((f, i) => (
          <FactCard key={f.text} fact={f} index={i} delay={i * stagger} />
        ))}
        <FactCard
          fact={event.originalOutcome}
          emphasis="outcome"
          title={S.context.outcomeTitle}
          delay={event.contextFacts.length * stagger}
        />
      </div>
      <StickyCTA primary={{ label: S.context.cta, onClick: () => dispatch({ type: 'CONTEXT_DONE' }), testId: 'btn-to-choice' }} />
      <LabelLegendSheet open={legend} onClose={() => setLegend(false)} />
    </ScreenShell>
  );
}
