import { t } from '../config/timing';

const BRANCH = 'M0 24 H90 C120 24 130 8 200 8';
const BRANCH_LEN = 220;

export function WorldlineGlyph({
  diverged = true,
  color = 'var(--c-accent)',
  animate = false,
  width = 200,
  className = '',
}: {
  diverged?: boolean;
  color?: string;
  animate?: boolean;
  width?: number;
  className?: string;
}) {
  const d = t('divergenceDraw');
  return (
    <svg viewBox="0 0 200 40" width={width} height={(width / 200) * 40} className={className} aria-hidden>
      <path d="M0 24 H200" stroke="var(--c-origin)" strokeWidth={1.5} strokeDasharray="4 4" fill="none" opacity={0.7} />
      {diverged && (
        <path
          d={BRANCH}
          stroke={color}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          className={animate && d > 0 ? 'anim-draw' : ''}
          style={
            animate && d > 0
              ? { strokeDasharray: BRANCH_LEN, strokeDashoffset: BRANCH_LEN, ['--d' as string]: `${d}ms` }
              : undefined
          }
        />
      )}
    </svg>
  );
}
