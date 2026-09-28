import { S } from '../data/strings';
import type { WorldSnapshot2026 } from '../types/game';
import { LabelBadge } from './ui/LabelBadge';

export function World2026Panel({ snapshot, isOrigin }: { snapshot: WorldSnapshot2026; isOrigin: boolean }) {
  return (
    <section className="mt-8" data-testid="world-2026">
      <div className="t-label text-accent mb-3">{isOrigin ? S.result.orig2026 : S.result.alt2026}</div>
      <div className={isOrigin ? 'card' : 'card-spec'}>
        <div className="flex items-start gap-2">
          <h2 className="t-h1 flex-1">{snapshot.headline.text}</h2>
        </div>
        <div className="mt-1">
          <LabelBadge label={snapshot.headline.label} />
        </div>
        <p className="t-body-sm text-ink/85 mt-3">{snapshot.summary.text}</p>
        <div className="mt-5 pt-4 border-t border-line">
          <div className="t-label-ko text-dim mb-3">{snapshot.bulletinsTitle}</div>
          <ul className="space-y-2.5">
            {snapshot.bulletins.map((b) => (
              <li key={b.text} className="flex items-start gap-2">
                <span className="text-dim mt-0.5" aria-hidden>▸</span>
                <div className="flex-1">
                  {!isOrigin && (
                    <span className="text-[10px] text-speculative mr-1.5 align-middle">[{S.result.fakeNewsTag}]</span>
                  )}
                  <span className="t-body-sm">{b.text}</span>{' '}
                  <LabelBadge label={b.label} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
