import { describe, expect, it, vi } from 'vitest';
import { INITIAL_PROGRESS, loadProgress, PROGRESS_KEY, saveProgress } from '../utils/storage';

describe('storage', () => {
  it('저장 후 로드', () => {
    const p = {
      ...INITIAL_PROGRESS,
      hasSeenIntro: true,
      totalRuns: 2,
      discovered: { wl_silent_guns: { worldlineId: 'wl_silent_guns' as const, number: 1, firstDiscoveredAt: 'x', timesViewed: 2 } },
    };
    saveProgress(p);
    expect(loadProgress()).toEqual(p);
  });

  it('깨진 JSON → 초기값', () => {
    localStorage.setItem(PROGRESS_KEY, '{not json');
    expect(loadProgress()).toEqual(INITIAL_PROGRESS);
  });

  it('version 2 → 초기값', () => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ ...INITIAL_PROGRESS, version: 2 }));
    expect(loadProgress()).toEqual(INITIAL_PROGRESS);
  });

  it('알 수 없는 세계선 id 는 제거된다', () => {
    localStorage.setItem(
      PROGRESS_KEY,
      JSON.stringify({ ...INITIAL_PROGRESS, discovered: { wl_unknown: { number: 1 } } }),
    );
    expect(loadProgress().discovered).toEqual({});
  });

  it('setItem 이 throw 해도 saveProgress 는 throw 하지 않는다', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(() => saveProgress(INITIAL_PROGRESS)).not.toThrow();
  });
});
