import { useCallback, useEffect, useRef, useState } from 'react';
import { t } from '../config/timing';
import { getWorldline, WORLDLINE_COLOR } from '../data';
import { S } from '../data/strings';
import { EraCard } from '../components/EraCard';
import { ScreenShell } from '../components/layout/ScreenShell';
import { StickyCTA } from '../components/layout/StickyCTA';
import { TopBar } from '../components/layout/TopBar';
import { TimelineRail } from '../components/TimelineRail';
import { YearDisplay } from '../components/YearDisplay';
import { useAutoAdvance } from '../hooks/useAutoAdvance';
import { useOnce } from '../hooks/useOnce';
import { useGame } from '../state/GameContext';
import { LAST_ERA_INDEX } from '../state/gameReducer';
import { displayNumber } from '../state/selectors';
import { track } from '../utils/analytics';
import { formatWorldlineNumber } from '../utils/format';

export function TimelineScreen() {
  const { state, dispatch } = useGame();
  const wl = getWorldline(state.activeWorldlineId!);
  const color = WORLDLINE_COLOR[wl.id];
  const idx = state.timelineIndex;
  const era = wl.timeline[idx];
  const isLast = idx === LAST_ERA_INDEX;

  const [shownYear, setShownYear] = useState<number>(era.year);
  const rolled = shownYear === era.year;
  const [paused, setPaused] = useState(false);
  const viaRef = useRef<'auto' | 'tap' | 'initial'>('initial');
  const skippedRef = useRef(false);
  const startedRef = useRef(performance.now());
  const trackedYearRef = useRef<number | null>(null);

  useOnce(() => track('timeline_started', { worldline_id: wl.id }));

  useEffect(() => {
    if (trackedYearRef.current !== era.year) {
      trackedYearRef.current = era.year;
      track('timeline_era_viewed', { worldline_id: wl.id, year: era.year, via: viaRef.current });
    }
  }, [era.year, wl.id]);

  const eraYear = era.year;
  const onRolled = useCallback(() => setShownYear(eraYear), [eraYear]);

  // 카드 등장(entries stagger 포함)이 끝난 뒤부터 자동 진행 타이머
  const revealMs = t('eraCardIn') + era.entries.length * t('entryStagger');
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    setRevealed(false);
    if (!rolled) return;
    const id = setTimeout(() => setRevealed(true), revealMs);
    return () => clearTimeout(id);
  }, [rolled, revealMs, idx]);

  const next = (via: 'auto' | 'tap') => {
    if (isLast) return;
    viaRef.current = via;
    dispatch({ type: 'TIMELINE_NEXT' });
  };

  const autoDuration = t('eraAutoAdvance');
  useAutoAdvance({
    enabled: revealed && !isLast,
    duration: autoDuration,
    paused,
    resetKey: idx,
    onFire: () => next('auto'),
  });

  const skip = () => {
    skippedRef.current = true;
    track('timeline_skipped', { worldline_id: wl.id, from_year: era.year });
    viaRef.current = 'tap';
    dispatch({ type: 'TIMELINE_SKIP' });
  };

  const done = () => {
    track('timeline_completed', {
      worldline_id: wl.id,
      duration_ms: Math.round(performance.now() - startedRef.current),
      skipped: skippedRef.current,
    });
    dispatch({ type: 'TIMELINE_DONE' });
  };

  const number = formatWorldlineNumber(displayNumber(state.progress, wl.id));

  return (
    <ScreenShell
      screenId="timeline"
      topBar={
        <TopBar
          left={<span style={{ color }}>{number}</span>}
          right={
            !isLast ? (
              <button type="button" onClick={skip} className="t-label text-muted min-h-11 px-2" data-testid="btn-timeline-skip">
                {S.timeline.skip}
              </button>
            ) : undefined
          }
          showCounter={false}
        />
      }
    >
      <TimelineRail eras={wl.timeline} currentIndex={idx} color={color} />
      <div className="mt-2 mb-4">
        <YearDisplay year={era.year} fromYear={shownYear} duration={rolled ? 0 : t('yearRoll')} onDone={onRolled} />
      </div>
      <div
        onPointerDown={() => setPaused(true)}
        onPointerUp={() => setPaused(false)}
        onPointerLeave={() => setPaused(false)}
        onPointerCancel={() => setPaused(false)}
        className="min-h-[200px]"
      >
        {rolled && <EraCard key={era.year} era={era} intervention={wl.intervention} showIntervention={idx === 0} />}
      </div>
      <StickyCTA
        primary={
          isLast
            ? { label: S.timeline.toButterfly, onClick: done, testId: 'btn-timeline-next', disabled: !rolled }
            : { label: `${S.timeline.next} ▶`, onClick: () => next('tap'), testId: 'btn-timeline-next' }
        }
        progress={revealed && !isLast ? { key: idx, duration: autoDuration, paused } : null}
      />
    </ScreenShell>
  );
}
