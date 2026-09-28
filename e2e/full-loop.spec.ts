import { expect, test, type Page } from '@playwright/test';

async function playChoice(page: Page, choiceId: string, preselected = false) {
  await expect(page.getByTestId('screen-choice')).toBeVisible();
  if (!preselected) await page.getByTestId(`choice-${choiceId}`).click();
  await expect(page.getByTestId(`choice-${choiceId}`)).toHaveAttribute('aria-checked', 'true');
  await page.getByTestId('btn-confirm-choice').click();
  await expect(page.getByTestId('screen-timeline')).toBeVisible();
  await page.getByTestId('btn-timeline-skip').click();
  await expect(page.getByTestId('era-card-2026')).toBeVisible();
  await page.getByTestId('btn-timeline-next').click();
  await expect(page.getByTestId('screen-butterfly')).toBeVisible();
  await expect(page.getByTestId('butterfly-node').last()).toBeVisible();
  await page.getByTestId('btn-to-result').click();
  await expect(page.getByTestId('screen-result')).toBeVisible();
}

async function expectNoHorizontalScroll(page: Page) {
  const w = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(w).toBeLessThanOrEqual(390);
}

test('3개 세계선 전체 루프 + 새로고침 후 진행 유지', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/?fast=1');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByTestId('btn-begin').click();
  await page.getByTestId('btn-intro-skip').click();
  await expect(page.getByTestId('screen-event')).toBeVisible();
  await page.getByTestId('screen-event').click();
  await expect(page.getByTestId('screen-context')).toBeVisible();
  await expectNoHorizontalScroll(page);
  await page.getByTestId('btn-to-choice').click();

  await playChoice(page, 'warn_defenders');
  await expect(page.getByTestId('worldline-counter')).toContainText('1/3');
  await expect(page.getByTestId('worldline-number')).toHaveText('WORLDLINE 01');
  await expect(page.getByTestId('btn-return')).toBeInViewport();
  await expectNoHorizontalScroll(page);

  await page.getByTestId('btn-return').click();
  await playChoice(page, 'silence_guns');
  await expect(page.getByTestId('worldline-counter')).toContainText('2/3');

  await page.getByTestId('slot-teaser-observe').click();
  await playChoice(page, 'observe', true);
  await expect(page.getByTestId('worldline-counter')).toContainText('3/3');
  await page.getByTestId('btn-complete').click();
  await expect(page.getByTestId('screen-complete')).toBeVisible();
  await expectNoHorizontalScroll(page);

  const names: string[] = await page.evaluate(() => window.__ONE_CHANGE_EVENTS__!.map((e) => e.name));
  expect(names.filter((n) => n === 'loop_started')).toHaveLength(2);
  expect(names.filter((n) => n === 'all_worldlines_completed')).toHaveLength(1);

  await page.reload();
  await expect(page.getByTestId('btn-continue')).toBeVisible();
  await expect(page.getByTestId('worldline-counter')).toContainText('3/3');

  expect(errors).toEqual([]);
});

test('Timeline 은 자동 진행으로 2026까지 간다 (fast)', async ({ page }) => {
  await page.goto('/?fast=1');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByTestId('btn-begin').click();
  await page.getByTestId('btn-intro-skip').click();
  await page.getByTestId('screen-event').click();
  await page.getByTestId('btn-to-choice').click();
  await page.getByTestId('choice-silence_guns').click();
  await page.getByTestId('btn-confirm-choice').click();
  await expect(page.getByTestId('era-card-2026')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId('btn-timeline-next')).toHaveText('인과관계 보기');
});

test.describe('prefers-reduced-motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });
  test('연출 없이도 한 루프를 끝까지 완료한다', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByTestId('btn-begin').click();
    await page.getByTestId('btn-intro-skip').click();
    await page.getByTestId('screen-event').click();
    await page.getByTestId('btn-to-choice').click();
    await playChoice(page, 'observe');
    await expect(page.getByTestId('worldline-number')).toHaveText('WORLDLINE 01');
    await page.getByTestId('btn-return').click();
    await expect(page.getByTestId('screen-choice')).toBeVisible();
  });
});
