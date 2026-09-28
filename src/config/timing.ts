/** 모든 애니메이션 / 자동 진행 시간 (ms). 명세 §K */
export const TIMING = {
  screenFadeOut: 200,
  screenFadeIn: 300,
  warpForward: 1600,
  warpRewind: 1200,
  warpArrivePulse: 200,
  warpFadeOut: 300,
  eventAutoAdvance: 2800,
  typewriterPerChar: 40,
  factStagger: 100,
  divergenceDraw: 700,
  divergenceText: 300,
  yearRoll: 800,
  eraCardIn: 400,
  entryStagger: 120,
  eraAutoAdvance: 4500,
  butterflyConnector: 250,
  butterflyNode: 300,
  butterflyInterval: 450,
  stamp: 350,
  comparisonBar: 800,
  sheet: 250,
} as const;

export type TimingKey = keyof typeof TIMING;

/** 화면 체류가 필요한 자동 진행 값 — fast 모드에서도 0이 아닌 하한을 둔다 */
const AUTO_ADVANCE_KEYS: TimingKey[] = ['eventAutoAdvance', 'eraAutoAdvance'];
/** reduced-motion 에서 즉시 최종 상태로 가는 연출 */
const SKIP_ON_REDUCED: TimingKey[] = [
  'warpForward',
  'warpRewind',
  'yearRoll',
  'divergenceDraw',
  'butterflyConnector',
  'butterflyNode',
  'butterflyInterval',
  'typewriterPerChar',
  'factStagger',
  'entryStagger',
  'comparisonBar',
];

function detectFast(): boolean {
  try {
    return new URLSearchParams(window.location.search).get('fast') === '1';
  } catch {
    return false;
  }
}

function detectReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

export const timingMode = {
  fast: detectFast(),
  reducedMotion: detectReducedMotion(),
};

/** 테스트에서 모드를 강제로 바꿀 때 사용 */
export function setTimingMode(mode: Partial<typeof timingMode>) {
  Object.assign(timingMode, mode);
}

/** 모드가 반영된 시간 값 */
export function t(key: TimingKey): number {
  const base = TIMING[key];
  if (timingMode.fast) return AUTO_ADVANCE_KEYS.includes(key) ? 50 : 0;
  if (timingMode.reducedMotion) {
    if (AUTO_ADVANCE_KEYS.includes(key)) return base;
    if (SKIP_ON_REDUCED.includes(key)) return key === 'warpForward' || key === 'warpRewind' ? 300 : 0;
    return Math.min(base, 150);
  }
  return base;
}
