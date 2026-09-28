import { describe, expect, it } from 'vitest';
import { createInitialState, gameReducer } from '../state/gameReducer';
import type { ChoiceId, GameAction, GameState } from '../types/game';
import { INITIAL_PROGRESS } from '../utils/storage';

const run = (s: GameState, ...actions: GameAction[]) => actions.reduce(gameReducer, s);
const NOW = { now: 1, nowIso: '2026-09-28T00:00:00.000Z' };

function playThrough(s: GameState, choiceId: ChoiceId): GameState {
  s = { ...s, screen: 'choice', warp: null };
  return run(
    s,
    { type: 'SELECT_CHOICE', choiceId },
    { type: 'CONFIRM_CHOICE', ...NOW },
    { type: 'TIMELINE_SKIP' },
    { type: 'TIMELINE_DONE' },
    { type: 'BUTTERFLY_DONE', nowIso: NOW.nowIso },
  );
}

describe('gameReducer', () => {
  it('첫 BEGIN → intro', () => {
    expect(gameReducer(createInitialState(), { type: 'BEGIN' }).screen).toBe('intro');
  });

  it('hasSeenIntro 이면 BEGIN → event 로 워프', () => {
    const s = createInitialState({ ...INITIAL_PROGRESS, hasSeenIntro: true });
    const n = gameReducer(s, { type: 'BEGIN' });
    expect(n.warp?.next).toBe('event');
    expect(gameReducer(n, { type: 'WARP_DONE' }).screen).toBe('event');
  });

  it('선택 없이 CONFIRM 은 무시된다', () => {
    const s = { ...createInitialState(), screen: 'choice' as const };
    expect(gameReducer(s, { type: 'CONFIRM_CHOICE', ...NOW })).toBe(s);
  });

  it('TIMELINE_NEXT 는 5에서 멈춘다', () => {
    let s: GameState = { ...createInitialState(), screen: 'choice' };
    s = run(s, { type: 'SELECT_CHOICE', choiceId: 'warn_defenders' }, { type: 'CONFIRM_CHOICE', ...NOW });
    for (let i = 0; i < 6; i++) s = gameReducer(s, { type: 'TIMELINE_NEXT' });
    expect(s.timelineIndex).toBe(5);
  });

  it('TIMELINE_SKIP → 5', () => {
    let s: GameState = { ...createInitialState(), screen: 'choice' };
    s = run(s, { type: 'SELECT_CHOICE', choiceId: 'observe' }, { type: 'CONFIRM_CHOICE', ...NOW }, { type: 'TIMELINE_SKIP' });
    expect(s.timelineIndex).toBe(5);
  });

  it('첫 발견 → 번호 1, fresh', () => {
    const s = playThrough(createInitialState(), 'warn_defenders');
    expect(s.screen).toBe('result');
    expect(s.progress.discovered.wl_walls_held?.number).toBe(1);
    expect(s.progress.totalRuns).toBe(1);
    expect(s.resultMode).toBe('fresh');
  });

  it('같은 세계선 재방문 → 번호 유지, revisit', () => {
    let s = playThrough(createInitialState(), 'warn_defenders');
    s = playThrough(s, 'warn_defenders');
    expect(s.progress.discovered.wl_walls_held?.number).toBe(1);
    expect(s.progress.discovered.wl_walls_held?.timesViewed).toBe(2);
    expect(s.resultMode).toBe('revisit');
    expect(Object.keys(s.progress.discovered)).toHaveLength(1);
  });

  it('세 세계선 완료 → 1,2,3 번호와 completedAll', () => {
    let s = playThrough(createInitialState(), 'observe');
    expect(s.justCompletedAll).toBe(false);
    s = playThrough(s, 'silence_guns');
    expect(s.justCompletedAll).toBe(false);
    s = playThrough(s, 'warn_defenders');
    expect(s.progress.discovered.wl_origin_observed?.number).toBe(1);
    expect(s.progress.discovered.wl_silent_guns?.number).toBe(2);
    expect(s.progress.discovered.wl_walls_held?.number).toBe(3);
    expect(s.justCompletedAll).toBe(true);
    expect(s.progress.completedAllAt).not.toBeNull();
  });

  it('RETURN_TO_PAST(preselect)', () => {
    const s = gameReducer(playThrough(createInitialState(), 'observe'), { type: 'RETURN_TO_PAST', preselect: 'silence_guns' });
    expect(s.warp?.next).toBe('choice');
    expect(s.warp?.mode).toBe('rewind');
    expect(s.selectedChoiceId).toBe('silence_guns');
    expect(s.progress.loopsStarted).toBe(1);
    expect(gameReducer(s, { type: 'RETURN_TO_PAST' })).toBe(s); // 워프 중 중복 무시
  });

  it('RESET_PROGRESS → 초기 진행', () => {
    const s = gameReducer(playThrough(createInitialState(), 'observe'), { type: 'RESET_PROGRESS' });
    expect(s.progress).toEqual(INITIAL_PROGRESS);
    expect(s.screen).toBe('title');
  });
});
