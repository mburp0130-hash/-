import { getWorldline, metrics, TOTAL_WORLDLINES, WORLDLINE_COLOR } from '../data';
import { S } from '../data/strings';
import { ScreenShell } from '../components/layout/ScreenShell';
import { StickyCTA } from '../components/layout/StickyCTA';
import { SavedStamp } from '../components/SavedStamp';
import { useOnce } from '../hooks/useOnce';
import { useGame } from '../state/GameContext';
import { discoveredInOrder } from '../state/selectors';
import { track } from '../utils/analytics';
import { formatWorldlineNumber } from '../utils/format';

function MiniBars({ values, color }: { values: number[]; color: string }) {
  return (
    <div className="grid grid-cols-5 gap-1.5 mt-3" aria-hidden>
      {values.map((v, i) => (
        <div key={i} className="h-1 rounded-full bg-surface-2 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${v}%`, background: color }} />
        </div>
      ))}
    </div>
  );
}

export function CompleteScreen() {
  const { state, dispatch } = useGame();
  const p = state.progress;
  useOnce(() => track('complete_viewed'));

  return (
    <ScreenShell screenId="complete">
      <div className="pt-10 text-center">
        <SavedStamp text={S.complete.title} />
        <div className="t-wl-no mt-6 text-accent">{Object.keys(p.discovered).length} / {TOTAL_WORLDLINES}</div>
        <p className="t-body text-muted mt-3">{S.complete.sub}</p>
      </div>

      <div className="space-y-3 mt-8">
        <div className="card">
          <div className="t-label text-dim">{S.complete.origin}</div>
          <div className="t-body font-bold mt-1">이스탄불 · 튀르키예 공화국</div>
          <MiniBars values={metrics.map((m) => m.original.index)} color="var(--c-origin)" />
        </div>
        {discoveredInOrder(p).map((id) => {
          const wl = getWorldline(id);
          return (
            <div key={id} className="card" data-testid={`complete-${id}`}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs" style={{ color: WORLDLINE_COLOR[id] }}>{formatWorldlineNumber(p.discovered[id]!.number)}</span>
                <span className="t-label text-dim">{wl.nameEn}</span>
              </div>
              <div className="t-body font-bold mt-1">{wl.name}</div>
              <div className="t-caption text-muted mt-0.5">2026 · {wl.world2026.headline.text}</div>
              <MiniBars values={metrics.map((m) => wl.comparison[m.id].index)} color={WORLDLINE_COLOR[id]} />
            </div>
          );
        })}
        <div className="flex gap-1 text-[10px] text-dim justify-between px-1">
          {metrics.map((m) => (
            <span key={m.id} className="flex-1 text-center">{m.indexLabel.replace('콘스탄티노폴리스의 ', '')}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-8" aria-hidden>
        <div className="card opacity-40 text-center t-label text-dim">{S.complete.nextEvent}</div>
        <div className="card opacity-40 text-center t-label text-dim">{S.complete.later}</div>
      </div>

      <div className="flex justify-center mt-4">
        <button type="button" onClick={() => dispatch({ type: 'GO_TITLE' })} className="t-label text-muted min-h-11 px-3" data-testid="btn-to-title">
          {S.complete.toTitle}
        </button>
      </div>

      <StickyCTA
        primary={{
          label: S.result.returnCta,
          testId: 'btn-return',
          disabled: state.warp !== null,
          onClick: () => {
            track('loop_started', { source: 'complete', from_worldline_id: null });
            dispatch({ type: 'RETURN_TO_PAST' });
          },
        }}
        secondary={{
          label: S.title.archive,
          testId: 'btn-to-archive',
          onClick: () => {
            track('archive_opened', { source: 'complete' });
            dispatch({ type: 'OPEN_ARCHIVE' });
          },
        }}
      />
    </ScreenShell>
  );
}
