import { isWorldlineId } from '../data';
import type { DiscoveryRecord, PersistedProgress, WorldlineId } from '../types/game';

export const PROGRESS_KEY = 'onechange.v1.progress';

export const INITIAL_PROGRESS: PersistedProgress = {
  version: 1,
  hasSeenIntro: false,
  discovered: {},
  totalRuns: 0,
  loopsStarted: 0,
  firstPlayedAt: null,
  lastPlayedAt: null,
  completedAllAt: null,
};

export function freshProgress(): PersistedProgress {
  return { ...INITIAL_PROGRESS, discovered: {} };
}

function isValid(p: unknown): p is PersistedProgress {
  if (!p || typeof p !== 'object') return false;
  const o = p as Record<string, unknown>;
  return (
    o.version === 1 &&
    typeof o.hasSeenIntro === 'boolean' &&
    !!o.discovered &&
    typeof o.discovered === 'object' &&
    typeof o.totalRuns === 'number' &&
    typeof o.loopsStarted === 'number'
  );
}

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Safari 프라이빗 모드 등 — 메모리 상태로 계속 진행
  }
}

export function loadProgress(): PersistedProgress {
  const raw = safeGet(PROGRESS_KEY);
  if (raw === null) return freshProgress();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isValid(parsed)) throw new Error('invalid');
    const discovered: Partial<Record<WorldlineId, DiscoveryRecord>> = {};
    for (const [id, rec] of Object.entries(parsed.discovered)) {
      if (isWorldlineId(id) && rec && typeof rec.number === 'number') discovered[id] = rec;
    }
    return {
      ...INITIAL_PROGRESS,
      ...parsed,
      discovered,
    };
  } catch {
    const p = freshProgress();
    saveProgress(p);
    return p;
  }
}

export function saveProgress(p: PersistedProgress): void {
  safeSet(PROGRESS_KEY, JSON.stringify(p));
}

export function resetProgress(): void {
  try {
    window.localStorage.removeItem(PROGRESS_KEY);
  } catch {
    // ignore
  }
}
