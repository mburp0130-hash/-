import { t } from '../config/timing';

export function SavedStamp({ text }: { text: string }) {
  return (
    <div
      data-testid="saved-stamp"
      className="inline-block anim-stamp font-mono font-bold text-xs tracking-[0.14em] text-accent border-2 border-accent rounded px-2.5 py-1"
      style={{ ['--d' as string]: `${t('stamp')}ms`, transform: 'rotate(-6deg)' }}
    >
      {text}
    </div>
  );
}
