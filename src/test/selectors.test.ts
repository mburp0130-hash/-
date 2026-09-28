import { describe, expect, it } from 'vitest';
import { unlockedNotesFor } from '../state/selectors';
import { formatWorldlineNumber } from '../utils/format';
import { INITIAL_PROGRESS } from '../utils/storage';

describe('selectors', () => {
  it('관측 세계선 발견 시 다른 선택지에 노트가 열린다', () => {
    const p = {
      ...INITIAL_PROGRESS,
      discovered: { wl_origin_observed: { worldlineId: 'wl_origin_observed' as const, number: 1, firstDiscoveredAt: '', timesViewed: 1 } },
    };
    expect(unlockedNotesFor(p, 'warn_defenders')).toHaveLength(1);
    expect(unlockedNotesFor(p, 'observe')).toHaveLength(0);
  });

  it('formatWorldlineNumber', () => {
    expect(formatWorldlineNumber(3)).toBe('WORLDLINE 03');
  });
});
