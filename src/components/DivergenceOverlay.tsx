import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import { t } from '../config/timing';
import { S } from '../data/strings';
import { formatWorldlineNumber } from '../utils/format';
import { WorldlineGlyph } from './WorldlineGlyph';

export function DivergenceOverlay({
  worldlineNumber,
  isOrigin,
  color,
  onDone,
}: {
  worldlineNumber: number;
  isOrigin: boolean;
  color: string;
  onDone: () => void;
}) {
  const total = t('divergenceDraw') + t('divergenceText');
  useEffect(() => {
    const id = setTimeout(onDone, total);
    return () => clearTimeout(id);
  }, [onDone, total]);

  const n = formatWorldlineNumber(worldlineNumber);
  return createPortal(
    <div
      data-testid="divergence-overlay"
      className="fixed inset-0 z-[55] bg-bg/90 flex flex-col items-center justify-center px-8"
    >
      <WorldlineGlyph diverged={!isOrigin} color={color} animate width={280} />
      <div
        className="t-label mt-6 anim-fade-in"
        style={{ color: isOrigin ? 'var(--c-text-muted)' : 'var(--c-accent)', ['--delay' as string]: `${t('divergenceDraw')}ms`, ['--d' as string]: `${t('divergenceText')}ms` }}
      >
        {isOrigin ? S.choice.observing(n) : S.choice.diverged(n)}
      </div>
    </div>,
    document.body,
  );
}
