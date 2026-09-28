import { useEffect, useRef, useState } from 'react';
import { easeOutCubic } from '../utils/easing';

/** from → to 정수 보간 (rAF). duration 0이면 즉시 to. */
export function useCountUp(
  from: number,
  to: number,
  duration: number,
  easing: (x: number) => number = easeOutCubic,
  onDone?: () => void,
): number {
  const [value, setValue] = useState(duration <= 0 ? to : from);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (duration <= 0 || from === to) {
      setValue(to);
      const id = setTimeout(() => doneRef.current?.(), 0);
      return () => clearTimeout(id);
    }
    let raf = 0;
    const start = performance.now();
    setValue(from);
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setValue(Math.round(from + (to - from) * easing(p)));
      if (p < 1) raf = requestAnimationFrame(step);
      else doneRef.current?.();
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [from, to, duration, easing]);

  return value;
}
