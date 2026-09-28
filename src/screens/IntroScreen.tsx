import { useRef, useState } from 'react';
import { t } from '../config/timing';
import { S } from '../data/strings';
import { ScreenShell } from '../components/layout/ScreenShell';
import { StickyCTA } from '../components/layout/StickyCTA';
import { WorldlineGlyph } from '../components/WorldlineGlyph';
import { useGame } from '../state/GameContext';
import { track } from '../utils/analytics';

export function IntroScreen() {
  const { state, dispatch } = useGame();
  const [idx, setIdx] = useState(0);
  const startedAt = useRef(performance.now());
  const swipeX = useRef<number | null>(null);
  const cards = S.intro.cards;
  const last = idx === cards.length - 1;
  const busy = state.warp !== null;

  const next = () => setIdx((i) => Math.min(cards.length - 1, i + 1));
  const prev = () => setIdx((i) => Math.max(0, i - 1));

  const go = () => {
    if (busy) return;
    track('intro_completed', { duration_ms: Math.round(performance.now() - startedAt.current) });
    dispatch({ type: 'INTRO_DONE', skipped: false });
  };
  const skip = () => {
    if (busy) return;
    track('intro_skipped', { at_card: idx + 1 });
    dispatch({ type: 'INTRO_DONE', skipped: true });
  };

  const card = cards[idx];
  return (
    <ScreenShell
      screenId="intro"
      topBar={
        <header className="h-12 flex items-center justify-between">
          <div className="flex gap-1.5" aria-label={`${idx + 1} / ${cards.length}`}>
            {cards.map((_, i) => (
              <span key={i} className={`w-2 h-2 rounded-full ${i === idx ? 'bg-accent' : 'bg-line'}`} />
            ))}
          </div>
          <button type="button" onClick={skip} className="t-label text-muted min-h-11 px-2" data-testid="btn-intro-skip">
            {S.intro.skip}
          </button>
        </header>
      }
    >
      <div
        className="min-h-[60dvh] flex flex-col items-center justify-center text-center select-none"
        onClick={() => !last && next()}
        onPointerDown={(e) => (swipeX.current = e.clientX)}
        onPointerUp={(e) => {
          if (swipeX.current === null) return;
          const dx = e.clientX - swipeX.current;
          swipeX.current = null;
          if (dx < -50) next();
          else if (dx > 50) prev();
        }}
        data-testid="intro-card"
      >
        <div key={idx} className="anim-fade-up flex flex-col items-center" style={{ ['--d' as string]: `${t('screenFadeIn')}ms` }}>
          <div className="h-24 flex items-center justify-center mb-8">
            {idx === 0 && <div className="t-year-lg text-accent">2026</div>}
            {idx === 1 && <WorldlineGlyph animate width={220} />}
            {idx === 2 && <div className="font-mono text-3xl text-accent tracking-[0.5em]">◇◇◇</div>}
          </div>
          <h1 className="t-h1 text-[26px]">{card.big}</h1>
          <p className="t-body text-muted mt-4 max-w-[300px]">{card.small}</p>
        </div>
      </div>
      <StickyCTA
        primary={
          last
            ? { label: S.intro.go, onClick: go, testId: 'btn-intro-go', disabled: busy }
            : { label: S.intro.next, onClick: next, testId: 'btn-intro-next' }
        }
      />
    </ScreenShell>
  );
}
