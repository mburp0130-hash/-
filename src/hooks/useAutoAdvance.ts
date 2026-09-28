import { useEffect, useRef, useState } from 'react';

/**
 * 일시정지 가능한 타이머. enabled가 true가 되면 duration 후 onFire 호출.
 * resetKey가 바뀌면 처음부터 다시 시작한다.
 */
export function useAutoAdvance(opts: {
  enabled: boolean;
  duration: number;
  paused?: boolean;
  resetKey: unknown;
  onFire: () => void;
}): { startedAt: number | null } {
  const { enabled, duration, paused = false, resetKey, onFire } = opts;
  const fireRef = useRef(onFire);
  fireRef.current = onFire;
  const remainingRef = useRef(duration);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  useEffect(() => {
    remainingRef.current = duration;
    setStartedAt(null);
  }, [resetKey, duration]);

  useEffect(() => {
    if (!enabled || paused) return;
    const began = performance.now();
    setStartedAt(began);
    const id = setTimeout(() => fireRef.current(), remainingRef.current);
    return () => {
      clearTimeout(id);
      remainingRef.current = Math.max(0, remainingRef.current - (performance.now() - began));
    };
  }, [enabled, paused, resetKey]);

  return { startedAt };
}
