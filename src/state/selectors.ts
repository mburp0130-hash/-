import { choices, getWorldline, TOTAL_WORLDLINES } from '../data';
import type { ChoiceId, PersistedProgress, TravelerNote, WorldlineId } from '../types/game';

export const discoveredCount = (p: PersistedProgress) => Object.keys(p.discovered).length;

export const isAllDiscovered = (p: PersistedProgress) => discoveredCount(p) >= TOTAL_WORLDLINES;

export const worldlineNumber = (p: PersistedProgress, id: WorldlineId): number | undefined =>
  p.discovered[id]?.number;

/** 아직 발견되지 않은 세계선이면 다음 예정 번호 */
export const displayNumber = (p: PersistedProgress, id: WorldlineId): number =>
  worldlineNumber(p, id) ?? discoveredCount(p) + 1;

export const isChoiceDiscovered = (p: PersistedProgress, choiceId: ChoiceId): boolean => {
  const c = choices.find((x) => x.id === choiceId);
  return !!c && !!p.discovered[c.worldlineId];
};

export function unlockedNotesFor(p: PersistedProgress, choiceId: ChoiceId): TravelerNote[] {
  const ids = Object.keys(p.discovered) as WorldlineId[];
  return ids
    .sort((a, b) => (p.discovered[a]?.number ?? 0) - (p.discovered[b]?.number ?? 0))
    .flatMap((id) => getWorldline(id).unlocksNotes)
    .filter((n) => n.choiceId === choiceId);
}

export const undiscoveredChoices = (p: PersistedProgress) =>
  choices.filter((c) => !p.discovered[c.worldlineId]);

/** 발견 순서대로 정렬된 세계선 id */
export const discoveredInOrder = (p: PersistedProgress): WorldlineId[] =>
  (Object.keys(p.discovered) as WorldlineId[]).sort(
    (a, b) => (p.discovered[a]?.number ?? 0) - (p.discovered[b]?.number ?? 0),
  );
