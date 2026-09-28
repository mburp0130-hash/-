import { t } from '../config/timing';
import { event } from '../data';
import { S } from '../data/strings';
import { HistoricalEventCard } from '../components/HistoricalEventCard';
import { ScreenShell } from '../components/layout/ScreenShell';
import { useAutoAdvance } from '../hooks/useAutoAdvance';
import { useOnce } from '../hooks/useOnce';
import { useGame } from '../state/GameContext';
import { track } from '../utils/analytics';

export function EventScreen() {
  const { dispatch } = useGame();
  useOnce(() => track('event_viewed'));
  const done = () => dispatch({ type: 'EVENT_DONE' });
  useAutoAdvance({ enabled: true, duration: t('eventAutoAdvance'), resetKey: 'event', onFire: done });

  return (
    <ScreenShell screenId="event" hasCTA={false} onClick={done} className="flex flex-col cursor-pointer">
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80dvh]">
        <HistoricalEventCard event={event} />
      </div>
      <p className="t-caption text-dim text-center pb-6" data-testid="event-tap">
        {S.event.tapToContinue}
      </p>
    </ScreenShell>
  );
}
