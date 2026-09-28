import { createPortal } from 'react-dom';
import { useEffect, type ReactNode } from 'react';
import { t } from '../../config/timing';

export function BottomSheet({
  open,
  onClose,
  title,
  closeLabel,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50" data-testid="bottom-sheet">
      <div className="absolute inset-0 bg-black/60 anim-fade-in" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute inset-x-0 bottom-0 mx-auto max-w-[440px] max-h-[80dvh] overflow-y-auto rounded-t-2xl bg-surface-2 border-t border-line px-5 pt-5 anim-sheet"
        style={{ ['--d' as string]: `${t('sheet')}ms`, paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="t-h2">{title}</h2>
          <button type="button" className="pressable min-h-11 px-3 text-muted t-body-sm" onClick={onClose} data-testid="btn-sheet-close">
            {closeLabel}
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
