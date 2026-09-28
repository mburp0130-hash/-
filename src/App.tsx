import { useCallback, useEffect, useRef } from 'react';
import { WarpOverlay } from './components/WarpOverlay';
import { eventPack } from './data';
import { useOnce } from './hooks/useOnce';
import { ArchiveScreen } from './screens/ArchiveScreen';
import { ButterflyScreen } from './screens/ButterflyScreen';
import { ChoiceScreen } from './screens/ChoiceScreen';
import { CompleteScreen } from './screens/CompleteScreen';
import { ContextScreen } from './screens/ContextScreen';
import { EventScreen } from './screens/EventScreen';
import { IntroScreen } from './screens/IntroScreen';
import { ResultScreen } from './screens/ResultScreen';
import { TimelineScreen } from './screens/TimelineScreen';
import { TitleScreen } from './screens/TitleScreen';
import { GameProvider, useGame } from './state/GameContext';
import { track } from './utils/analytics';
import { validateEventPack } from './utils/validateEventPack';

const dataErrors = import.meta.env.DEV ? validateEventPack(eventPack) : [];
if (dataErrors.length) console.error('[ONE CHANGE] 데이터 검증 실패', dataErrors);

function ScreenRouter() {
  const { state } = useGame();
  switch (state.screen) {
    case 'title':
      return <TitleScreen />;
    case 'intro':
      return <IntroScreen />;
    case 'event':
      return <EventScreen />;
    case 'context':
      return <ContextScreen />;
    case 'choice':
      return <ChoiceScreen />;
    case 'timeline':
      return <TimelineScreen />;
    case 'butterfly':
      return <ButterflyScreen />;
    case 'result':
      return <ResultScreen />;
    case 'archive':
      return <ArchiveScreen />;
    case 'complete':
      return <CompleteScreen />;
  }
}

function Game() {
  const { state, dispatch } = useGame();
  const openedAt = useRef(performance.now()).current;

  useOnce(() => track('app_opened', { is_returning_user: state.progress.firstPlayedAt !== null }));

  const screenRef = state.screen;
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'hidden') {
        track('session_hidden', { screen: screenRef, ms_since_open: Math.round(performance.now() - openedAt) });
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [screenRef, openedAt]);

  const onWarpDone = useCallback(() => dispatch({ type: 'WARP_DONE' }), [dispatch]);

  return (
    <>
      {dataErrors.length > 0 && (
        <div className="fixed top-0 inset-x-0 z-[100] bg-danger text-black text-xs p-2">
          데이터 검증 실패: {dataErrors.length}건 (콘솔 확인)
        </div>
      )}
      <div key={state.screen} style={{ pointerEvents: state.warp ? 'none' : undefined }}>
        <ScreenRouter />
      </div>
      {state.warp && <WarpOverlay key={`${state.warp.mode}-${state.warp.next}-${state.progress.loopsStarted}`} warp={state.warp} onDone={onWarpDone} />}
    </>
  );
}

export default function App() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  );
}
