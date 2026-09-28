import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../App';

const click = async (testId: string) => {
  const el = await screen.findByTestId(testId, {}, { timeout: 3000 });
  await act(async () => {
    fireEvent.click(el);
  });
};

/** Choice 화면에서 선택지를 확정하고 결과 화면까지 진행 */
async function playChoice(choiceId: string, { preselected = false } = {}) {
  await screen.findByTestId('screen-choice', {}, { timeout: 3000 });
  if (!preselected) await click(`choice-${choiceId}`);
  expect(screen.getByTestId(`choice-${choiceId}`)).toHaveAttribute('aria-checked', 'true');
  await click('btn-confirm-choice');
  await screen.findByTestId('screen-timeline', {}, { timeout: 3000 });
  await click('btn-timeline-skip');
  await screen.findByTestId('era-card-2026', {}, { timeout: 3000 });
  await click('btn-timeline-next');
  await screen.findByTestId('screen-butterfly', {}, { timeout: 3000 });
  // 노드가 모두 보인 뒤 CTA
  await act(async () => {
    fireEvent.click(screen.getByTestId('screen-butterfly'));
  });
  await act(async () => new Promise((r) => setTimeout(r, 20)));
  await click('btn-to-result');
  await screen.findByTestId('screen-result', {}, { timeout: 3000 });
}

describe('전체 루프 (fast 모드)', () => {
  it('첫 방문부터 3개 세계선 발견까지', async () => {
    render(<App />);

    // 1회차: Title → Intro(SKIP) → Warp → Event → Context → Choice
    await click('btn-begin');
    await click('btn-intro-skip');
    await screen.findByTestId('screen-event', {}, { timeout: 3000 });
    await click('screen-event');
    await click('btn-to-choice');

    await playChoice('warn_defenders');
    expect(screen.getByTestId('worldline-number')).toHaveTextContent('WORLDLINE 01');
    expect(screen.getByTestId('discovered-count')).toHaveTextContent('1 / 3');
    expect(screen.getByTestId('saved-stamp')).toHaveTextContent('WORLDLINE 01 SAVED');
    expect(screen.getByTestId('disclaimer')).toBeInTheDocument();

    // 2회차: RETURN → Choice (Event/Context 미경유)
    await click('btn-return');
    await screen.findByTestId('screen-choice', {}, { timeout: 3000 });
    expect(screen.queryByTestId('screen-event')).toBeNull();
    expect(screen.getByTestId('choice-warn_defenders')).toHaveTextContent('WORLDLINE 01 · 발견됨');
    await playChoice('silence_guns');
    expect(screen.getByTestId('worldline-number')).toHaveTextContent('WORLDLINE 02');
    expect(screen.getByTestId('discovered-count')).toHaveTextContent('2 / 3');

    // 3회차: teaser 슬롯 → observe 미리 선택
    await click('slot-teaser-observe');
    await playChoice('observe', { preselected: true });
    expect(screen.getByTestId('worldline-number')).toHaveTextContent('WORLDLINE 03');
    expect(screen.getByTestId('discovered-count')).toHaveTextContent('3 / 3');

    await click('btn-complete');
    await screen.findByTestId('screen-complete');

    const names: string[] = window.__ONE_CHANGE_EVENTS__!.map((e) => e.name);
    expect(names.filter((n) => n === 'loop_started')).toHaveLength(2);
    expect(names.filter((n) => n === 'all_worldlines_completed')).toHaveLength(1);
    expect(names.filter((n) => n === 'worldline_viewed')).toHaveLength(3);
    const order = ['game_started', 'choice_selected', 'timeline_completed', 'worldline_saved', 'worldline_viewed'];
    let pos = -1;
    for (const n of order) {
      const i = names.indexOf(n, pos + 1);
      expect(i, n).toBeGreaterThan(pos);
      pos = i;
    }
  });

  it('관측 세계선 발견 후 다른 카드에 NOTE 가 표시된다', async () => {
    render(<App />);
    await click('btn-begin');
    await click('btn-intro-skip');
    await click('screen-event');
    await click('btn-to-choice');
    await playChoice('observe');
    await click('btn-return');
    await screen.findByTestId('screen-choice', {}, { timeout: 3000 });
    expect(screen.getByTestId('note-warn_defenders')).toBeInTheDocument();
    expect(screen.getByTestId('note-silence_guns')).toBeInTheDocument();
  });
});
