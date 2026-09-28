import { getChoice, TOTAL_WORLDLINES } from '../data';
import type { GameAction, GameState, PersistedProgress } from '../types/game';
import { freshProgress } from '../utils/storage';

export const LAST_ERA_INDEX = 5;

export function createInitialState(progress: PersistedProgress = freshProgress()): GameState {
  return {
    screen: 'title',
    warp: null,
    selectedChoiceId: null,
    activeWorldlineId: null,
    timelineIndex: 0,
    resultMode: 'fresh',
    justCompletedAll: false,
    runStartedAt: null,
    isLoop: false,
    progress,
  };
}

const warpTo1453 = (mode: 'forward' | 'rewind', next: GameState['screen']) => ({
  fromYear: 2026,
  toYear: 1453,
  mode,
  next,
});

/** 순수 리듀서 — 시간 값은 액션 payload로 주입한다. (명세 §F-3) */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'BEGIN':
      if (!state.progress.hasSeenIntro) return { ...state, screen: 'intro', isLoop: false };
      return { ...state, isLoop: false, warp: warpTo1453('forward', 'event') };

    case 'INTRO_DONE':
      return {
        ...state,
        progress: { ...state.progress, hasSeenIntro: true },
        warp: warpTo1453('forward', 'event'),
      };

    case 'CONTINUE':
      return { ...state, selectedChoiceId: null, isLoop: true, warp: warpTo1453('rewind', 'choice') };

    case 'WARP_DONE':
      if (!state.warp) return state;
      // 과거로 돌아가면 이전 세계선 참조를 해제 (워프 중에는 결과 화면이 계속 렌더됨)
      return {
        ...state,
        screen: state.warp.next,
        warp: null,
        activeWorldlineId: state.warp.next === 'choice' ? null : state.activeWorldlineId,
      };

    case 'EVENT_DONE':
      return state.screen === 'event' ? { ...state, screen: 'context' } : state;

    case 'CONTEXT_DONE':
      return state.screen === 'context' ? { ...state, screen: 'choice' } : state;

    case 'SELECT_CHOICE':
      return state.screen === 'choice' ? { ...state, selectedChoiceId: action.choiceId } : state;

    case 'CONFIRM_CHOICE': {
      if (state.screen !== 'choice' || !state.selectedChoiceId) return state;
      const choice = getChoice(state.selectedChoiceId);
      return {
        ...state,
        activeWorldlineId: choice.worldlineId,
        timelineIndex: 0,
        screen: 'timeline',
        runStartedAt: action.now,
        progress: {
          ...state.progress,
          firstPlayedAt: state.progress.firstPlayedAt ?? action.nowIso,
        },
      };
    }

    case 'TIMELINE_NEXT':
      if (state.screen !== 'timeline' || state.timelineIndex >= LAST_ERA_INDEX) return state;
      return { ...state, timelineIndex: state.timelineIndex + 1 };

    case 'TIMELINE_SKIP':
      return state.screen === 'timeline' ? { ...state, timelineIndex: LAST_ERA_INDEX } : state;

    case 'TIMELINE_DONE':
      if (state.screen !== 'timeline' || state.timelineIndex !== LAST_ERA_INDEX) return state;
      return { ...state, screen: 'butterfly' };

    case 'BUTTERFLY_DONE': {
      const id = state.activeWorldlineId;
      if (state.screen !== 'butterfly' || !id) return state;
      const p = state.progress;
      const existing = p.discovered[id];
      if (existing) {
        return {
          ...state,
          screen: 'result',
          resultMode: 'revisit',
          justCompletedAll: false,
          progress: {
            ...p,
            totalRuns: p.totalRuns + 1,
            lastPlayedAt: action.nowIso,
            discovered: { ...p.discovered, [id]: { ...existing, timesViewed: existing.timesViewed + 1 } },
          },
        };
      }
      const count = Object.keys(p.discovered).length;
      const discovered = {
        ...p.discovered,
        [id]: { worldlineId: id, number: count + 1, firstDiscoveredAt: action.nowIso, timesViewed: 1 },
      };
      const completedNow = Object.keys(discovered).length === TOTAL_WORLDLINES;
      return {
        ...state,
        screen: 'result',
        resultMode: 'fresh',
        justCompletedAll: completedNow,
        progress: {
          ...p,
          discovered,
          totalRuns: p.totalRuns + 1,
          lastPlayedAt: action.nowIso,
          completedAllAt: completedNow ? action.nowIso : p.completedAllAt,
        },
      };
    }

    case 'RETURN_TO_PAST':
      if (state.warp) return state;
      return {
        ...state,
        selectedChoiceId: action.preselect ?? null,
        justCompletedAll: false,
        isLoop: true,
        progress: { ...state.progress, loopsStarted: state.progress.loopsStarted + 1 },
        warp: warpTo1453('rewind', 'choice'),
      };

    case 'OPEN_ARCHIVE':
      return { ...state, screen: 'archive' };

    case 'VIEW_ARCHIVED':
      if (!state.progress.discovered[action.worldlineId]) return state;
      return {
        ...state,
        activeWorldlineId: action.worldlineId,
        resultMode: 'archive',
        justCompletedAll: false,
        screen: 'result',
      };

    case 'OPEN_COMPLETE':
      return { ...state, screen: 'complete' };

    case 'GO_TITLE':
      return createInitialState(state.progress);

    case 'RESET_PROGRESS':
      return createInitialState(freshProgress());

    default:
      return state;
  }
}
