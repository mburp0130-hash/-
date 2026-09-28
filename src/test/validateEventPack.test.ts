import { describe, expect, it } from 'vitest';
import { eventPack } from '../data';
import type { EventPack } from '../types/game';
import { validateEventPack } from '../utils/validateEventPack';

const clone = (): EventPack => structuredClone(eventPack);

describe('validateEventPack', () => {
  it('실제 데이터는 오류가 없다', () => {
    expect(validateEventPack(eventPack)).toEqual([]);
  });

  it('대체 세계선 1600 시대에 historical_fact 가 있으면 오류', () => {
    const p = clone();
    const wl = p.worldlines.find((w) => !w.isOrigin)!;
    wl.timeline[2].entries[0].label = 'historical_fact';
    expect(validateEventPack(p).length).toBeGreaterThan(0);
  });

  it('timeline 이 5개면 오류', () => {
    const p = clone();
    p.worldlines[0].timeline.pop();
    expect(validateEventPack(p).length).toBeGreaterThan(0);
  });

  it('관측 세계선 comparison index 가 원래 값과 다르면 오류', () => {
    const p = clone();
    const origin = p.worldlines.find((w) => w.isOrigin)!;
    origin.comparison.bosporus_city.index = 10;
    expect(validateEventPack(p).length).toBeGreaterThan(0);
  });

  it('src 데이터는 docs 원본과 동일하다', async () => {
    const docs = await import('../../docs/data/constantinople1453.json');
    expect(JSON.parse(JSON.stringify(docs.default))).toEqual(JSON.parse(JSON.stringify(eventPack)));
  });
});
