import { useCallback, useState } from 'react';
import { event, getChoice, getWorldline, metrics, WORLDLINE_COLOR } from '../data';
import { S } from '../data/strings';
import { ButterflyEffectChain } from '../components/ButterflyEffectChain';
import { Disclaimer } from '../components/Disclaimer';
import { LabelLegendSheet } from '../components/LabelLegendSheet';
import { ScreenShell } from '../components/layout/ScreenShell';
import { StickyCTA, type CTAAction } from '../components/layout/StickyCTA';
import { TopBar } from '../components/layout/TopBar';
import { World2026Panel } from '../components/World2026Panel';
import { WorldComparison } from '../components/WorldComparison';
import { WorldlineCounter } from '../components/WorldlineCounter';
import { WorldlineHeader } from '../components/WorldlineHeader';
import { useOnce } from '../hooks/useOnce';
import { useGame } from '../state/GameContext';
import { isAllDiscovered, undiscoveredChoices } from '../state/selectors';
import type { ChoiceId } from '../types/game';
import { track } from '../utils/analytics';
import { formatWorldlineNumber } from '../utils/format';
import { InfoButton } from './ContextScreen';

export function ResultScreen() {
  const { state, dispatch } = useGame();
  const p = state.progress;
  const wl = getWorldline(state.activeWorldlineId!);
  const choice = getChoice(wl.choiceId);
  const color = WORLDLINE_COLOR[wl.id];
  const rec = p.discovered[wl.id]!;
  const mode = state.resultMode;
  const [chainOpen, setChainOpen] = useState(false);
  const [legend, setLegend] = useState(false);
  const remaining = undiscoveredChoices(p).length;
  const busy = state.warp !== null;

  useOnce(() => {
    if (mode !== 'archive') {
      track('worldline_saved', { worldline_id: wl.id, worldline_number: rec.number, is_new_worldline: mode === 'fresh' });
    }
    track('worldline_viewed', {
      worldline_id: wl.id,
      worldline_number: rec.number,
      mode,
      run_number: p.totalRuns,
      run_duration_ms: state.runStartedAt !== null && mode !== 'archive' ? Math.round(performance.now() - state.runStartedAt) : null,
    });
    if (state.justCompletedAll) {
      const first = p.firstPlayedAt ? Date.parse(p.firstPlayedAt) : NaN;
      track('all_worldlines_completed', {
        total_runs: p.totalRuns,
        minutes_since_first_play: Number.isNaN(first) ? null : Math.round((Date.now() - first) / 60000),
      });
    }
  });

  const onSeen = useCallback(() => track('comparison_viewed', { worldline_id: wl.id }), [wl.id]);

  const returnToPast = (source: string, preselect?: ChoiceId) => {
    if (busy) return;
    track('loop_started', {
      source,
      from_worldline_id: wl.id,
      target_choice_id: preselect ?? null,
    });
    dispatch({ type: 'RETURN_TO_PAST', preselect });
  };
  const toComplete = () => dispatch({ type: 'OPEN_COMPLETE' });
  const toArchive = () => {
    track('archive_opened', { source: 'result' });
    dispatch({ type: 'OPEN_ARCHIVE' });
  };

  const ret: CTAAction = { label: S.result.returnCta, onClick: () => returnToPast(mode === 'archive' ? 'archive' : 'result_cta'), testId: 'btn-return', disabled: busy };
  let primary: CTAAction = ret;
  let secondary: CTAAction | undefined;
  if (mode === 'archive') {
    secondary = { label: S.result.backToArchive, onClick: toArchive, testId: 'btn-to-archive' };
  } else if (state.justCompletedAll) {
    primary = { label: S.result.completeCta, onClick: toComplete, testId: 'btn-complete' };
    secondary = { ...ret, label: S.result.returnCta };
  } else if (isAllDiscovered(p)) {
    secondary = { label: S.result.toComplete, onClick: toComplete, testId: 'btn-complete' };
  } else {
    secondary = { label: S.result.toArchive, onClick: toArchive, testId: 'btn-to-archive' };
  }

  return (
    <ScreenShell
      screenId="result"
      topBar={<TopBar left={<span style={{ color }}>{formatWorldlineNumber(rec.number)}</span>} right={<InfoButton onClick={() => setLegend(true)} screen="result" />} />}
    >
      <WorldlineHeader
        number={rec.number}
        worldline={wl}
        choice={choice}
        event={event}
        stamp={mode === 'fresh' ? 'saved' : mode === 'revisit' ? 'revisited' : null}
        color={color}
      />
      <World2026Panel snapshot={wl.world2026} isOrigin={wl.isOrigin} />
      <WorldComparison metrics={metrics} values={wl.comparison} color={color} isOrigin={wl.isOrigin} onSeen={onSeen} />

      <section className="mt-8">
        <button
          type="button"
          className="pressable w-full text-left card flex items-center gap-2"
          onClick={() => {
            if (!chainOpen) track('butterfly_expanded', { worldline_id: wl.id });
            setChainOpen((o) => !o);
          }}
          aria-expanded={chainOpen}
          data-testid="btn-replay-chain"
        >
          <span className="text-muted">{chainOpen ? '▾' : '▸'}</span>
          <span className="t-body-sm">{S.result.replayChain}</span>
        </button>
        {chainOpen && (
          <div className="mt-3">
            <ButterflyEffectChain nodes={wl.butterfly} animated={false} color={color} />
          </div>
        )}
      </section>

      <WorldlineCounter variant="full" onTeaserClick={busy ? undefined : (id) => returnToPast('teaser_slot', id)} />
      <Disclaimer isOrigin={wl.isOrigin} onInfo={() => setLegend(true)} />

      <StickyCTA primary={primary} secondary={secondary} nudge={remaining > 0 ? S.result.nudge(remaining) : undefined} />
      <LabelLegendSheet open={legend} onClose={() => setLegend(false)} />
    </ScreenShell>
  );
}
