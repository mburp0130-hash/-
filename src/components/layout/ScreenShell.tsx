import { useEffect, type ReactNode } from 'react';
import { t } from '../../config/timing';
import type { ScreenId } from '../../types/game';

export function ScreenShell({
  screenId,
  topBar,
  children,
  hasCTA = true,
  className = '',
  onClick,
}: {
  screenId: ScreenId;
  topBar?: ReactNode;
  children: ReactNode;
  hasCTA?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main
      data-testid={`screen-${screenId}`}
      onClick={onClick}
      className={`relative mx-auto w-full max-w-[440px] min-h-[100dvh] px-5 anim-screen-in ${className}`}
      style={{
        ['--d' as string]: `${t('screenFadeIn')}ms`,
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: hasCTA ? 'calc(200px + env(safe-area-inset-bottom))' : 'calc(24px + env(safe-area-inset-bottom))',
      }}
    >
      {topBar}
      {children}
    </main>
  );
}
