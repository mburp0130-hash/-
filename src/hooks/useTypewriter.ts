import { useEffect, useState } from 'react';

export function useTypewriter(text: string, perChar: number): string {
  const [n, setN] = useState(perChar <= 0 ? text.length : 0);
  useEffect(() => {
    if (perChar <= 0) {
      setN(text.length);
      return;
    }
    setN(0);
    const id = setInterval(() => {
      setN((x) => {
        if (x >= text.length) {
          clearInterval(id);
          return x;
        }
        return x + 1;
      });
    }, perChar);
    return () => clearInterval(id);
  }, [text, perChar]);
  return text.slice(0, n);
}
