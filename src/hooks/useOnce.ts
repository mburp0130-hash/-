import { useEffect, useRef } from 'react';

/** 마운트 시 1회만 실행 (StrictMode 이중 마운트 방지) */
export function useOnce(fn: () => void) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
