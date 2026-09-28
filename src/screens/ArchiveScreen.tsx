import { getWorldline, TOTAL_WORLDLINES, WORLDLINE_COLOR } from '../data';
import { S } from '../data/strings';
import { ScreenShell } from '../components/layout/ScreenShell';
import { StickyCTA } from '../components/layout/StickyCTA';
import { useGame } from '../state/GameContext';
import { discoveredCount, discoveredInOrder, undiscoveredChoices } from '../state/selectors';
import { track } from '../utils/analytics';
import { formatDateTime, formatWorldlineNumber } from '../utils/format';

export function ArchiveScreen() {
  const { state, dispatch } = useGame();
  const p = state.progress;
  const count = discoveredCount(p);

  return (
    <ScreenShell
      screenId="archive"
      hasCTA={count > 0}
      topBar={
        <header className="h-12 flex items-center justify-between">
          <button type="button" className="t-label text-muted min-h-11 pr-3" onClick={() => dispatch({ type: 'GO_TITLE' })} data-testid="btn-archive-back">
            {S.archive.back}
          </button>
          <span className="font-mono text-xs text-muted">{count} / {TOTAL_WORLDLINES}</span>
        </header>
      }
    >
      <h1 className="t-h1 mt-4 mb-5 font-mono tracking-wide">{S.archive.title}</h1>
      <div className="space-y-3">
        {discoveredInOrder(p).map((id) => {
          const wl = getWorldline(id);
          const rec = p.discovered[id]!;
          return (
            <button
              key={id}
              type="button"
              className="pressable w-full text-left card"
              style={{ borderColor: `color-mix(in srgb, ${WORLDLINE_COLOR[id]} 50%, var(--c-border))` }}
              onClick={() => {
                track('archive_worldline_viewed', { worldline_id: id });
                dispatch({ type: 'VIEW_ARCHIVED', worldlineId: id });
              }}
              data-testid={`archive-${id}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm" style={{ color: WORLDLINE_COLOR[id] }}>{formatWorldlineNumber(rec.number)}</span>
                <span className="text-[11px] text-dim font-mono">{formatDateTime(rec.firstDiscoveredAt)}</span>
              </div>
              <div className="font-serif text-lg mt-2">{wl.nameEn}</div>
              <div className="t-body font-bold">{wl.name}</div>
              <div className="t-caption text-muted mt-1">2026 · {wl.world2026.headline.text}</div>
            </button>
          );
        })}
        {undiscoveredChoices(p).map((c) => (
          <div key={c.id} className="card opacity-60" data-testid={`archive-locked-${c.id}`}>
            <div className="font-mono text-sm text-dim">?? · {S.archive.locked}</div>
            <div className="t-body-sm text-muted mt-2">{c.teaserQuestion}</div>
          </div>
        ))}
      </div>
      {count > 0 && (
        <StickyCTA
          primary={{
            label: S.result.returnCta,
            testId: 'btn-return',
            disabled: state.warp !== null,
            onClick: () => {
              track('loop_started', { source: 'archive', from_worldline_id: null });
              dispatch({ type: 'RETURN_TO_PAST' });
            },
          }}
        />
      )}
    </ScreenShell>
  );
}
