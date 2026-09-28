import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react';
import type { GameAction, GameState } from '../types/game';
import { setAnalyticsContext } from '../utils/analytics';
import { loadProgress, saveProgress } from '../utils/storage';
import { createInitialState, gameReducer } from './gameReducer';
import { discoveredCount } from './selectors';

interface GameContextValue {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

// 공통 분석 속성을 위한 최신 상태 참조 (렌더 사이클과 무관하게 읽힘)
let latestState: GameState | null = null;
setAnalyticsContext(() => {
  const p = latestState?.progress;
  return {
    discovered_count: p ? discoveredCount(p) : 0,
    total_runs: p?.totalRuns ?? 0,
    loops_started: p?.loopsStarted ?? 0,
  };
});

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => createInitialState(loadProgress()));
  latestState = state;

  useEffect(() => {
    saveProgress(state.progress);
  }, [state.progress]);

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
