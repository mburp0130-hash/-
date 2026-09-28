import raw from './constantinople1453.json';
import type { Choice, ChoiceId, EventPack, Worldline, WorldlineId } from '../types/game';

export const eventPack = raw as unknown as EventPack;

export const event = eventPack.event;
export const metrics = eventPack.metrics;
export const choices: Choice[] = [...eventPack.choices].sort((a, b) => a.order - b.order);
export const worldlines = eventPack.worldlines;

export const TOTAL_WORLDLINES = worldlines.length;

export function getChoice(id: ChoiceId): Choice {
  const c = eventPack.choices.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown choice ${id}`);
  return c;
}

export function getWorldline(id: WorldlineId): Worldline {
  const w = eventPack.worldlines.find((x) => x.id === id);
  if (!w) throw new Error(`Unknown worldline ${id}`);
  return w;
}

export function isWorldlineId(id: string): id is WorldlineId {
  return eventPack.worldlines.some((w) => w.id === id);
}

export const WORLDLINE_COLOR: Record<WorldlineId, string> = {
  wl_walls_held: 'var(--c-wl-a)',
  wl_silent_guns: 'var(--c-wl-b)',
  wl_origin_observed: 'var(--c-origin)',
};
