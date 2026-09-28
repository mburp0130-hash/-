import { timingMode } from '../config/timing';

/** 연출 생략 여부 (reduced-motion 또는 fast 모드) */
export function useReducedMotion(): boolean {
  return timingMode.reducedMotion || timingMode.fast;
}
