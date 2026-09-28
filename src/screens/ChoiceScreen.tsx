import { useCallback, useEffect, useState } from 'react';
import { choices, event, getChoice, WORLDLINE_COLOR } from '../data';
import { S } from '../data/strings';
import { ChoiceCard } from '../components/ChoiceCard';
import { DivergenceOverlay } from '../components/DivergenceOverlay';
import { ScreenShell } from '../components/layout/ScreenShell';
import { StickyCTA } from '../components/layout/StickyCTA';
import { TopBar } from '../components/layout/TopBar';
import { useOnce } from '../hooks/useOnce';
import { useGame } from '../state/GameContext';
import { displayNumber, isChoiceDiscovered, unlockedNotesFor, worldlineNumber } from '../state/selectors';
import type { ChoiceId } from '../types/game';
import { track } from '../utils/analytics';

export function ChoiceScreen() {
  const { state, dispatch } = useGame();
  const p = state.progress;
  const selected = state.selectedChoiceId;
  const [diverging, setDiverging] = useState(false);

  useOnce(() => track('choice_screen_viewed', { is_loop: state.isLoop, preselected_choice_id: selected }));

  const select = useCallback(
    (id: ChoiceId) => {
      if (diverging) return;
      track('choice_previewed', { choice_id: id, is_discovered: isChoiceDiscovered(p, id) });
      dispatch({ type: 'SELECT_CHOICE', choiceId: id });
    },
    [diverging, dispatch, p],
  );

  const confirm = () => {
    if (!selected || diverging) return;
    const c = getChoice(selected);
    track('choice_selected', {
      choice_id: c.id,
      worldline_id: c.worldlineId,
      is_new_worldline: !p.discovered[c.worldlineId],
      run_number: p.totalRuns + 1,
      is_loop: state.isLoop,
    });
    setDiverging(true);
  };

  const onDiverged = useCallback(() => {
    dispatch({ type: 'CONFIRM_CHOICE', now: performance.now(), nowIso: new Date().toISOString() });
  }, [dispatch]);

  // 키보드 1/2/3
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= choices.length) select(choices[n - 1].id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [select]);

  const selChoice = selected ? getChoice(selected) : null;

  return (
    <ScreenShell screenId="choice" topBar={<TopBar left={`${event.dateLabel} · ${event.place.toUpperCase()}`} />}>
      <h1 className="t-h1 mt-4">{S.choice.title}</h1>
      <p className="t-body-sm text-muted mt-1 mb-5">{S.choice.sub}</p>
      <div role="radiogroup" aria-label={S.choice.title} className="space-y-3">
        {choices.map((c) => (
          <ChoiceCard
            key={c.id}
            choice={c}
            selected={selected === c.id}
            dimmed={selected !== null && selected !== c.id}
            discoveredNumber={worldlineNumber(p, c.worldlineId)}
            notes={unlockedNotesFor(p, c.id)}
            onSelect={() => select(c.id)}
          />
        ))}
      </div>
      <StickyCTA
        primary={{
          label: selChoice ? selChoice.ctaLabel : S.choice.disabled,
          onClick: confirm,
          disabled: !selChoice || diverging,
          testId: 'btn-confirm-choice',
        }}
      />
      {diverging && selChoice && (
        <DivergenceOverlay
          worldlineNumber={displayNumber(p, selChoice.worldlineId)}
          isOrigin={selChoice.kind === 'observation'}
          color={WORLDLINE_COLOR[selChoice.worldlineId]}
          onDone={onDiverged}
        />
      )}
    </ScreenShell>
  );
}
