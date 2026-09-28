import { t } from '../config/timing';
import type { Era } from '../types/game';

const W = 300;
const BASE_Y = 40;
const PAD = 14;

/** 6개 연도 눈금 + 원래/현재 세계선 두 선 (명세 §E-7-1) */
export function TimelineRail({ eras, currentIndex, color }: { eras: Era[]; currentIndex: number; color: string }) {
  const step = (W - PAD * 2) / (eras.length - 1);
  const x = (i: number) => PAD + i * step;
  const y = (i: number) => BASE_Y - eras[i].divergence * 0.24;
  const shown = eras.slice(0, currentIndex + 1);
  const altPoints = shown.map((_, i) => `${x(i)},${i === 0 ? BASE_Y : y(i)}`).join(' ');

  return (
    <div className="w-full" data-testid="timeline-rail">
      <svg viewBox={`0 0 ${W} 64`} className="w-full h-16" aria-hidden>
        <line x1={PAD} y1={BASE_Y} x2={W - PAD} y2={BASE_Y} stroke="var(--c-origin)" strokeWidth={1.2} strokeDasharray="3 3" opacity={0.6} />
        {shown.length > 1 && (
          <polyline
            points={altPoints}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinejoin="round"
            style={{ transition: `all ${t('yearRoll')}ms ease-out` }}
          />
        )}
        {eras.map((e, i) => {
          const done = i < currentIndex;
          const cur = i === currentIndex;
          const cy = i <= currentIndex && i > 0 ? y(i) : BASE_Y;
          return (
            <g key={e.year}>
              <circle
                cx={x(i)}
                cy={cy}
                r={cur ? 5 : 3.5}
                fill={done || cur ? color : 'var(--c-bg)'}
                stroke={cur ? 'var(--c-accent)' : done ? color : 'var(--c-text-dim)'}
                strokeWidth={cur ? 2.5 : 1.2}
              />
              <text
                x={x(i)}
                y={60}
                textAnchor="middle"
                fontSize={9}
                fontFamily="ui-monospace, Menlo, monospace"
                fill={cur ? 'var(--c-accent)' : i < currentIndex ? 'var(--c-text-muted)' : 'var(--c-text-dim)'}
              >
                {e.year}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
