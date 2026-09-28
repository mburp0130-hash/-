import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/Button';

export interface CTAAction {
  label: string;
  onClick: () => void;
  testId: string;
  disabled?: boolean;
}

export function StickyCTA({
  primary,
  secondary,
  nudge,
  progress,
}: {
  primary: CTAAction;
  secondary?: CTAAction;
  nudge?: string;
  /** 자동 진행 진행바: key가 바뀔 때마다 다시 시작, duration ms, paused */
  progress?: { key: string | number; duration: number; paused?: boolean } | null;
}) {
  const primaryRef = useRef(primary);
  primaryRef.current = primary;

  // 데스크톱: 포커스가 없을 때 Enter/Space = Primary
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const active = document.activeElement;
      if (active && active !== document.body) return;
      if (document.querySelector('[role="dialog"]')) return;
      const p = primaryRef.current;
      if (p.disabled) return;
      e.preventDefault();
      p.onClick();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // 화면 진입 애니메이션(transform)의 영향을 받지 않도록 body에 포털로 렌더
  return createPortal(
    <div
      className="fixed inset-x-0 bottom-0 z-30 pointer-events-none"
      style={{
        paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
        background: 'linear-gradient(to top, var(--c-bg) calc(100% - 28px), transparent)',
      }}
    >
      <div className="mx-auto max-w-[440px] px-5 pt-7 pointer-events-auto">
        {nudge && <p className="t-caption text-accent text-center mb-2" data-testid="cta-nudge">{nudge}</p>}
        <div className="relative">
          <Button
            variant="primary"
            onClick={primary.onClick}
            disabled={primary.disabled}
            data-testid={primary.testId}
          >
            {primary.label}
          </Button>
          {progress && progress.duration > 0 && (
            <div className="absolute left-2 right-2 -bottom-1.5 h-0.5 bg-line rounded overflow-hidden" aria-hidden>
              <div
                key={progress.key}
                className="h-full bg-accent anim-progress"
                style={{
                  ['--d' as string]: `${progress.duration}ms`,
                  animationPlayState: progress.paused ? 'paused' : 'running',
                }}
              />
            </div>
          )}
        </div>
        {secondary && (
          <div className="flex justify-center mt-2">
            <Button variant="text" onClick={secondary.onClick} disabled={secondary.disabled} data-testid={secondary.testId}>
              {secondary.label}
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
