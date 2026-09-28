import { useState } from 'react';
import { S } from '../data/strings';
import { t } from '../config/timing';
import { ScreenShell } from '../components/layout/ScreenShell';
import { Button } from '../components/ui/Button';
import { WorldlineGlyph } from '../components/WorldlineGlyph';
import { WorldlineCounter } from '../components/WorldlineCounter';
import { useGame } from '../state/GameContext';
import { discoveredCount } from '../state/selectors';
import { track } from '../utils/analytics';
import { resetProgress } from '../utils/storage';
import { TOTAL_WORLDLINES } from '../data';

export function TitleScreen() {
  const { state, dispatch } = useGame();
  const count = discoveredCount(state.progress);
  const busy = state.warp !== null;

  const begin = () => {
    track('game_started', { entry: 'begin' });
    dispatch({ type: 'BEGIN' });
  };
  const cont = () => {
    track('game_started', { entry: 'continue' });
    track('loop_started', { source: 'title', from_worldline_id: null });
    dispatch({ type: 'CONTINUE' });
  };
  const [confirmingReset, setConfirmingReset] = useState(false);
  const reset = () => {
    setConfirmingReset(false);
    track('progress_reset', { discovered_count_before: count });
    resetProgress();
    dispatch({ type: 'RESET_PROGRESS' });
  };

  return (
    <ScreenShell screenId="title" hasCTA={false} className="flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center text-center pt-16">
        <div className="t-label text-muted anim-fade-in" style={{ ['--d' as string]: `${t('screenFadeIn') * 2}ms` }}>
          {S.title.kicker}
        </div>
        <h1 className="t-display mt-4 anim-fade-in" style={{ ['--d' as string]: '600ms' }}>
          {S.title.name}
        </h1>
        <WorldlineGlyph animate className="mt-6" width={240} />
        <p className="font-serif text-base text-muted mt-6 italic">{S.title.tagline}</p>
        <p className="t-body-sm text-ink/80 mt-3 max-w-[300px]">{S.title.taglineKo}</p>

        {count > 0 && (
          <div className="mt-10 flex flex-col items-center gap-2">
            <div className="t-label text-dim">WORLDLINES DISCOVERED</div>
            <div className="text-lg">
              <WorldlineCounter variant="compact" />
            </div>
          </div>
        )}
      </div>

      <div className="pb-6 pt-10 space-y-2 anim-fade-up" style={{ ['--delay' as string]: '900ms' }}>
        {count === 0 ? (
          <Button onClick={begin} disabled={busy} data-testid="btn-begin">
            {S.title.begin}
          </Button>
        ) : (
          <>
            <Button onClick={cont} disabled={busy} data-testid="btn-continue">
              {S.title.continue}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                track('archive_opened', { source: 'title' });
                dispatch({ type: 'OPEN_ARCHIVE' });
              }}
              data-testid="btn-archive"
            >
              {S.title.archive}
            </Button>
            <div className="flex flex-col items-center pt-2">
              {confirmingReset ? (
                <div className="text-center" data-testid="reset-confirm">
                  <p className="t-caption text-muted">{S.title.resetConfirm}</p>
                  <div className="flex justify-center gap-2 mt-1">
                    <button type="button" onClick={reset} className="text-[12px] text-danger min-h-11 px-3" data-testid="btn-reset-yes">
                      {S.title.resetYes}
                    </button>
                    <button type="button" onClick={() => setConfirmingReset(false)} className="text-[12px] text-muted min-h-11 px-3">
                      {S.title.resetNo}
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirmingReset(true)} className="text-[12px] text-dim underline underline-offset-4 min-h-11 px-3" data-testid="btn-reset">
                  {S.title.reset}
                </button>
              )}
            </div>
          </>
        )}
        {count === TOTAL_WORLDLINES && <p className="text-center t-caption text-accent">ALL WORLDLINES DISCOVERED</p>}
      </div>
    </ScreenShell>
  );
}
