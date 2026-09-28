import { useEffect, useState } from 'react';
import { t } from '../config/timing';
import type { ButterflyNode } from '../types/game';
import { LabelBadge } from './ui/LabelBadge';

export function ButterflyEffectChain({
  nodes,
  animated,
  showAll = false,
  color,
  onAllShown,
}: {
  nodes: ButterflyNode[];
  animated: boolean;
  showAll?: boolean;
  color: string;
  onAllShown?: () => void;
}) {
  const interval = t('butterflyInterval');
  const instant = !animated || interval === 0;
  const [count, setCount] = useState(instant ? nodes.length : 1);

  useEffect(() => {
    if (showAll) setCount(nodes.length);
  }, [showAll, nodes.length]);

  useEffect(() => {
    if (count >= nodes.length) {
      onAllShown?.();
      return;
    }
    const id = setTimeout(() => setCount((c) => c + 1), interval);
    return () => clearTimeout(id);
  }, [count, nodes.length, interval, onAllShown]);

  return (
    <ol className="flex flex-col items-stretch" data-testid="butterfly-chain">
      {nodes.slice(0, count).map((n, i) => {
        const first = i === 0;
        const last = i === nodes.length - 1;
        const border = first && n.label === 'player_intervention' ? 'var(--c-accent)' : last ? color : 'var(--c-border)';
        const connectorMs = t('butterflyConnector');
        return (
          <li key={n.id} className="flex flex-col items-center">
            {i > 0 && (
              <div className="flex flex-col items-center" aria-hidden>
                <div
                  className={`w-px bg-line ${instant ? 'h-6' : 'anim-grow-y'}`}
                  style={{ ['--d' as string]: `${connectorMs}ms` }}
                />
                <div className="text-dim text-[10px] leading-none -mt-0.5">▼</div>
              </div>
            )}
            <div
              className={`w-full rounded-xl bg-surface px-4 py-3 ${instant ? '' : 'anim-fade-up'}`}
              style={{
                border: `${last || first ? 2 : 1}px solid ${border}`,
                ['--delay' as string]: `${i > 0 && !instant ? connectorMs : 0}ms`,
                ['--d' as string]: `${t('butterflyNode')}ms`,
              }}
              data-testid="butterfly-node"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-muted">{n.year ?? ''}</span>
                <LabelBadge label={n.label} />
              </div>
              <p className={`t-body mt-1 ${last ? 'font-bold' : ''}`}>{n.text}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
