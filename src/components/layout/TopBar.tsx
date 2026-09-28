import type { ReactNode } from 'react';
import { WorldlineCounter } from '../WorldlineCounter';

export function TopBar({ left, right, showCounter = true }: { left: ReactNode; right?: ReactNode; showCounter?: boolean }) {
  return (
    <header className="h-12 flex items-center justify-between gap-3">
      <div className="t-label text-muted truncate">{left}</div>
      <div className="flex items-center gap-2 shrink-0">
        {right}
        {showCounter && <WorldlineCounter variant="compact" />}
      </div>
    </header>
  );
}
