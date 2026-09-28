import { ERA_YEARS, type EventPack, type LabeledText } from '../types/game';

const LIMITS = {
  headline: 20,
  entry: 45,
  originalHistory: 45,
  butterfly: 20,
  bulletin: 32,
  metric: 40,
  note: 60,
  summary: 40,
  detail: 120,
};

/** 데이터 규칙 위반 목록을 반환한다. 빈 배열이면 유효. (명세 §G-3) */
export function validateEventPack(pack: EventPack): string[] {
  const errors: string[] = [];
  const err = (msg: string) => errors.push(msg);
  const tooLong = (where: string, text: string, max: number) => {
    if (text.length > max) err(`${where}: 길이 ${text.length} > ${max}`);
  };

  // 1. counts & ids
  if (pack.choices.length !== 3) err('choices는 3개여야 한다');
  if (pack.worldlines.length !== 3) err('worldlines는 3개여야 한다');
  if (pack.metrics.length !== 5) err('metrics는 5개여야 한다');
  const unique = (ids: string[], what: string) => {
    if (new Set(ids).size !== ids.length) err(`${what} id 중복`);
  };
  unique(pack.choices.map((c) => c.id), 'choice');
  unique(pack.worldlines.map((w) => w.id), 'worldline');
  unique(pack.metrics.map((m) => m.id), 'metric');
  for (const c of pack.choices) {
    const w = pack.worldlines.find((x) => x.id === c.worldlineId);
    if (!w || w.choiceId !== c.id) err(`choice ${c.id} ↔ worldline 불일치`);
    tooLong(`choice ${c.id} summary`, c.summary, LIMITS.summary);
    tooLong(`choice ${c.id} detail`, c.detail, LIMITS.detail);
  }

  // 2. facts
  const mustBeFact = (where: string, t: LabeledText | { label: string }) => {
    if (t.label !== 'historical_fact') err(`${where}: historical_fact 이어야 한다`);
  };
  pack.event.contextFacts.forEach((f, i) => mustBeFact(`contextFacts[${i}]`, f));
  mustBeFact('originalOutcome', pack.event.originalOutcome);
  pack.metrics.forEach((m) => {
    mustBeFact(`metric ${m.id} original`, m.original);
    tooLong(`metric ${m.id} original`, m.original.text, LIMITS.metric);
  });

  for (const w of pack.worldlines) {
    const p = `worldline ${w.id}`;
    const allTexts: { where: string; t: { label: string } }[] = [];

    // 3. timeline
    if (w.timeline.length !== ERA_YEARS.length) err(`${p}: timeline은 ${ERA_YEARS.length}개여야 한다`);
    let prevDiv = -1;
    w.timeline.forEach((era, i) => {
      const ep = `${p} era ${era.year}`;
      if (era.year !== ERA_YEARS[i]) err(`${ep}: 연도 순서 불일치`);
      if (era.divergence < 0 || era.divergence > 100) err(`${ep}: divergence 범위`);
      if (era.divergence < prevDiv) err(`${ep}: divergence 감소`);
      prevDiv = era.divergence;
      if (era.entries.length < 1 || era.entries.length > 3) err(`${ep}: entries 1~3개`);
      tooLong(`${ep} headline`, era.headline.text, LIMITS.headline);
      era.entries.forEach((e) => tooLong(`${ep} entry`, e.text, LIMITS.entry));
      if (era.originalHistory) tooLong(`${ep} originalHistory`, era.originalHistory.text, LIMITS.originalHistory);
      allTexts.push({ where: `${ep} headline`, t: era.headline });
      era.entries.forEach((e, j) => allTexts.push({ where: `${ep} entry[${j}]`, t: e }));

      if (!w.isOrigin) {
        if (!era.originalHistory) err(`${ep}: originalHistory 필요`);
        else mustBeFact(`${ep} originalHistory`, era.originalHistory);
        const texts = [era.headline, ...era.entries];
        if (era.year > 1453 && texts.some((t) => t.label === 'historical_fact'))
          err(`${ep}: 1453 이후 대체 세계선에 historical_fact 금지`);
        if (era.year === 2026 && texts.some((t) => t.label !== 'speculative_outcome'))
          err(`${ep}: 2026은 speculative_outcome만 허용`);
      } else {
        if (era.originalHistory !== null) err(`${ep}: 관측 세계선 originalHistory는 null`);
        if (era.divergence !== 0) err(`${ep}: 관측 세계선 divergence는 0`);
      }
    });

    // butterfly
    if (w.butterfly.length < 5 || w.butterfly.length > 7) err(`${p}: butterfly 5~7개`);
    w.butterfly.forEach((b) => {
      tooLong(`${p} butterfly ${b.id}`, b.text, LIMITS.butterfly);
      allTexts.push({ where: `${p} butterfly ${b.id}`, t: b });
    });
    const last = w.butterfly[w.butterfly.length - 1];
    if (!last || last.year !== 2026) err(`${p}: butterfly 마지막 노드는 2026`);

    // world2026
    const snap = w.world2026;
    if (snap.bulletins.length !== 3) err(`${p}: bulletins 3개`);
    snap.bulletins.forEach((b) => tooLong(`${p} bulletin`, b.text, LIMITS.bulletin));
    const snapTexts = [snap.headline, snap.summary, ...snap.bulletins];

    // comparison
    for (const m of pack.metrics) {
      const v = w.comparison[m.id];
      if (!v) {
        err(`${p}: comparison ${m.id} 없음`);
        continue;
      }
      if (!Number.isInteger(v.index) || v.index < 0 || v.index > 100) err(`${p}: ${m.id} index 범위`);
      tooLong(`${p} comparison ${m.id}`, v.text, LIMITS.metric);
      if (w.isOrigin && (v.text !== m.original.text || v.index !== m.original.index))
        err(`${p}: 관측 세계선 comparison ${m.id}는 original과 같아야 한다`);
    }
    const cmpValues = Object.values(w.comparison);

    // notes
    w.unlocksNotes.forEach((n) => {
      tooLong(`${p} note`, n.text, LIMITS.note);
      if (n.choiceId === w.choiceId) err(`${p}: 자기 자신을 대상으로 한 note`);
    });

    if (!w.isOrigin) {
      if (!w.intervention || w.intervention.label !== 'player_intervention')
        err(`${p}: intervention(player_intervention) 필요`);
      if (w.butterfly[0]?.label !== 'player_intervention') err(`${p}: butterfly 첫 노드는 player_intervention`);
      if (last && last.label !== 'speculative_outcome') err(`${p}: butterfly 마지막 노드는 speculative_outcome`);
      [...snapTexts, ...cmpValues].forEach((t) => {
        if (t.label !== 'speculative_outcome') err(`${p}: 2026/comparison은 speculative_outcome만 허용`);
      });
      // 6. player_intervention 은 intervention + butterfly 첫 노드에서만
      allTexts.forEach(({ where, t }, i) => {
        const isFirstButterfly = where === `${p} butterfly ${w.butterfly[0]?.id}`;
        if (t.label === 'player_intervention' && !isFirstButterfly) err(`${where}: player_intervention 위치 오류 (${i})`);
      });
    } else {
      if (w.intervention !== null) err(`${p}: 관측 세계선 intervention은 null`);
      [...allTexts.map((x) => x.t), ...snapTexts, ...cmpValues].forEach((t) => {
        if (t.label !== 'historical_fact') err(`${p}: 관측 세계선은 historical_fact만 허용`);
      });
    }
  }

  return errors;
}
