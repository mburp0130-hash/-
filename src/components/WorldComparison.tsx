import { useEffect } from 'react';
import { t } from '../config/timing';
import { S } from '../data/strings';
import { useInView } from '../hooks/useInView';
import type { ComparisonMetricDef, MetricId, MetricValue } from '../types/game';
import { LabelBadge } from './ui/LabelBadge';

function Bar({ value, color, visible, delay }: { value: number; color: string; visible: boolean; delay: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden" aria-hidden>
      <div
        className="h-full rounded-full"
        style={{
          width: visible ? `${value}%` : '0%',
          background: color,
          transition: `width ${t('comparisonBar')}ms ease-out ${delay}ms`,
        }}
      />
    </div>
  );
}

function Delta({ d }: { d: number }) {
  if (d === 0) return <span className="font-mono text-xs text-muted">= 0</span>;
  return (
    <span className="font-mono text-xs" style={{ color: d > 0 ? 'var(--c-simulated)' : 'var(--c-danger)' }}>
      {d > 0 ? `▲ +${d}` : `▼ −${Math.abs(d)}`}
    </span>
  );
}

export function WorldComparison({
  metrics,
  values,
  color,
  isOrigin,
  onSeen,
}: {
  metrics: ComparisonMetricDef[];
  values: Record<MetricId, MetricValue>;
  color: string;
  isOrigin: boolean;
  onSeen?: () => void;
}) {
  const { ref, inView } = useInView<HTMLElement>(0.2);
  useEffect(() => {
    if (inView) onSeen?.();
  }, [inView, onSeen]);

  return (
    <section ref={ref} className="mt-10" data-testid="comparison">
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="t-label text-accent">{S.result.compareTitle}</div>
        <div className="text-[10px] text-dim">{S.result.compareLegend}</div>
      </div>
      {isOrigin && <p className="t-body-sm text-muted mb-3">{S.result.noChange}</p>}
      <div className="space-y-3">
        {metrics.map((m) => {
          const alt = values[m.id];
          const d = alt.index - m.original.index;
          return (
            <div key={m.id} className="card" data-testid={`metric-${m.id}`}>
              <div className="flex items-center justify-between mb-2.5">
                <span className="t-caption text-muted font-bold">{m.label}</span>
                <Delta d={d} />
              </div>
              <div className="space-y-2.5">
                <div>
                  <div className="flex items-start gap-2 mb-1">
                    <span className="t-label text-dim w-8 shrink-0 pt-0.5">{S.result.original}</span>
                    <span className="t-caption flex-1">{m.original.text}</span>
                    <LabelBadge label={m.original.label} />
                  </div>
                  <Bar value={m.original.index} color="var(--c-origin)" visible={inView} delay={0} />
                </div>
                <div>
                  <div className="flex items-start gap-2 mb-1">
                    <span className="t-label w-8 shrink-0 pt-0.5" style={{ color }}>{S.result.changed}</span>
                    <span className="t-caption flex-1 font-bold">{alt.text}</span>
                    <LabelBadge label={alt.label} />
                  </div>
                  <Bar value={alt.index} color={color} visible={inView} delay={150} />
                </div>
              </div>
              <div className="text-[10px] text-dim mt-2">{S.result.indexNote(m.indexLabel)}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
