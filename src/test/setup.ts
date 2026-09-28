import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setTimingMode } from '../config/timing';

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.__ONE_CHANGE_EVENTS__ = [];
  setTimingMode({ fast: true, reducedMotion: false });
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
