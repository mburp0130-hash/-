import { useCallback, useState } from 'react';
import { t } from '../config/timing';
import { getWorldline, WORLDLINE_COLOR } from '../data';
import { S } from '../data/strings';
import { ButterflyEffectChain } from '../components/ButterflyEffectChain';
import { ScreenShell } from '../components/layout/ScreenShell';
import { StickyCTA } from '../components/layout/StickyCTA';
import { TopBar } from '../components/layout/TopBar';
import { useOnce } from '../hooks/useOnce';
import { useGame } from '../state/GameContext';
import { displayNumber } from '../state/selectors';
import { track } from '../utils/analytics';
import { formatWorldlineNumber } from '../utils/format';

export function ButterflyScreen() {
  const { state, dispatch } = useGame();
  const wl = getWorldline(state.activeWorldlineId!);
  const color = WORLDLINE_COLOR[wl.id];
  // 연출이 없는 모드(reduced-motion/fast)에서는 처음부터 전체 표시 상태
  const [allShown, setAllShown] = useState(() => t('butterflyInterval') === 0);
  const [forceAll, setForceAll] = useState(false);

  useOnce(() => track('butterfly_viewed', { worldline_id: wl.id }));
  const onAllShown = useCallback(() => setAllShown(true), []);

  const primary = () => {
    if (!allShown) {
      setForceAll(true);
      return;
    }
    dispatch({ type: 'BUTTERFLY_DONE', nowIso: new Date().toISOString() });
  };

  return (
    <ScreenShell
      screenId="butterfly"
      onClick={() => setForceAll(true)}
      topBar={<TopBar left={<span style={{ color }}>{formatWorldlineNumber(displayNumber(state.progress, wl.id))}</span>} />}
    >
      <div className="t-label text-accent mt-4">{S.butterfly.kicker}</div>
      <h1 className="t-h1 mt-1 mb-6">{wl.isOrigin ? S.butterfly.titleOrigin : S.butterfly.title}</h1>
      <ButterflyEffectChain nodes={wl.butterfly} animated showAll={forceAll} color={color} onAllShown={onAllShown} />
      <StickyCTA primary={{ label: S.butterfly.cta, onClick: primary, testId: 'btn-to-result' }} />
    </ScreenShell>
  );
}
