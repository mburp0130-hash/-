# ONE CHANGE

> Change one moment. Rewrite the world.

1453년 콘스탄티노폴리스 함락 전야로 돌아가 **단 하나의 선택**을 바꾸고, 1500 → 1600 → 1800 → 1900 → 2026년으로 번지는 연쇄를 관측한 뒤 원래 세계와 비교하는 모바일 우선 웹게임 MVP.

- 기획/개발 명세: [`docs/ONE_CHANGE_MVP_SPEC.md`](docs/ONE_CHANGE_MVP_SPEC.md)
- Codex 실행 프롬프트: [`docs/CODEX_KICKOFF_PROMPT.md`](docs/CODEX_KICKOFF_PROMPT.md)
- 게임 데이터 원본: [`docs/data/constantinople1453.json`](docs/data/constantinople1453.json) (앱은 `src/data/` 의 동일 사본을 사용)

## 실행

Node 20 이상.

```bash
npm install
npm run dev          # http://localhost:5173
```

| 스크립트 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 타입체크 + 프로덕션 빌드 (`dist/`) |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run typecheck` | TypeScript 검사 |
| `npm test` | Vitest 단위/통합 테스트 |
| `npm run test:e2e` | Playwright E2E (dev 서버 자동 실행, 최초 1회 `npx playwright install chromium` 필요) |

### 테스트 / 디버그 모드

- `/?fast=1` — 모든 연출과 자동 진행을 사실상 0초로 줄인다. 3개 세계선 루프를 클릭만으로 수십 초 안에 확인할 수 있다.
- 시스템의 "동작 줄이기(prefers-reduced-motion)" 설정을 따르며, 이때 연도 카운트·분기선 드로우 등은 최종 상태로 즉시 표시된다.
- 분석 이벤트는 외부로 전송되지 않는다. 브라우저 콘솔에서 확인:
  - `window.__ONE_CHANGE_EVENTS__` — 현재 탭의 이벤트 목록
  - `localStorage['onechange.v1.analytics']` — 최근 500개 링버퍼
- 진행 초기화: Title 화면 하단 `진행 초기화`, 또는 `localStorage.removeItem('onechange.v1.progress')`.

## 구조

```
src/
  App.tsx              GameProvider + 화면 라우팅(state.screen) + 시간 이동 오버레이
  config/timing.ts     모든 애니메이션/자동 진행 시간, fast·reduced-motion 처리
  types/game.ts        데이터 스키마 + 상태/액션 타입
  data/                게임 데이터 JSON, 타입 export, UI 문자열(strings.ts)
  state/               순수 리듀서, selector, Context(+LocalStorage 저장)
  hooks/               useCountUp, useAutoAdvance, useInView, useTypewriter …
  utils/               storage, analytics(track), validateEventPack, format
  components/          화면 구성 요소 (TimelineRail, EraCard, WorldComparison …)
  screens/             Title / Intro / Event / Context / Choice / Timeline /
                       Butterfly / Result / Archive / Complete
  test/                Vitest 테스트
e2e/                   Playwright 스모크 테스트
```

역사와 대체역사의 구분: 모든 텍스트는 데이터에서 `historical_fact` / `player_intervention` / `simulated_consequence` / `speculative_outcome` 라벨을 가지며 UI에 `FACT` / `INTERVENTION` / `SIMULATED` / `SPECULATIVE` 배지로 표시된다. 라벨 규칙은 `validateEventPack` 이 테스트와 개발 모드에서 강제한다.

## 알려진 제한사항

- 서비스 워커 없음(오프라인 캐싱 미지원) — manifest만 제공해 홈 화면 추가는 가능.
- 진행 중(타임라인 도중) 새로고침하면 Title부터 다시 시작한다(발견한 세계선은 유지).
- 브라우저 뒤로가기는 게임 흐름과 연결되어 있지 않다.
- Lighthouse 점수 측정, 실제 iOS/Android 기기 테스트는 수행하지 않았다(Chromium 모바일 뷰포트 390×844, 360×640으로만 검증).
- 명세 §C-3 대비 추가된 dev 의존성: `@types/node`(vite/playwright 설정 파일 타입). `@playwright/test` 는 사전 설치된 Chromium 빌드와 맞추기 위해 1.56으로 고정.
