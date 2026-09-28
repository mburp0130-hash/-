import { describe, expect, it } from 'vitest';
import { ANALYTICS_KEY, BUFFER_LIMIT, track } from '../utils/analytics';

describe('analytics', () => {
  it('공통 속성이 포함된다', () => {
    track('game_started', { entry: 'begin' });
    const events = window.__ONE_CHANGE_EVENTS__!;
    expect(events).toHaveLength(1);
    const props = events[0].props;
    for (const k of ['session_id', 'device_id', 'discovered_count', 'total_runs', 'loops_started', 'is_fast_mode']) {
      expect(props).toHaveProperty(k);
    }
    expect(props.entry).toBe('begin');
  });

  it('LocalStorage 버퍼는 최대 500개', () => {
    for (let i = 0; i < BUFFER_LIMIT + 10; i++) track('timeline_era_viewed', { i });
    const buf = JSON.parse(localStorage.getItem(ANALYTICS_KEY)!);
    expect(buf).toHaveLength(BUFFER_LIMIT);
    expect(buf[buf.length - 1].props.i).toBe(BUFFER_LIMIT + 9);
  });
});
