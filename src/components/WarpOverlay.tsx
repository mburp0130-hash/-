import { useCallback, useEffect, useState } from 'react';
import { t } from '../config/timing';
import { S } from '../data/strings';
import { useCountUp } from '../hooks/useCountUp';
import type { WarpState } from '../types/game';
import { easeInOutCubic } from '../utils/easing';

/** 시간 이동 오버레이 (명세 §E-3, §K-2) */
export function WarpOverlay({ warp, onDone }: { warp: WarpState; onDone: () => void }) {
  const duration = t(warp.mode === 'forward' ? 'warpForward' : 'warpRewind');
  const [phase, setPhase] = useState<'count' | 'arrive' | 'fade'>('count');
  const onCounted = useCallback(() => setPhase('arrive'), []);
  const year = useCountUp(warp.fromYear, warp.toYear, duration, easeInOutCubic, onCounted);

  useEffect(() => {
    if (phase === 'arrive') {
      const id = setTimeout(() => setPhase('fade'), t('warpArrivePulse'));
      return () => clearTimeout(id);
    }
    if (phase === 'fade') {
      const id = setTimeout(onDone, t('warpFadeOut'));
      return () => clearTimeout(id);
    }
  }, [phase, onDone]);

  return (
    <div
      data-testid="warp-overlay"
      className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center overflow-hidden"
      style={{
        opacity: phase === 'fade' ? 0 : 1,
        transition: `opacity ${t('warpFadeOut')}ms ease-out`,
      }}
    >
      <div className="scanline" />
      <div
        className={`t-year-xl text-accent ${phase !== 'count' ? 'anim-arrive' : ''}`}
        style={{ ['--d' as string]: `${t('warpArrivePulse')}ms` }}
        aria-live="polite"
      >
        {year}
      </div>
      <div className="t-label text-muted mt-4">{warp.mode === 'forward' ? S.warp.forward : S.warp.rewind}</div>
    </div>
  );
}
