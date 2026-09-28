import { timingMode } from '../config/timing';
import { safeSet } from './storage';

export type AnalyticsEventName =
  | 'app_opened'
  | 'game_started'
  | 'intro_completed'
  | 'intro_skipped'
  | 'event_viewed'
  | 'context_viewed'
  | 'legend_opened'
  | 'choice_screen_viewed'
  | 'choice_previewed'
  | 'choice_selected'
  | 'timeline_started'
  | 'timeline_era_viewed'
  | 'timeline_skipped'
  | 'timeline_completed'
  | 'butterfly_viewed'
  | 'worldline_saved'
  | 'worldline_viewed'
  | 'comparison_viewed'
  | 'butterfly_expanded'
  | 'loop_started'
  | 'all_worldlines_completed'
  | 'complete_viewed'
  | 'archive_opened'
  | 'archive_worldline_viewed'
  | 'progress_reset'
  | 'session_hidden';

export type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  ts: string;
  props: AnalyticsProps;
}

declare global {
  interface Window {
    __ONE_CHANGE_EVENTS__?: AnalyticsEvent[];
  }
}

export const ANALYTICS_KEY = 'onechange.v1.analytics';
export const DEVICE_KEY = 'onechange.v1.device';
const SESSION_KEY = 'onechange.session';
export const BUFFER_LIMIT = 500;

function uuid(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  } catch {
    // fall through
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

let cachedDeviceId: string | null = null;
let cachedSessionId: string | null = null;

function getDeviceId(): string {
  if (cachedDeviceId) return cachedDeviceId;
  try {
    const raw = window.localStorage.getItem(DEVICE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { deviceId?: string };
      if (parsed.deviceId) return (cachedDeviceId = parsed.deviceId);
    }
  } catch {
    // ignore
  }
  cachedDeviceId = uuid();
  safeSet(DEVICE_KEY, JSON.stringify({ deviceId: cachedDeviceId, createdAt: new Date().toISOString() }));
  return cachedDeviceId;
}

function getSessionId(): string {
  if (cachedSessionId) return cachedSessionId;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { sessionId?: string };
      if (parsed.sessionId) return (cachedSessionId = parsed.sessionId);
    }
  } catch {
    // ignore
  }
  cachedSessionId = uuid();
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify({ sessionId: cachedSessionId, startedAt: new Date().toISOString() }));
  } catch {
    // ignore
  }
  return cachedSessionId;
}

type ContextGetter = () => { discovered_count: number; total_runs: number; loops_started: number };
let contextGetter: ContextGetter = () => ({ discovered_count: 0, total_runs: 0, loops_started: 0 });

/** GameProvider가 현재 진행 상태를 공통 속성으로 제공한다 */
export function setAnalyticsContext(getter: ContextGetter) {
  contextGetter = getter;
}

function appendToBuffer(e: AnalyticsEvent) {
  try {
    const raw = window.localStorage.getItem(ANALYTICS_KEY);
    const arr: AnalyticsEvent[] = raw ? (JSON.parse(raw) as AnalyticsEvent[]) : [];
    arr.push(e);
    const trimmed = arr.length > BUFFER_LIMIT ? arr.slice(arr.length - BUFFER_LIMIT) : arr;
    safeSet(ANALYTICS_KEY, JSON.stringify(trimmed));
  } catch {
    safeSet(ANALYTICS_KEY, JSON.stringify([e]));
  }
}

/** 분석 이벤트 기록. 외부 전송 없음 — 향후 SDK 연결 지점. (명세 §N) */
export function track(name: AnalyticsEventName, props: AnalyticsProps = {}): void {
  const e: AnalyticsEvent = {
    name,
    ts: new Date().toISOString(),
    props: {
      session_id: getSessionId(),
      device_id: getDeviceId(),
      ...contextGetter(),
      is_fast_mode: timingMode.fast,
      ...props,
    },
  };
  if (import.meta.env.DEV && import.meta.env.MODE !== 'test') console.info('[track]', name, e.props);
  if (typeof window !== 'undefined') {
    (window.__ONE_CHANGE_EVENTS__ ??= []).push(e);
    appendToBuffer(e);
  }
}
