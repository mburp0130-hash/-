// ---------- Data ----------

/** 모든 텍스트의 인식론적 지위. UI 배지와 1:1 대응. */
export type EpistemicLabel =
  | 'historical_fact'
  | 'player_intervention'
  | 'simulated_consequence'
  | 'speculative_outcome';

export type Certainty = 'established' | 'estimate' | 'disputed';

export type Category = 'politics' | 'trade' | 'technology' | 'culture' | 'powers';

export type ChoiceId = 'warn_defenders' | 'silence_guns' | 'observe';
export type WorldlineId = 'wl_walls_held' | 'wl_silent_guns' | 'wl_origin_observed';
export type MetricId =
  | 'bosporus_city'
  | 'east_med_power'
  | 'trade_center'
  | 'orthodox_center'
  | 'world_order';

export const ERA_YEARS = [1453, 1500, 1600, 1800, 1900, 2026] as const;
export type EraYear = (typeof ERA_YEARS)[number];

export interface LabeledText {
  text: string;
  label: EpistemicLabel;
  certainty?: Certainty;
}

export interface HistoricalEvent {
  id: 'constantinople_1453';
  title: string;
  titleEn: string;
  dateLabel: string;
  isoDate: string;
  year: 1453;
  place: string;
  placeKo: string;
  arrivalLine: string;
  contextFacts: LabeledText[];
  originalOutcome: LabeledText;
  sourcesNote: string[];
}

export interface Choice {
  id: ChoiceId;
  order: number;
  kind: 'intervention' | 'observation';
  title: string;
  titleEn: string;
  summary: string;
  detail: string;
  ctaLabel: string;
  teaserQuestion: string;
  worldlineId: WorldlineId;
}

export interface TimelineEntry extends LabeledText {
  category: Category;
}

export interface Era {
  year: EraYear;
  divergence: number;
  headline: LabeledText;
  entries: TimelineEntry[];
  originalHistory: LabeledText | null;
}

export interface ButterflyNode {
  id: string;
  year: number | null;
  text: string;
  label: EpistemicLabel;
}

export interface WorldSnapshot2026 {
  headline: LabeledText;
  summary: LabeledText;
  bulletinsTitle: string;
  bulletins: LabeledText[];
}

export interface MetricValue {
  text: string;
  index: number;
  label: EpistemicLabel;
}

export interface ComparisonMetricDef {
  id: MetricId;
  label: string;
  indexLabel: string;
  original: MetricValue;
}

export interface TravelerNote {
  choiceId: ChoiceId;
  text: string;
}

export interface Worldline {
  id: WorldlineId;
  choiceId: ChoiceId;
  isOrigin: boolean;
  name: string;
  nameEn: string;
  tagline: string;
  intervention: LabeledText | null;
  timeline: Era[];
  butterfly: ButterflyNode[];
  world2026: WorldSnapshot2026;
  comparison: Record<MetricId, MetricValue>;
  unlocksNotes: TravelerNote[];
}

export interface EventPack {
  schemaVersion: 1;
  event: HistoricalEvent;
  choices: Choice[];
  metrics: ComparisonMetricDef[];
  worldlines: Worldline[];
}

// ---------- State ----------

export type ScreenId =
  | 'title'
  | 'intro'
  | 'event'
  | 'context'
  | 'choice'
  | 'timeline'
  | 'butterfly'
  | 'result'
  | 'archive'
  | 'complete';

export interface WarpState {
  fromYear: number;
  toYear: number;
  mode: 'forward' | 'rewind';
  next: ScreenId;
}

export interface DiscoveryRecord {
  worldlineId: WorldlineId;
  number: number;
  firstDiscoveredAt: string;
  timesViewed: number;
}

export interface PersistedProgress {
  version: 1;
  hasSeenIntro: boolean;
  discovered: Partial<Record<WorldlineId, DiscoveryRecord>>;
  totalRuns: number;
  loopsStarted: number;
  firstPlayedAt: string | null;
  lastPlayedAt: string | null;
  completedAllAt: string | null;
}

export type ResultMode = 'fresh' | 'revisit' | 'archive';

export interface GameState {
  screen: ScreenId;
  warp: WarpState | null;
  selectedChoiceId: ChoiceId | null;
  activeWorldlineId: WorldlineId | null;
  timelineIndex: number;
  resultMode: ResultMode;
  justCompletedAll: boolean;
  runStartedAt: number | null;
  /** Choice 화면 진입이 루프(RETURN TO THE PAST)로 인한 것인지 — 분석용 */
  isLoop: boolean;
  progress: PersistedProgress;
}

export type GameAction =
  | { type: 'BEGIN' }
  | { type: 'CONTINUE' }
  | { type: 'INTRO_DONE'; skipped: boolean }
  | { type: 'WARP_DONE' }
  | { type: 'EVENT_DONE' }
  | { type: 'CONTEXT_DONE' }
  | { type: 'SELECT_CHOICE'; choiceId: ChoiceId }
  | { type: 'CONFIRM_CHOICE'; now: number; nowIso: string }
  | { type: 'TIMELINE_NEXT' }
  | { type: 'TIMELINE_SKIP' }
  | { type: 'TIMELINE_DONE' }
  | { type: 'BUTTERFLY_DONE'; nowIso: string }
  | { type: 'RETURN_TO_PAST'; preselect?: ChoiceId }
  | { type: 'OPEN_ARCHIVE' }
  | { type: 'VIEW_ARCHIVED'; worldlineId: WorldlineId }
  | { type: 'OPEN_COMPLETE' }
  | { type: 'GO_TITLE' }
  | { type: 'RESET_PROGRESS' };
