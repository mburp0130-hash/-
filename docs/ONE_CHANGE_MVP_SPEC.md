# ONE CHANGE — MVP 개발 명세서 (PRD + Technical Implementation Spec)

> **"Change one moment. Rewrite the world."**
>
> 이 문서는 구현자(Codex)가 추가 질문 없이 바로 구현을 시작할 수 있도록 작성되었다.
> 문서 안의 **MUST / MUST NOT / SHOULD** 는 RFC 2119 의미로 사용한다.
> 이 문서에 명시되지 않은 사소한 결정은 구현자가 합리적으로 내리되, §0의 "제품 불변 원칙"을 절대 바꾸지 않는다.

---

## 목차

- [0. 제품 불변 원칙 (절대 바꾸지 말 것)](#0-제품-불변-원칙-절대-바꾸지-말-것)
- [A. Product Overview](#a-product-overview)
- [B. Core Game Loop](#b-core-game-loop)
- [C. MVP Scope](#c-mvp-scope)
- [D. User Flow](#d-user-flow)
- [E. Screen Specification](#e-screen-specification)
- [F. Game State Model](#f-game-state-model)
- [G. Data Schema](#g-data-schema)
- [H. Folder Structure](#h-folder-structure)
- [I. Component Specification](#i-component-specification)
- [J. Interaction Design](#j-interaction-design)
- [K. Animation Specification](#k-animation-specification)
- [L. Visual Design System](#l-visual-design-system)
- [M. Persistence](#m-persistence)
- [N. Analytics Event Plan](#n-analytics-event-plan)
- [O. Acceptance Criteria](#o-acceptance-criteria)
- [P. Test Cases](#p-test-cases)
- [Q. Implementation Order](#q-implementation-order)
- [부록 1. UI 문자열 표](#부록-1-ui-문자열-표)
- [부록 2. 게임 데이터 원본(JSON)](#부록-2-게임-데이터-원본json)

---

## 0. 제품 불변 원칙 (절대 바꾸지 말 것)

1. **검증 질문은 하나다.** "플레이어가 한 번 결과를 본 뒤, 다시 과거로 돌아가 다른 선택을 해보고 싶어 하는가?" 모든 UX 결정은 **Loop Rate**(첫 결과를 본 사용자 중 과거로 돌아간 비율)를 높이는 쪽으로 내린다.
2. **사건은 1개.** 1453.05.28 콘스탄티노폴리스. 선택지 3개. 세계선 3개.
3. **Interface simple, consequences massive.** 플레이어가 누르는 것은 버튼 몇 개뿐이다. 텍스트 입력 없음.
4. **실제 역사와 대체역사를 절대 섞지 않는다.** 모든 텍스트 조각은 4가지 라벨 중 하나를 데이터에 갖고, UI에 배지로 표시된다: `historical_fact` / `player_intervention` / `simulated_consequence` / `speculative_outcome`.
5. **AI API 없음. 백엔드 없음.** 모든 콘텐츠는 `src/data/constantinople1453.json` 에 미리 정의된다.
6. **모바일 세로 화면 우선.** 기준 뷰포트 390×844, 최소 지원 360×640.
7. **`npm install && npm run dev` 만으로 실행된다.**

---

## A. Product Overview

### A-1. 한 줄 정의
플레이어는 시간여행자가 되어 1453년 콘스탄티노폴리스 함락 전야로 이동해 **단 하나의 개입**을 선택하고, 그 개입이 1500→1600→1800→1900→2026년으로 연쇄되는 모습을 관측한 뒤, 원래 세계와 비교하고, 다시 과거로 돌아가 다른 선택을 한다.

### A-2. 핵심 경험 (플레이어가 느껴야 할 감정 순서)
1. **(0~30초)** "아, 과거에서 하나만 바꾸는 게임이구나." — 규칙 이해.
2. **(선택 시)** "이걸 바꾸면 뭐가 달라질까?" — 기대.
3. **(타임라인)** "어, 점점 벌어지고 있어." — 인과 누적감.
4. **(결과)** "이것 하나 바꿨는데 2026년이 이렇게 된다고?" — 놀라움.
5. **(결과 하단)** "다른 걸 바꾸면 어떻게 될까?" — **재도전 욕구 → RETURN TO THE PAST 탭.**

### A-3. 타깃 / 플랫폼
- 모바일 브라우저(iOS Safari, Android Chrome) 우선, 데스크톱 브라우저에서도 중앙 정렬된 모바일 폭(최대 440px)으로 동작.
- 설치 없는 웹게임. PWA manifest 포함(홈 화면 추가 가능). Service Worker는 MVP 범위 밖.
- 언어: **본문은 한국어**, 스타일 라벨(WORLDLINE 02, RETURN TO THE PAST 등)은 영어. 모든 UI 문자열은 `src/data/strings.ts` 한 곳에 둔다(향후 번역 대비).

### A-4. 플레이 시간 목표
| 구간 | 목표 시간 |
|---|---|
| 타이틀 → 선택 화면 도달 (첫 회) | ≤ 60초 (규칙 이해는 30초 이내) |
| 선택 → 결과 화면 도달 | 약 40~50초 (자동 진행 기준) |
| 결과 화면 체류 | 30~60초 |
| 1회차 총합 | 약 2.5~3분 |
| 2·3회차 (인트로/컨텍스트 생략) | 각 약 1.5분 |
| 3개 세계선 전부 | 약 5~6분 |

---

## B. Core Game Loop

```
[Title]
  ↓ BEGIN
[Intro: 당신은 시간여행자다]   ← 첫 회만 (hasSeenIntro=false)
  ↓
[TimeWarp 2026 → 1453]        ← 전환 애니메이션 오버레이
  ↓
[Event: 1453.05.28 Constantinople]
  ↓
[Context: 역사적 사실 카드 + "원래 역사에서 내일 일어날 일"]
  ↓
[Choice: ONE CHANGE 선택]  ←──────────────────────────────┐
  ↓ CHANGE THIS MOMENT                                     │
[Divergence 연출: WORLDLINE 0X DIVERGED]                   │
  ↓                                                        │
[Timeline: 1453 → 1500 → 1600 → 1800 → 1900 → 2026]        │
  ↓                                                        │
[Butterfly Effect 체인]                                    │
  ↓                                                        │
[Result: Alternative 2026 + Original vs Alternative        │
         + WORLDLINE SAVED + WORLDLINES DISCOVERED n/3]     │
  ↓ RETURN TO THE PAST                                     │
[TimeWarp 2026 → 1453 (역재생)] ──────────────────────────┘
  (3/3 발견 시) → [Complete: 전체 세계선 비교]
```

규칙:
- 2회차부터 `RETURN TO THE PAST` 는 **Intro / Event / Context 를 건너뛰고** TimeWarp 후 곧바로 Choice 화면으로 간다.
- 이미 발견한 선택지도 다시 플레이할 수 있다(세계선 번호는 유지, 새로 발견되지 않음).
- 3개 모두 발견 후에도 루프는 계속 가능하다.

---

## C. MVP Scope

### C-1. 구현할 것 (IN)
| # | 기능 |
|---|---|
| 1 | 타이틀 화면 (첫 방문 / 재방문 분기) |
| 2 | 시간여행자 인트로 3장 (첫 회만, 건너뛰기 가능) |
| 3 | 사건 도착 화면 + 역사 컨텍스트 화면 |
| 4 | 3개 선택지 선택 화면 (발견 여부, 관측 기록(Traveler's Note) 표시) |
| 5 | 세계선 분기 연출 |
| 6 | 6단계 타임라인 시뮬레이션 (자동 진행 + 수동 진행 + 건너뛰기) |
| 7 | 버터플라이 이펙트 체인 화면 |
| 8 | 결과 화면 (2026 스냅샷, 원래 vs 변경 비교 5항목, 세계선 저장, 발견 카운터, RETURN TO THE PAST) |
| 9 | 세계선 아카이브 (발견한 세계선 결과 다시 보기) |
| 10 | 전체 발견 완료 화면 (3/3) |
| 11 | 4종 라벨 배지 + 라벨 범례(바텀시트) + 역사 노트 |
| 12 | LocalStorage 진행 저장 / 초기화 |
| 13 | 분석 이벤트 트래킹 유틸(콘솔 + 메모리 + LocalStorage 버퍼, SDK 없음) |
| 14 | `prefers-reduced-motion` 대응, `?fast=1` 테스트 모드 |
| 15 | PWA manifest + 아이콘 (SVG) |
| 16 | Vitest 단위/통합 테스트, Playwright E2E 스모크 테스트 1개 |

### C-2. 구현하지 않을 것 (OUT) — **MUST NOT**
자유 텍스트 입력 · 실시간 AI 생성 · OpenAI/기타 AI API · 2개 이상의 역사 사건(데이터/라우팅 모두) · 회원가입/로그인/계정 · 백엔드/DB · 결제/인앱결제 · 광고 · 멀티플레이/PvP · 소셜 공유/리더보드 · 실제 지도 API(Mapbox, Google Maps 등) · 세계지도 시각화 · 3D/WebGL/Canvas 게임 엔진 · 복잡한 정치/경제 수치 시뮬레이션 · 캐릭터 육성/아이템/재화 · 사운드/BGM · 다국어 전환 UI · 설정 화면(“진행 초기화” 버튼 1개만 허용) · Service Worker/오프라인 캐싱 · 라우터 라이브러리 · 상태관리 라이브러리(Redux/Zustand 등) · 애니메이션 라이브러리(Framer Motion 등) · UI 컴포넌트 라이브러리.

### C-3. 허용 의존성 (이 목록 외 추가 금지)
- runtime: `react`, `react-dom`
- dev: `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`, `tailwindcss`, `@tailwindcss/vite` (Tailwind v4), `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `@playwright/test`
- Node 20 이상.

### C-4. npm scripts
```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "typecheck": "tsc -b --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test"
}
```

---

## D. User Flow

### D-1. 첫 실행 → 3개 세계선 전부 발견 (정상 경로)

| 단계 | 화면 | 사용자 행동 | 시스템 반응 |
|---|---|---|---|
| 1 | Title | `BEGIN` 탭 | `game_started` 기록. hasSeenIntro=false → Intro |
| 2 | Intro 1/3 | 화면 탭 또는 `다음` | 카드 전환 |
| 3 | Intro 2/3 | 탭 | 카드 전환 |
| 4 | Intro 3/3 | `1453년으로 이동` 탭 | hasSeenIntro=true 저장. TimeWarp(2026→1453) → Event |
| 5 | Event | 대기(2.8초 자동) 또는 탭 | Context로 |
| 6 | Context | 사실 카드 확인 후 `단 하나를 바꿔라` 탭 | Choice로 |
| 7 | Choice | 카드 1개 탭(선택) → 하단 `이 순간을 바꾼다` 탭 | `choice_selected`. Divergence 연출 → Timeline |
| 8 | Timeline | 자동 진행 또는 `다음` / `건너뛰기` | 6개 시대 순서대로 표시 |
| 9 | Timeline(2026) | `인과관계 보기` 탭 | Butterfly로 |
| 10 | Butterfly | 노드 자동 등장, `2026년의 세계 보기` 탭 | 세계선 저장 → Result |
| 11 | Result | 스크롤하며 비교 확인, `RETURN TO THE PAST` 탭 | `loop_started`. TimeWarp(2026→1453 역재생) → Choice |
| 12 | Choice | 발견 안 된 선택지 선택 → 확정 | 7~11 반복 (WORLDLINE 02) |
| 13 | Result (2/3) | `RETURN TO THE PAST` | 반복 (WORLDLINE 03) |
| 14 | Result (3/3) | `전체 세계선 비교` 탭 | `all_worldlines_completed` → Complete |
| 15 | Complete | `TITLE` / `ARCHIVE` / `진행 초기화` | 각각 이동 |

### D-2. 재방문 (진행 중 새로고침 / 다음 날 재접속)
- 앱은 **항상 Title 화면에서 시작**한다(진행 중이던 타임라인은 복구하지 않는다).
- discovered ≥ 1 이면 Title의 주 버튼은 `RETURN TO 1453`(→ TimeWarp → Choice), 보조 버튼은 `ARCHIVE`.
- discovered = 0 이고 hasSeenIntro=true 이면 `BEGIN` → Intro 생략 → TimeWarp → Event → Context → Choice.

### D-3. 결과 화면의 발견되지 않은 슬롯 탭 (루프 지름길)
- Result 화면의 `WorldlineCounter` 에서 **미발견 슬롯**(예: "??? — 만약 대포가 침묵했다면?")을 탭하면 `loop_started(source: "teaser_slot")` 기록 후 TimeWarp → Choice 화면으로 가고, **해당 선택지가 미리 선택된 상태**로 표시된다(확정 버튼은 사용자가 직접 눌러야 함).

### D-4. 아카이브 경로
- Title `ARCHIVE` 또는 Result/Complete의 `ARCHIVE` → Archive 목록 → 항목 탭 → Result 화면(아카이브 모드: 저장 스탬프 애니메이션 없음, 타임라인 재생 없음).

---

## E. Screen Specification

공통 레이아웃 규칙:
- 루트 컨테이너: `min-h-[100dvh]`, 가로 `max-w-[440px] mx-auto`, 좌우 패딩 20px, 상하 safe-area inset 반영(`env(safe-area-inset-*)`).
- 하단 주 버튼(Primary CTA)은 모든 진행형 화면에서 **하단 고정(sticky)**, 높이 56px, 화면 하단에서 16px + safe-area 위.
- 상단 바(TopBar, 높이 48px): 좌측 현재 맥락 라벨(mono, 11px), 우측 `WorldlineCounter` 축약형(`◆◆◇ 2/3`). Title/Intro/Warp에서는 숨김.
- 화면 전환 기본 애니메이션: 이전 화면 opacity 1→0 (200ms), 다음 화면 opacity 0→1 + translateY 8px→0 (300ms). (§K-1)
- 모든 화면 루트 요소에 `data-testid="screen-{screenId}"` 부여.

---

### E-1. Title (`title`)
- **목적:** 게임 정체성 전달 + 한 번의 탭으로 시작.
- **표시 정보:**
  - 상단 작은 라벨: `A TIME-TRAVEL WORLDLINE GAME`
  - 게임명 `ONE CHANGE` (display, 44px, serif)
  - 핵심 문장 `Change one moment. Rewrite the world.` (16px, muted)
  - 한국어 보조문: `과거의 단 한 순간을 바꾸고, 달라진 2026년을 관측하라.`
  - 배경: 가는 가로선 1개(원래 세계선, 회색)에서 중앙 지점에서 amber 선이 비스듬히 갈라지는 정적 SVG (§L-6 WorldlineGlyph).
  - discovered ≥ 1이면: `WORLDLINES DISCOVERED 2 / 3` + 3개 슬롯 아이콘.
- **버튼:**
  - discovered = 0: Primary `BEGIN` (testid `btn-begin`)
  - discovered ≥ 1: Primary `RETURN TO 1453` (testid `btn-continue`), Secondary(텍스트 버튼) `ARCHIVE` (testid `btn-archive`)
  - 최하단 아주 작은 텍스트 버튼 `진행 초기화` — discovered ≥ 1일 때만 표시, `window.confirm("발견한 세계선이 모두 삭제됩니다. 초기화할까요?")` 확인 후 초기화.
- **다음 화면:** BEGIN → (hasSeenIntro ? Warp→Event : Intro). CONTINUE → Warp(역재생) → Choice. ARCHIVE → Archive.
- **애니메이션:** 로고 opacity 0→1 (600ms), 이어서 WorldlineGlyph의 분기선 stroke-dashoffset 드로우 (800ms). 버튼은 로고 후 300ms 지연 등장.

---

### E-2. Intro (`intro`) — 첫 회만
- **목적:** 30초 안에 규칙 이해.
- **구성:** 카드 3장, 한 번에 1장. 상단에 진행 점 `● ○ ○`. 우측 상단 `SKIP` (testid `btn-intro-skip`).

| # | 큰 문장 (24px) | 보조 문장 (15px) | 비주얼 |
|---|---|---|---|
| 1 | 당신은 시간여행자다. | 역사의 결정적 순간으로 이동할 수 있다. | 연도 카운터 `2026` 정적 표시 |
| 2 | 바꿀 수 있는 건 단 하나. | 한 번의 개입이 수백 년의 연쇄를 만든다. | 가로선 1개 → 분기 (WorldlineGlyph 애니메이션) |
| 3 | 바뀐 세계를 관측하고, 다시 돌아가라. | 선택마다 새로운 세계선이 기록된다. 모두 찾아내라. | 슬롯 3개 `◇ ◇ ◇` |

- **사용자 행동:** 카드 영역 탭 = 다음 카드. 좌→우 스와이프 = 이전, 우→좌 스와이프 = 다음(선택 구현, SHOULD). 3번 카드의 Primary 버튼 `1453년으로 이동` (testid `btn-intro-go`).
- **다음 화면:** Warp(2026→1453) → Event.
- **애니메이션:** 카드 전환 시 현재 카드 translateX 0→-24px + opacity→0 (250ms), 새 카드 translateX 24px→0 + opacity 0→1 (300ms).
- 3번째 카드 도달 또는 SKIP 시 `hasSeenIntro=true` 저장.

---

### E-3. TimeWarp 오버레이 (`warp` — 화면이 아닌 전환 오버레이)
- **목적:** 시간 이동을 체감시킨다.
- **표시:** 전체 화면 검정 배경 위 중앙에 거대한 연도(mono, 72px) + 그 아래 작은 라벨 `TRAVELING TO 1453.05.28` 또는 `REWINDING WORLDLINE`.
- **동작:**
  - forward/rewind 모두 연도가 `from → to`로 **정수 보간**되며 변한다. 지속 1600ms(첫 이동), 1200ms(루프 역재생). easing: easeInOutCubic.
  - 배경에 가로 스캔라인(1px, 흰색 6% 투명도)이 위→아래로 반복 이동(CSS keyframes, 400ms 주기).
  - 도착 시 연도 숫자 scale 1→1.06→1 (200ms), 그 후 오버레이 opacity 1→0 (300ms)하며 목적지 화면 노출.
- 사용자 입력 없음(탭해도 스킵되지 않음 — 1.6초 이하이므로). `?fast=1` 에서는 즉시 완료.

---

### E-4. Event (`event`)
- **목적:** "어디에 도착했는가"를 한눈에.
- **표시:**
  - 날짜 스탬프 `1453.05.28` (mono, 40px) — 타이핑 효과 40ms/글자.
  - 장소 `Constantinople` (serif 28px) + `콘스탄티노폴리스` (15px muted)
  - 사건명 `콘스탄티노폴리스 최후의 밤`
  - 도착 문장 (`event.arrivalLine`): `포위 53일째 밤. 오스만군의 총공세까지 몇 시간 남았다.`
  - `FACT` 배지 1개(도착 문장 옆).
- **버튼/행동:** 화면 어디든 탭 또는 2800ms 후 자동 진행. 하단에 작은 안내 `탭하여 계속`.
- **다음:** Context.

---

### E-5. Context (`context`)
- **목적:** 선택에 필요한 최소한의 사실 제공. **퀴즈 아님.**
- **표시:**
  - 제목 `역사 기록` / 라벨 `HISTORICAL RECORD`
  - `event.contextFacts` 4개를 `FactCard`로 세로 나열(각 카드: FACT 배지, certainty가 `estimate`면 `추정`, `disputed`면 `논쟁 있음` 보조 배지).
  - 강조 카드 1개 `원래 역사에서 내일 일어날 일`: `event.originalOutcome.text` (빨간 계열 좌측 보더 3px).
  - 우측 상단 `ⓘ` 버튼 → `LabelLegendSheet`(라벨 4종 설명 + `event.sourcesNote`).
- **버튼:** Primary `단 하나를 바꿔라` (testid `btn-to-choice`).
- **애니메이션:** FactCard 4개 stagger 등장(각 100ms 간격, opacity + translateY 8px, 300ms).
- **다음:** Choice.

---

### E-6. Choice (`choice`)
- **목적:** ONE CHANGE 선택. 루프의 출발점.
- **표시:**
  - 헤더: `1453.05.28 · CONSTANTINOPLE` (mono 11px) / `단 하나를 바꿔라` (h1 24px)
  - 보조문: `당신의 개입은 이 세계선에서 되돌릴 수 없다.`
  - `ChoiceCard` × 3 (`choices[].order` 순서: 경고 → 대포 → 관측). 관측 선택지는 카드 좌측 아이콘을 `◎`, 개입 선택지는 `✦`.
  - 각 카드 상태:
    - **미발견:** 우측 상단 `NEW` 배지(amber).
    - **발견됨:** 우측 상단 `WORLDLINE 02 · 발견됨` 배지(muted), 카드 opacity 0.85.
    - **Traveler's Note:** 해당 choiceId를 대상으로 하는 `unlocksNotes` 가 발견된 세계선에 존재하면 카드 하단에 `📜` 없이 텍스트 라벨 `NOTE` + 노트 문장(13px, italic, amber-muted). 여러 개면 모두 표시(최대 2개).
  - 선택된 카드: 펼쳐져 `detail` 표시, 테두리 amber 2px, scale 1.02. 다른 카드 opacity 0.45.
- **버튼:** 하단 고정 Primary. 미선택 시 disabled + 문구 `선택지를 고르세요`. 선택 시 `choices[].ctaLabel` (`이 순간을 바꾼다` / `지켜본다`) (testid `btn-confirm-choice`).
- **사용자 행동:** 카드 탭 = 선택(다른 카드 탭 시 선택 이동, 같은 카드 재탭 시 유지). 확정 버튼 탭 = 확정.
- **다음:** Divergence 연출(1,000ms, Choice 화면 위 오버레이) → Timeline.
- **Divergence 연출:** 화면 중앙에 WorldlineGlyph 확대판. 회색 가로선에서 amber(관측 선택 시 회색 유지) 선이 갈라지며 draw(700ms) → 텍스트 `WORLDLINE 0X DIVERGED` (관측 선택 시 `WORLDLINE 0X — OBSERVING`) fade-in 300ms.

---

### E-7. Timeline (`timeline`)
- **목적:** 인과관계가 **누적**되는 느낌. 2026으로 즉시 점프 금지.
- **레이아웃 (위→아래):**
  1. `TimelineRail` (높이 64px): 6개 연도 눈금 `1453 1500 1600 1800 1900 2026`. 현재 이전 눈금은 채워진 점, 현재는 amber 링, 이후는 빈 점. 레일 위에 두 개의 선: 원래 세계선(회색 점선, 수평 고정)과 현재 세계선(색상 실선). 현재 세계선은 각 눈금 지점에서 `divergence` 값(0~100)에 비례해 위로 최대 24px 벌어진다(SVG polyline). 관측 세계선은 두 선이 겹친다.
  2. `YearDisplay`: 현재 연도 (mono, 56px). 전 연도→현 연도 카운트 롤링(§K-3).
  3. `EraCard`:
     - 헤드라인 (`headline.text`, 20px) + 라벨 배지
     - 1453 시대 한정: 헤드라인 위에 `InterventionCard`(amber 보더, `INTERVENTION` 배지, `worldline.intervention.text`). 관측 세계선은 `아무것도 바꾸지 않았다. 관측 중.` (FACT 아님, 라벨 없음 시스템 문구).
     - `entries` 1~3개: 카테고리 아이콘 + 텍스트(15px) + 라벨 배지. 카테고리 아이콘: politics `⚖`, trade `⚓`, technology `⚙`, culture `✦`, powers `♜`, 그리고 카테고리 한글명(정치/무역/기술/문화·종교/국가·세력)을 11px로.
     - `originalHistory` 가 있으면 카드 하단 구분선 아래 `원래 역사` 라벨 + 텍스트(13px, muted) + FACT 배지.
  4. 하단 컨트롤: 좌측 텍스트 버튼 `건너뛰기` (testid `btn-timeline-skip`), 우측 Primary `다음` (testid `btn-timeline-next`). 마지막(2026) 시대에서는 Primary 문구 `인과관계 보기` 로 바뀌고 건너뛰기 숨김.
  5. 자동 진행 진행바: Primary 버튼 하단 2px 바가 autoAdvance 시간 동안 0→100% 채워짐.
- **진행 규칙:**
  - 시대 진입 → 연도 롤링 800ms → EraCard 등장 400ms → entries stagger(120ms 간격) → **자동 진행 타이머 4500ms 시작**.
  - 타이머 만료 시 다음 시대로. 마지막 시대(2026)에서는 자동 진행하지 않는다(사용자가 `인과관계 보기` 탭).
  - `다음` 탭 = 즉시 다음 시대(애니메이션 진행 중이어도 즉시).
  - `건너뛰기` 탭 = 2026 시대로 즉시 이동(중간 시대 analytics `timeline_era_viewed` 는 발생 안 함, `timeline_skipped` 발생).
  - EraCard를 **길게 누르는 동안(pointerdown 유지)** 자동 진행 타이머 일시정지(SHOULD).
- **다음:** Butterfly.

---

### E-8. Butterfly (`butterfly`)
- **목적:** 변화의 인과관계를 시각적으로.
- **표시:**
  - 라벨 `BUTTERFLY EFFECT` / 제목 `한 번의 개입이 만든 연쇄` (관측 세계선: `역사를 결정한 연쇄`)
  - `ButterflyEffectChain`: `worldline.butterfly` 노드(5~7개)를 세로로. 각 노드: 좌측 연도(mono 12px), 본문 텍스트(16px), 라벨 배지. 노드 사이 ↓ 커넥터(세로선 24px + 화살촉).
  - 첫 노드(intervention)는 amber 테두리, 마지막 노드(2026)는 cyan 테두리 + 굵게.
- **애니메이션:** 커넥터 draw 250ms → 노드 fade/slide-in 300ms, 노드당 합 450ms 순차. 화면 아무 곳이나 탭하면 전체 즉시 표시.
- **버튼:** 모든 노드 표시 후 Primary 활성화 `2026년의 세계 보기` (testid `btn-to-result`). (표시 전에는 disabled 대신 탭 시 전체 즉시 표시 동작.)
- **다음:** 세계선 저장 처리(§F-4) → Result.

---

### E-9. Result (`result`) — **가장 중요한 화면**
- **목적:** 놀라움 극대화 + 재도전 유도. 텍스트 보고서처럼 보이면 안 된다.
- **레이아웃 (세로 스크롤, 하단 CTA 고정):**

```
┌──────────────────────────────────┐
│ [WORLDLINE 02]  ◆◆◇ 2/3          │ TopBar
├──────────────────────────────────┤
│  ┌ SAVED 스탬프 (회전 -6°) ┐      │ 섹션 1: WorldlineHeader
│  WORLDLINE 02                    │   mono 40px
│  THE WALLS HELD                  │   serif 22px
│  성벽이 버틴 세계                │
│  "도시는 살아남았고, …"          │   tagline
│  ┌─ 당신이 변경한 사건 ────────┐ │
│  │ 1453.05.28 · Constantinople │ │
│  │ ✦ 방어측에 경고를 남긴다   │ │ INTERVENTION 배지
│  └─────────────────────────────┘ │
├──────────────────────────────────┤
│  ALTERNATIVE 2026                │ 섹션 2: World2026Panel
│  이스탄불 대신, 자유시 …  [SPEC] │
│  summary                         │
│  ─ 2026년 이 세계의 가상 뉴스 ─  │
│  • 자유시, 흑해 해운 …  [SPEC]   │
│  • …                             │
├──────────────────────────────────┤
│  ORIGINAL vs ALTERNATIVE         │ 섹션 3: WorldComparison
│  보스포루스의 도시               │
│  원래  이스탄불·1,500만+  ████▉ │
│  변경  자유시·480만       ██▎   │
│  … (5개 지표)                    │
├──────────────────────────────────┤
│  ▸ 인과관계 다시 보기 (접힘)     │ 섹션 4: ButterflyEffectChain compact
├──────────────────────────────────┤
│  WORLDLINES DISCOVERED 2 / 3     │ 섹션 5: WorldlineCounter(full)
│  [01 ◆ 원래의 세계]              │
│  [02 ◆ 성벽이 버틴 세계]         │
│  [?? ◇ 만약 대포가 침묵했다면?]  │ ← 탭 가능 (D-3)
├──────────────────────────────────┤
│  ⓘ 이 세계선은 ONE CHANGE의 가상  │ 섹션 6: Disclaimer
│    시뮬레이션이며 실제 역사가 아님│
├──────────────────────────────────┤
│ [ ⟲ RETURN TO THE PAST        ]  │ 고정 CTA
│        아카이브 보기             │
└──────────────────────────────────┘
```

- **섹션 1 WorldlineHeader:** worldline 번호는 발견 순서(§F-3). 진입 시 `WORLDLINE 0X SAVED` 스탬프 애니메이션(§K-6). 이미 발견했던 선택지를 다시 플레이한 경우 스탬프 문구 `WORLDLINE 0X REVISITED`. 아카이브 모드에서는 스탬프 없음.
- **섹션 2 World2026Panel:** `world2026.headline`(22px), `summary`(15px), `bulletinsTitle` + `bulletins` 3개. 대체 세계선의 bulletin 앞에는 `가상 뉴스` 작은 태그. 관측 세계선은 제목을 `ORIGINAL 2026` 로 표기.
- **섹션 3 WorldComparison:** `metrics` 5개를 행으로. 각 행: 지표명(13px, muted) / `원래` 행(텍스트 + 회색 바, 바 길이 = original.index%) / `변경` 행(텍스트 + 세계선 색 바, 길이 = alternative.index%) / 우측 델타 `▲ +45` / `▼ −30` / `= 0`. 바 아래 아주 작게 `지수: {indexLabel} (게임 내 상대 지수)`. 섹션 제목 옆 범례 `원래 = FACT · 변경 = SPECULATIVE`. 관측 세계선에서는 모든 델타가 `=` 이고 섹션 상단에 `변화 없음 — 이 세계선은 원래 역사와 같다.` 표시.
- **섹션 4:** 접힘 기본. 펼치면 Butterfly 체인(애니메이션 없이 즉시).
- **섹션 5 WorldlineCounter(full):** 3슬롯. 발견 슬롯: 번호 + 이름 + ◆. 미발견 슬롯: `??` + ◇ + 해당 선택지의 `teaserQuestion`, 탭 가능(testid `slot-teaser-{choiceId}`), 은은한 amber 테두리 pulse(2s 주기, reduced-motion 시 없음).
- **섹션 6 Disclaimer:** 대체 세계선: `이 세계선은 ONE CHANGE의 가상 시뮬레이션입니다. FACT 배지가 붙은 내용만 실제 역사입니다.` 관측 세계선: `이 세계선의 모든 내용은 실제 역사입니다.`
- **고정 CTA 규칙:**
  | 상황 | Primary | Secondary(텍스트) |
  |---|---|---|
  | 미발견 남음 | `⟲ RETURN TO THE PAST` (testid `btn-return`) | `아카이브 보기` |
  | 방금 3/3 달성 | `ALL WORLDLINES · 전체 비교 보기` (testid `btn-complete`) | `⟲ RETURN TO THE PAST` |
  | 이미 3/3 상태에서 재방문 | `⟲ RETURN TO THE PAST` | `전체 비교 보기` |
  | 아카이브 모드 | `⟲ RETURN TO THE PAST` | `아카이브로` |
- 고정 CTA 위에 1줄 넛지(12px, amber): 미발견 선택지가 있으면 `아직 {n}개의 세계선이 관측되지 않았다.`
- **다음:** RETURN → Warp(2026→1453, 1200ms, `REWINDING WORLDLINE`) → Choice(선택 초기화, 단 D-3 경로는 preselect).

---

### E-10. Archive (`archive`)
- **목적:** 발견한 세계선 다시 보기 (가벼운 수집감).
- **표시:** 제목 `WORLDLINE ARCHIVE`, 카운터 `2 / 3`. 발견 순서대로 카드: 번호, nameEn, name, 2026 headline, 발견 일시(`YYYY.MM.DD HH:mm`, 로컬). 미발견은 잠긴 카드(`?? · 미관측` + teaserQuestion).
- **버튼:** 카드 탭 → Result(아카이브 모드). 상단 좌측 `← TITLE`. 하단 Primary `⟲ RETURN TO THE PAST`(discovered ≥ 1).
- **애니메이션:** 기본 화면 전환만.

---

### E-11. Complete (`complete`)
- **목적:** 3/3 달성의 보상과 비교 요약. 향후 확장 암시.
- **표시:**
  - `ALL WORLDLINES DISCOVERED` + `3 / 3` (스탬프 애니메이션 재사용)
  - 요약 문장: `같은 밤, 세 개의 선택, 세 개의 2026년.`
  - 4장의 미니 카드(세로): `ORIGIN(실제 역사)` + 발견 세계선 3개. 각 카드: 이름, 2026 headline, 지표 5개를 5칸 미니 바(높이 4px)로.
  - 하단 잠긴 카드 2장(탭 불가, opacity 0.4): `NEXT EVENT · ????` / `COMING LATER`. 데이터 없음, 정적 UI.
- **버튼:** Primary `⟲ RETURN TO THE PAST`, Secondary `ARCHIVE`, 텍스트 버튼 `TITLE`.

---

### E-12. LabelLegendSheet (바텀시트)
- Context/Result의 `ⓘ` 로 열림. 배경 딤(검정 60%), 시트는 아래에서 translateY 100%→0 (250ms). 딤 탭 또는 `닫기`로 닫힘.
- 내용: 라벨 4종 배지 + 설명(부록 1의 `legend.*`), 그리고 `event.sourcesNote` 리스트(`역사 노트` 제목).

---

## F. Game State Model

### F-1. 타입

```ts
// src/types/game.ts (상태 부분)
export type ScreenId =
  | 'title' | 'intro' | 'event' | 'context' | 'choice'
  | 'timeline' | 'butterfly' | 'result' | 'archive' | 'complete';

export interface WarpState {
  fromYear: number;          // 예: 2026
  toYear: number;            // 예: 1453
  mode: 'forward' | 'rewind';
  next: ScreenId;            // 워프 종료 후 이동할 화면
}

export interface DiscoveryRecord {
  worldlineId: WorldlineId;
  number: number;            // 발견 순서 1..3 → "WORLDLINE 01"
  firstDiscoveredAt: string; // ISO
  timesViewed: number;       // 결과 화면 도달 횟수 (아카이브 조회 제외)
}

export interface PersistedProgress {
  version: 1;
  hasSeenIntro: boolean;
  discovered: Partial<Record<WorldlineId, DiscoveryRecord>>;
  totalRuns: number;         // 결과 화면까지 완료한 런 수
  loopsStarted: number;      // RETURN TO THE PAST 횟수
  firstPlayedAt: string | null;
  lastPlayedAt: string | null;
  completedAllAt: string | null;
}

export interface GameState {
  screen: ScreenId;
  warp: WarpState | null;           // null이 아니면 WarpOverlay 표시
  selectedChoiceId: ChoiceId | null; // Choice 화면에서 선택 중/확정된 선택지
  activeWorldlineId: WorldlineId | null; // 시뮬레이션/조회 중인 세계선
  timelineIndex: number;            // 0..5, timeline[index]
  resultMode: 'fresh' | 'revisit' | 'archive'; // 결과 화면 스탬프/CTA 결정
  justCompletedAll: boolean;        // 이번 런에서 3/3 달성했는가
  runStartedAt: number | null;      // performance.now(), 분석용
  progress: PersistedProgress;
}
```

파생 값(상태에 저장하지 않고 selector로 계산 — `src/state/selectors.ts`):
- `currentYear = worldline.timeline[timelineIndex].year`
- `discoveredCount = Object.keys(progress.discovered).length`
- `isAllDiscovered = discoveredCount === 3`
- `worldlineNumber(id) = progress.discovered[id]?.number`
- `unlockedNotesFor(choiceId)` = 발견된 세계선들의 `unlocksNotes` 중 `choiceId` 일치 항목
- `isChoiceDiscovered(choiceId)`

### F-2. 액션 (useReducer)

```ts
export type GameAction =
  | { type: 'BEGIN' }                                  // Title BEGIN
  | { type: 'CONTINUE' }                               // Title RETURN TO 1453
  | { type: 'INTRO_DONE'; skipped: boolean }
  | { type: 'WARP_DONE' }
  | { type: 'EVENT_DONE' }
  | { type: 'CONTEXT_DONE' }
  | { type: 'SELECT_CHOICE'; choiceId: ChoiceId }
  | { type: 'CONFIRM_CHOICE'; now: number }
  | { type: 'TIMELINE_NEXT' }
  | { type: 'TIMELINE_SKIP' }
  | { type: 'TIMELINE_DONE' }                          // 2026에서 "인과관계 보기"
  | { type: 'BUTTERFLY_DONE'; nowIso: string }          // 저장 발생
  | { type: 'RETURN_TO_PAST'; preselect?: ChoiceId }
  | { type: 'OPEN_ARCHIVE' }
  | { type: 'VIEW_ARCHIVED'; worldlineId: WorldlineId }
  | { type: 'OPEN_COMPLETE' }
  | { type: 'GO_TITLE' }
  | { type: 'RESET_PROGRESS' };
```

### F-3. 상태 전이 표

| 액션 | 조건 | 결과 |
|---|---|---|
| BEGIN | !hasSeenIntro | screen=intro |
| BEGIN | hasSeenIntro | warp={2026→1453, forward, next:'event'} |
| INTRO_DONE | — | progress.hasSeenIntro=true; warp={2026→1453, forward, next:'event'} |
| CONTINUE | — | warp={2026→1453, rewind, next:'choice'}; selectedChoiceId=null |
| WARP_DONE | — | screen=warp.next; warp=null |
| EVENT_DONE | — | screen=context |
| CONTEXT_DONE | — | screen=choice |
| SELECT_CHOICE | screen=choice | selectedChoiceId=id |
| CONFIRM_CHOICE | selectedChoiceId≠null | activeWorldlineId=choice.worldlineId; timelineIndex=0; screen=timeline; runStartedAt=now |
| TIMELINE_NEXT | index<5 | timelineIndex+1 |
| TIMELINE_SKIP | — | timelineIndex=5 |
| TIMELINE_DONE | index=5 | screen=butterfly |
| BUTTERFLY_DONE | 미발견 세계선 | discovered[id]={number: discoveredCount+1, firstDiscoveredAt, timesViewed:1}; totalRuns+1; resultMode='fresh'; 발견 후 3개면 completedAllAt=now, justCompletedAll=true; screen=result |
| BUTTERFLY_DONE | 발견된 세계선 | timesViewed+1; totalRuns+1; resultMode='revisit'; justCompletedAll=false; screen=result |
| RETURN_TO_PAST | — | loopsStarted+1; selectedChoiceId=preselect??null; activeWorldlineId=null; warp={2026→1453, rewind, next:'choice'} |
| OPEN_ARCHIVE | — | screen=archive |
| VIEW_ARCHIVED | 발견됨 | activeWorldlineId=id; resultMode='archive'; justCompletedAll=false; screen=result |
| OPEN_COMPLETE | — | screen=complete |
| GO_TITLE | — | screen=title; 휘발성 상태 초기화 |
| RESET_PROGRESS | — | progress=초기값(hasSeenIntro 포함 전부 초기화); screen=title |

- 리듀서는 **순수 함수**여야 한다(시간은 액션 payload로 주입). LocalStorage 저장은 `GameProvider`의 `useEffect([state.progress])` 에서 수행.
- 분석 이벤트는 리듀서 밖(화면 컴포넌트 이벤트 핸들러 또는 `useEffect`)에서 `track()` 호출.

### F-4. 세계선 번호 규칙
- 번호 = **발견 순서** (1..3). 관측(원래 세계) 선택도 세계선 1개로 센다.
- 표시 형식: `WORLDLINE ${String(n).padStart(2,'0')}` → `WORLDLINE 01`.
- Timeline/Butterfly 화면에서 아직 미발견 세계선의 TopBar 라벨은 예정 번호 `WORLDLINE 0{discoveredCount+1}`, 이미 발견된 세계선은 기존 번호.

---

## G. Data Schema

### G-1. 설계 원칙
- 데이터 파일: `src/data/constantinople1453.json` (원본은 이 저장소의 `docs/data/constantinople1453.json`, 부록 2와 동일). **구현자는 이 파일을 그대로 복사한다. 문구 수정 금지(오탈자 제외).**
- 모든 표시 텍스트 조각은 `LabeledText` 형태로 라벨을 갖는다.
- `src/data/index.ts` 가 JSON을 import 하고 `EventPack` 타입으로 캐스팅해 export 한다. 런타임에서는 `import.meta.env.DEV` 일 때 `validateEventPack()` 을 실행해 위반 시 `console.error` + 화면 상단 빨간 배너(DEV만).
- `tsconfig` 에 `"resolveJsonModule": true`.

### G-2. TypeScript Interfaces (그대로 사용)

```ts
// src/types/game.ts (데이터 부분)

/** 모든 텍스트의 인식론적 지위. UI 배지와 1:1 대응. */
export type EpistemicLabel =
  | 'historical_fact'        // 실제 역사 (FACT)
  | 'player_intervention'    // 플레이어의 개입 (INTERVENTION)
  | 'simulated_consequence'  // 개입의 직접적·단기적 게임 내 결과 (SIMULATED)
  | 'speculative_outcome';   // 장기적 추정 결과 (SPECULATIVE)

export type Certainty = 'established' | 'estimate' | 'disputed';

export type Category = 'politics' | 'trade' | 'technology' | 'culture' | 'powers';

export type ChoiceId = 'warn_defenders' | 'silence_guns' | 'observe';
export type WorldlineId = 'wl_walls_held' | 'wl_silent_guns' | 'wl_origin_observed';
export type MetricId =
  | 'bosporus_city' | 'east_med_power' | 'trade_center' | 'orthodox_center' | 'world_order';

export const ERA_YEARS = [1453, 1500, 1600, 1800, 1900, 2026] as const;
export type EraYear = typeof ERA_YEARS[number];

export interface LabeledText {
  text: string;
  label: EpistemicLabel;
  certainty?: Certainty;     // historical_fact에만 사용
}

export interface HistoricalEvent {
  id: 'constantinople_1453';
  title: string;             // "콘스탄티노폴리스 최후의 밤"
  titleEn: string;
  dateLabel: string;         // "1453.05.28"
  isoDate: string;           // "1453-05-28"
  year: 1453;
  place: string;             // "Constantinople"
  placeKo: string;
  arrivalLine: string;
  contextFacts: LabeledText[];   // 모두 historical_fact, 3~4개
  originalOutcome: LabeledText;  // historical_fact
  sourcesNote: string[];         // 역사 노트(바텀시트)
}

export interface Choice {
  id: ChoiceId;
  order: number;             // 표시 순서 1..3
  kind: 'intervention' | 'observation';
  title: string;
  titleEn: string;
  summary: string;           // ≤ 40자
  detail: string;            // ≤ 120자, 선택 시 펼침
  ctaLabel: string;          // 확정 버튼 문구
  teaserQuestion: string;    // 미발견 슬롯에 표시
  worldlineId: WorldlineId;
}

export interface TimelineEntry extends LabeledText {
  category: Category;
}

export interface Era {
  year: EraYear;
  divergence: number;                 // 0~100, TimelineRail 벌어짐
  headline: LabeledText;              // ≤ 20자
  entries: TimelineEntry[];           // 1~3개, 각 ≤ 45자
  originalHistory: LabeledText | null;// 대체 세계선: 필수(historical_fact), 관측 세계선: null
}

export interface ButterflyNode {
  id: string;
  year: number | null;
  text: string;                       // ≤ 20자
  label: EpistemicLabel;
}

export interface WorldSnapshot2026 {
  headline: LabeledText;
  summary: LabeledText;
  bulletinsTitle: string;
  bulletins: LabeledText[];           // 정확히 3개, 각 ≤ 32자
}

export interface MetricValue {
  text: string;                       // ≤ 40자
  index: number;                      // 0~100 게임 내 상대 지수
  label: EpistemicLabel;
}

export interface ComparisonMetricDef {
  id: MetricId;
  label: string;                      // "보스포루스의 도시"
  indexLabel: string;                 // "도시 규모"
  original: MetricValue;              // historical_fact
}

export interface TravelerNote {
  choiceId: ChoiceId;                 // 이 노트가 표시될 선택지 카드
  text: string;                       // ≤ 60자
}

export interface Worldline {
  id: WorldlineId;
  choiceId: ChoiceId;
  isOrigin: boolean;                  // 관측(원래 역사) 세계선 여부
  name: string;
  nameEn: string;
  tagline: string;
  intervention: LabeledText | null;   // player_intervention, 관측은 null
  timeline: Era[];                    // 정확히 6개, ERA_YEARS 순서
  butterfly: ButterflyNode[];         // 5~7개
  world2026: WorldSnapshot2026;
  comparison: Record<MetricId, MetricValue>;
  unlocksNotes: TravelerNote[];
}

export interface EventPack {
  schemaVersion: 1;
  event: HistoricalEvent;
  choices: Choice[];                  // 정확히 3개
  metrics: ComparisonMetricDef[];     // 정확히 5개
  worldlines: Worldline[];            // 정확히 3개
}
```

### G-3. 라벨 사용 규칙 (validateEventPack이 강제)
`src/utils/validateEventPack.ts` 는 `string[]`(오류 목록)을 반환한다. 다음을 모두 검사한다.

1. choices 3개, worldlines 3개, metrics 5개. 모든 id 고유. `choice.worldlineId` ↔ `worldline.choiceId` 상호 일치.
2. `event.contextFacts[*].label`, `event.originalOutcome.label`, `metrics[*].original.label` 은 모두 `historical_fact`.
3. 각 worldline.timeline 은 정확히 6개이고 year 가 `ERA_YEARS` 와 순서까지 일치. `divergence` 0~100 이며 비감소.
4. **isOrigin=false 세계선:**
   - `intervention` 존재, label=`player_intervention`.
   - 각 Era의 `originalHistory` 존재, label=`historical_fact`.
   - year > 1453 인 Era의 headline/entries 에 `historical_fact` 금지.
   - year = 2026 Era의 headline/entries, `world2026.*`, `comparison.*` 의 label 은 `speculative_outcome` 만 허용.
   - butterfly 첫 노드 label=`player_intervention`, 마지막 노드 year=2026 이고 label=`speculative_outcome`.
5. **isOrigin=true 세계선:** intervention=null, 모든 Era `originalHistory=null`, 모든 텍스트 label=`historical_fact`, `comparison[m]` 의 text/index 가 `metrics[m].original` 과 동일, 모든 Era divergence=0.
6. `player_intervention` 라벨은 intervention 필드와 butterfly 첫 노드에서만 허용.
7. 길이 제한(String.length): headline ≤ 20, entry ≤ 45, originalHistory ≤ 45, butterfly ≤ 20, bulletin ≤ 32, metric text ≤ 40, note ≤ 60, choice.summary ≤ 40, choice.detail ≤ 120.
8. `unlocksNotes[*].choiceId` 는 자기 자신의 choiceId가 아니어야 한다.
9. 모든 `index` 는 0~100 정수.

### G-4. 라벨 → UI 매핑

| label | 배지 텍스트 | 배지 색 | 텍스트 스타일 |
|---|---|---|---|
| historical_fact | `FACT` | `--c-fact` 계열 | 일반 |
| player_intervention | `INTERVENTION` | `--c-intervention` | 일반, 카드 보더 amber |
| simulated_consequence | `SIMULATED` | `--c-simulated` | 일반 |
| speculative_outcome | `SPECULATIVE` | `--c-speculative` | 배지 보더 dashed. 대체 세계선 2026 섹션 카드 보더도 dashed |

---

## H. Folder Structure

프로젝트는 **저장소 루트**에 생성한다(기존 `docs/` 유지).

```
/
├─ docs/                                 # 본 명세서 및 원본 데이터 (수정 금지)
├─ public/
│  ├─ manifest.webmanifest
│  ├─ icon.svg                           # 분기선 글리프 아이콘
│  └─ icon-maskable.svg
├─ e2e/
│  └─ full-loop.spec.ts                  # Playwright 스모크
├─ index.html
├─ package.json
├─ playwright.config.ts
├─ tsconfig.json / tsconfig.app.json / tsconfig.node.json
├─ vite.config.ts                        # react + tailwind 플러그인, vitest 설정 포함
└─ src/
   ├─ main.tsx
   ├─ App.tsx                            # GameProvider + ScreenRouter + WarpOverlay
   ├─ index.css                          # Tailwind import + @theme 토큰 + keyframes
   ├─ config/
   │  └─ timing.ts                       # 모든 애니메이션/자동진행 ms 상수 + fast 모드 배율
   ├─ types/
   │  └─ game.ts                         # §F, §G 타입 전부
   ├─ data/
   │  ├─ constantinople1453.json         # docs/data에서 복사
   │  ├─ index.ts                        # typed export: eventPack, getWorldline, getChoice ...
   │  └─ strings.ts                      # 부록 1 UI 문자열
   ├─ state/
   │  ├─ gameReducer.ts                  # 순수 리듀서 + initialState
   │  ├─ GameContext.tsx                 # Provider, useGame() 훅, 저장 effect
   │  └─ selectors.ts
   ├─ hooks/
   │  ├─ useAutoAdvance.ts               # 일시정지 가능한 타이머
   │  ├─ useCountUp.ts                   # 정수 보간 (rAF)
   │  ├─ useReducedMotion.ts
   │  ├─ useInView.ts                    # IntersectionObserver
   │  └─ useTypewriter.ts
   ├─ utils/
   │  ├─ storage.ts                      # load/save/reset progress (try/catch)
   │  ├─ analytics.ts                    # track(), session id, 버퍼
   │  ├─ validateEventPack.ts
   │  ├─ format.ts                       # formatWorldlineNumber, formatDate
   │  └─ easing.ts
   ├─ components/
   │  ├─ layout/ScreenShell.tsx, TopBar.tsx, StickyCTA.tsx
   │  ├─ ui/Button.tsx, LabelBadge.tsx, Card.tsx, BottomSheet.tsx
   │  ├─ WorldlineGlyph.tsx
   │  ├─ WarpOverlay.tsx
   │  ├─ DivergenceOverlay.tsx
   │  ├─ FactCard.tsx
   │  ├─ HistoricalEventCard.tsx
   │  ├─ ChoiceCard.tsx
   │  ├─ TimelineRail.tsx
   │  ├─ YearDisplay.tsx
   │  ├─ EraCard.tsx
   │  ├─ InterventionCard.tsx
   │  ├─ ButterflyEffectChain.tsx
   │  ├─ WorldlineHeader.tsx
   │  ├─ World2026Panel.tsx
   │  ├─ WorldComparison.tsx
   │  ├─ WorldlineCounter.tsx
   │  ├─ SavedStamp.tsx
   │  ├─ LabelLegendSheet.tsx
   │  └─ Disclaimer.tsx
   ├─ screens/
   │  ├─ TitleScreen.tsx
   │  ├─ IntroScreen.tsx
   │  ├─ EventScreen.tsx
   │  ├─ ContextScreen.tsx
   │  ├─ ChoiceScreen.tsx
   │  ├─ TimelineScreen.tsx
   │  ├─ ButterflyScreen.tsx
   │  ├─ ResultScreen.tsx
   │  ├─ ArchiveScreen.tsx
   │  └─ CompleteScreen.tsx
   └─ test/
      ├─ setup.ts                        # jest-dom, localStorage mock 초기화
      ├─ gameReducer.test.ts
      ├─ selectors.test.ts
      ├─ storage.test.ts
      ├─ validateEventPack.test.ts
      ├─ analytics.test.ts
      └─ flow.test.tsx                   # RTL 통합: 전체 루프 3회
```

라우팅: `App.tsx` 의 `ScreenRouter` 가 `state.screen` 에 따라 `switch` 로 화면 컴포넌트 렌더. URL 변경 없음. 브라우저 뒤로가기는 MVP에서 처리하지 않는다.

---

## I. Component Specification

모든 컴포넌트는 함수형 + props 타입 명시. 스타일은 Tailwind 유틸 + `index.css` 토큰.

| 컴포넌트 | Props | 책임 / 규칙 |
|---|---|---|
| `ScreenShell` | `screenId: ScreenId; topBar?: ReactNode; cta?: ReactNode; children` | 공통 레이아웃, safe-area, `data-testid="screen-{id}"`, 진입 애니메이션(§K-1), 하단 CTA 영역만큼 padding-bottom 확보 |
| `TopBar` | `left: string; showCounter?: boolean` | 48px, 좌측 mono 라벨, 우측 `WorldlineCounter variant="compact"` |
| `StickyCTA` | `primary: {label, onClick, disabled?, testId, progress?: number}; secondary?: {label, onClick, testId}; nudge?: string` | 하단 고정 버튼 영역. `progress`(0~1)가 있으면 버튼 하단 2px 진행바 |
| `Button` | `variant: 'primary'|'secondary'|'text'; ...button props` | primary: amber 배경/검정 텍스트, 56px. secondary: 투명 + 보더. text: 밑줄 없는 muted 텍스트, 최소 44px 터치 영역 |
| `LabelBadge` | `label: EpistemicLabel; size?: 'sm'|'md'` | §G-4 매핑. `aria-label` 한국어 설명(예: "실제 역사") |
| `WorldlineGlyph` | `diverged: boolean; color: string; animate?: boolean; width?: number` | SVG: 회색 수평선 + 중앙에서 분기선. animate 시 stroke-dashoffset 드로우 |
| `WarpOverlay` | `warp: WarpState; onDone(): void` | §E-3, §K-2 |
| `DivergenceOverlay` | `worldlineNumber: number; isOrigin: boolean; onDone(): void` | §E-6 연출 1000ms |
| `HistoricalEventCard` | `event: HistoricalEvent` | Event 화면 본문 (날짜 타이핑, 장소, 도착문) |
| `FactCard` | `fact: LabeledText; emphasis?: 'outcome'` | FACT 배지 + certainty 보조 배지 |
| `ChoiceCard` | `choice: Choice; selected: boolean; dimmed: boolean; discoveredNumber?: number; notes: TravelerNote[]; onSelect()` | §E-6 상태. `role="radio"`, `aria-checked`, 그룹은 `role="radiogroup"`. testid `choice-{id}` |
| `TimelineRail` | `eras: Era[]; currentIndex: number; color: string` | §E-7-1. 두 선 polyline(원래: y 고정, 현재: y = base − divergence×0.24) |
| `YearDisplay` | `year: number; fromYear?: number` | useCountUp으로 롤링. `aria-live="polite"`. testid `year-display` |
| `EraCard` | `era: Era; intervention?: LabeledText|null; isOrigin: boolean; animateIn: boolean` | §E-7-3. key=year로 재마운트해 진입 애니메이션 |
| `InterventionCard` | `intervention: LabeledText|null` | amber 보더 카드 |
| `ButterflyEffectChain` | `nodes: ButterflyNode[]; animated: boolean; onAllShown?(): void` | §E-8. animated=false면 즉시 전체 표시 |
| `WorldlineHeader` | `number: number; worldline: Worldline; choice: Choice; event: HistoricalEvent; stamp: 'saved'|'revisited'|null` | §E-9 섹션 1 |
| `SavedStamp` | `text: string` | §K-6 |
| `World2026Panel` | `snapshot: WorldSnapshot2026; isOrigin: boolean` | §E-9 섹션 2 |
| `WorldComparison` | `metrics: ComparisonMetricDef[]; values: Record<MetricId, MetricValue>; color: string; isOrigin: boolean; onSeen?(): void` | §E-9 섹션 3. useInView로 처음 보일 때 바 애니메이션 + onSeen 1회 |
| `WorldlineCounter` | `variant: 'compact'|'full'; onTeaserClick?(choiceId)` | compact: `◆◆◇ 2/3` (testid `worldline-counter`, 텍스트에 `2/3` 포함). full: 3슬롯(§E-9 섹션 5) |
| `BottomSheet` | `open; onClose; title; children` | §E-12. ESC로 닫힘, 포커스 트랩 불필요(MVP) |
| `LabelLegendSheet` | `open; onClose` | 라벨 범례 + 역사 노트 |
| `Disclaimer` | `isOrigin: boolean` | §E-9 섹션 6 |

세계선 색상(`color` prop) 규칙: `wl_walls_held` = `--c-wl-a`(cyan), `wl_silent_guns` = `--c-wl-b`(violet-pink), `wl_origin_observed` = `--c-origin`(회색). `src/data/index.ts` 에 `WORLDLINE_COLOR: Record<WorldlineId, string>` 로 정의.

---

## J. Interaction Design

1. **입력 수단은 탭뿐이다.** 스와이프는 Intro에서만 선택적(SHOULD). 가로 스크롤 금지.
2. **한 화면 한 결정.** 각 화면의 Primary 버튼은 하나.
3. **터치 타깃** 최소 48×48px. 버튼 간 간격 최소 8px.
4. **탭 피드백:** 모든 버튼/카드 `:active` 시 scale 0.98 (100ms). 햅틱 없음.
5. **중복 탭 방지:** 확정/전환 버튼은 클릭 후 전환 완료까지 `disabled`. 워프/분기 오버레이 중 하위 화면 입력 차단(`pointer-events: none`).
6. **자동 진행:** Event(2800ms), Timeline 시대당(4500ms, 2026 제외). 그 외 화면은 자동 진행 없음.
7. **스킵 가능성:** Intro(SKIP), Event(탭), Timeline(건너뛰기), Butterfly(탭 시 전체 표시). Warp/Divergence 는 짧으므로 스킵 없음.
8. **키보드(데스크톱):** Enter/Space = 현재 Primary, Escape = 바텀시트 닫기. Choice에서 1/2/3 키 = 해당 선택지 선택(SHOULD).
9. **스크롤:** Result/Archive/Complete/Context 만 세로 스크롤. 화면 전환 시 `window.scrollTo(0,0)`.
10. **접근성:** 모든 버튼 텍스트 레이블 존재, 배지에 aria-label, 본문 대비 4.5:1 이상, `lang="ko"`.

---

## K. Animation Specification

구현 방식: **CSS transition/keyframes + 소량의 rAF(useCountUp)**. 애니메이션 라이브러리 금지.
모든 시간 값은 `src/config/timing.ts` 의 상수로 정의하고 `t(ms)` 헬퍼를 거친다:
```ts
// fast 모드(?fast=1): 모든 값 0 (자동진행 포함 → 50ms로 하한). reduced-motion: 트랜지션 150ms 이하로 클램프, 카운트업/드로우 생략.
export const TIMING = {
  screenFadeOut: 200, screenFadeIn: 300,
  warpForward: 1600, warpRewind: 1200, warpArrivePulse: 200, warpFadeOut: 300,
  eventAutoAdvance: 2800, typewriterPerChar: 40,
  factStagger: 100,
  divergenceDraw: 700, divergenceText: 300,
  yearRoll: 800, eraCardIn: 400, entryStagger: 120, eraAutoAdvance: 4500,
  butterflyConnector: 250, butterflyNode: 300,
  stamp: 350, comparisonBar: 800,
  sheet: 250,
} as const;
```

| ID | 대상 | 명세 |
|---|---|---|
| K-1 | 화면 전환 | out: opacity 1→0 200ms ease-in. in: opacity 0→1, translateY 8px→0, 300ms ease-out. |
| K-2 | TimeWarp | 연도 정수 보간 from→to (1600ms forward / 1200ms rewind, easeInOutCubic). 스캔라인 keyframes 400ms linear infinite. 도착 시 scale 1→1.06→1 200ms → 오버레이 opacity 1→0 300ms → `onDone`. |
| K-3 | 연도 롤링 (Timeline) | `useCountUp(prev, next, 800ms, easeOutCubic)` 로 표시 정수 변경. 시작 시 숫자 색 amber → 끝나면 기본색(300ms transition). 동시에 TimelineRail 현재 눈금 링 이동(transition left 800ms). |
| K-4 | EraCard 진입 | 연도 롤링 종료 후: 카드 opacity 0→1 + translateY 16px→0 (400ms). entries 각각 120ms stagger로 opacity 0→1 + translateX −8px→0 (250ms). `originalHistory` 는 마지막 entry 후 200ms에 opacity 0→0.8. |
| K-5 | Divergence | WorldlineGlyph 분기선 stroke-dasharray=길이, dashoffset 길이→0 (700ms ease-out) → `WORLDLINE 0X DIVERGED` opacity 0→1 (300ms). 총 1000ms 후 onDone. |
| K-6 | SavedStamp | opacity 0→1, scale 1.4→1, rotate −6° 고정, 350ms cubic-bezier(.2,.9,.3,1.2). 착지 직후 WorldlineHeader 전체 1회 흔들림 없음(과한 연출 금지). |
| K-7 | Butterfly | 노드 i: 커넥터 높이 0→24px (250ms) → 노드 opacity 0→1 + translateY 8px→0 (300ms). 노드 간 시작 간격 450ms. |
| K-8 | Comparison bar | useInView 최초 진입 시 width 0→index% (800ms ease-out). 원래 바 먼저, 변경 바 150ms 지연. |
| K-9 | Teaser 슬롯 pulse | border-color amber 40%↔100% 2000ms ease-in-out infinite. |
| K-10 | Timeline 자동 진행 바 | width 0→100% linear, duration = eraAutoAdvance. 일시정지 시 `animation-play-state: paused`. |

`prefers-reduced-motion: reduce` 일 때: K-2/K-3/K-5/K-7 은 최종 상태를 즉시 표시(각 화면 체류 최소 300ms는 유지), K-9 비활성, 나머지 트랜지션 150ms 이하.

---

## L. Visual Design System

### L-1. 컬러 토큰 (`src/index.css` 의 Tailwind v4 `@theme`)
다크 테마 단일(라이트 모드 없음). `<meta name="theme-color" content="#07090F">`.

| 토큰 | 값 | 용도 |
|---|---|---|
| `--c-bg` | `#07090F` | 전체 배경 |
| `--c-bg-grid` | `rgba(255,255,255,0.03)` | 배경 격자선(24px 간격, 연대표 문서 느낌) |
| `--c-surface` | `#0F1420` | 카드 |
| `--c-surface-2` | `#161D2E` | 강조 카드/시트 |
| `--c-border` | `#243049` | 기본 보더 |
| `--c-text` | `#E8ECF4` | 본문 |
| `--c-text-muted` | `#8A96AD` | 보조 |
| `--c-text-dim` | `#5A6680` | 비활성 |
| `--c-accent` | `#F2B84B` | 시간 이동/주 버튼/개입 (amber) |
| `--c-danger` | `#E5676A` | "원래 역사에서 내일" 강조 보더 |
| `--c-fact` | `#9FB3C8` | FACT 배지 |
| `--c-intervention` | `#F2B84B` | INTERVENTION 배지 |
| `--c-simulated` | `#4FD1C5` | SIMULATED 배지 |
| `--c-speculative` | `#B794F4` | SPECULATIVE 배지 (dashed) |
| `--c-wl-a` | `#4FD1C5` | 세계선: 성벽이 버틴 세계 |
| `--c-wl-b` | `#F687B3` | 세계선: 대포가 침묵한 세계 |
| `--c-origin` | `#9FB3C8` | 원래 세계 / 원래 값 바 |

배지 스타일: 배경 = 토큰색 12% 투명, 텍스트 = 토큰색, 보더 1px 토큰색 40%, 높이 18px, 패딩 0 6px, radius 4px, 10px mono uppercase, letter-spacing 0.08em.

### L-2. 타이포그래피
외부 폰트 로딩 없음(오프라인/성능).
- `--font-sans`: `system-ui, -apple-system, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif`
- `--font-serif`: `ui-serif, Georgia, "Nanum Myeongjo", "Noto Serif KR", serif` (게임명, 장소명, 세계선 영문명)
- `--font-mono`: `ui-monospace, "SF Mono", Menlo, Consolas, monospace` (연도, 날짜, 라벨, WORLDLINE 번호), `font-variant-numeric: tabular-nums`

| 역할 | 크기/행간/굵기 |
|---|---|
| display (Title 게임명) | 44 / 1.05 / 600 serif, letter-spacing 0.04em |
| year-xl (Warp) | 72 / 1 / 500 mono |
| year-lg (Timeline) | 56 / 1 / 500 mono |
| worldline-no (Result) | 40 / 1 / 600 mono |
| h1 | 24 / 1.3 / 700 |
| h2 | 20 / 1.35 / 700 |
| body | 16 / 1.55 / 400 |
| body-sm | 15 / 1.5 / 400 |
| caption | 13 / 1.45 / 400 |
| label | 11 / 1.2 / 600 mono uppercase, letter-spacing 0.12em |

한국어 줄바꿈: `word-break: keep-all; overflow-wrap: anywhere;`

### L-3. 간격 / 레이아웃
- 4px 기반 스케일: 4, 8, 12, 16, 20, 24, 32, 40, 56.
- 화면 좌우 패딩 20px. 섹션 간 32px. 카드 내부 패딩 16px. 카드 간 12px.
- 콘텐츠 최대 폭 440px, 데스크톱에서는 가운데 정렬 + 좌우 배경 격자만 보임.

### L-4. UI 계층
1. Primary CTA (amber, 화면당 1개)
2. 연도/세계선 번호 (mono 대형)
3. 헤드라인 (h1/h2)
4. 카드 본문
5. 라벨 배지/캡션

### L-5. 카드 스타일
- 기본 카드: `bg-surface`, 1px `border`, radius 12px, 그림자 없음.
- 강조 카드(Intervention/선택됨): 보더 2px amber, 배경 `surface-2`.
- 추정 카드(대체 세계선 World2026Panel): 보더 1px dashed `--c-speculative` 60%.
- 문서 느낌: 카드 좌상단에 mono 라벨(예: `RECORD 01`, `ERA 1600`) 11px dim.

### L-6. 아이콘 / 글리프
- 아이콘 라이브러리 없음. 유니코드 글리프(⚖ ⚓ ⚙ ✦ ♜ ◆ ◇ ◎ ⟲ ▸ ▲ ▼)와 인라인 SVG만 사용.
- `WorldlineGlyph`: viewBox 0 0 200 40. 원래선 `M0 24 H200` (stroke `--c-origin`, 1.5px, dasharray 4 4). 분기선 `M0 24 H90 C120 24 130 8 200 8` (stroke 세계선 색, 2px).
- `public/icon.svg`: 검정 배경 둥근 사각형 + WorldlineGlyph(amber).

### L-7. PWA manifest
```json
{ "name": "ONE CHANGE", "short_name": "ONE CHANGE", "start_url": "/", "display": "standalone",
  "orientation": "portrait", "background_color": "#07090F", "theme_color": "#07090F",
  "icons": [{ "src": "/icon.svg", "sizes": "any", "type": "image/svg+xml" },
            { "src": "/icon-maskable.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "maskable" }] }
```

---

## M. Persistence

### M-1. LocalStorage 키
| 키 | 내용 |
|---|---|
| `onechange.v1.progress` | `PersistedProgress` JSON |
| `onechange.v1.analytics` | 분석 이벤트 링버퍼(최근 500개) JSON 배열 |
| `onechange.v1.device` | `{ deviceId: string, createdAt: string }` (익명 UUID, `crypto.randomUUID()` 없으면 Math.random 기반) |

sessionStorage: `onechange.session` = `{ sessionId, startedAt }` (탭 단위 세션).

### M-2. 초기값
```ts
export const INITIAL_PROGRESS: PersistedProgress = {
  version: 1, hasSeenIntro: false, discovered: {}, totalRuns: 0, loopsStarted: 0,
  firstPlayedAt: null, lastPlayedAt: null, completedAllAt: null,
};
```

### M-3. 규칙
- `loadProgress()`: 키 없음 → INITIAL. JSON 파싱 실패 / `version !== 1` / 필수 필드 누락 → INITIAL 반환 후 해당 키 덮어쓰기. discovered 안의 알 수 없는 worldlineId 는 제거.
- `saveProgress(p)`: progress 변경 시마다 저장. 모든 LocalStorage 접근은 try/catch (Safari 프라이빗 모드 등). 실패 시 메모리 상태로만 계속 진행(에러 UI 없음).
- `resetProgress()`: `onechange.v1.progress` 만 삭제(analytics/device 유지).
- 진행 중 화면 상태(screen, timelineIndex 등)는 **저장하지 않는다.**
- `firstPlayedAt` 은 첫 CONFIRM_CHOICE 시 설정, `lastPlayedAt` 은 매 BUTTERFLY_DONE 시 갱신.

---

## N. Analytics Event Plan

### N-1. 구현
`src/utils/analytics.ts`
```ts
export type AnalyticsEventName = /* N-2의 이름 유니온 */;
export function track(name: AnalyticsEventName, props?: Record<string, string|number|boolean|null>): void
```
- 동작: 공통 속성을 병합해 `{ name, ts: ISO, props }` 생성 → (1) DEV에서 `console.info('[track]', ...)` (2) `window.__ONE_CHANGE_EVENTS__` 배열에 push (3) `onechange.v1.analytics` 링버퍼에 append(최대 500).
- 외부 전송 없음. 향후 SDK 연결 지점은 `track` 한 곳.
- 같은 화면 컴포넌트의 StrictMode 이중 마운트로 인한 중복 이벤트를 막기 위해 화면 진입 이벤트는 `useRef` 가드 사용.

### N-2. 공통 속성 (모든 이벤트)
`session_id`, `device_id`, `discovered_count`(이벤트 시점), `total_runs`, `loops_started`, `is_fast_mode`.

### N-3. 이벤트 목록

| 이벤트 | 발생 시점 | 추가 속성 |
|---|---|---|
| `app_opened` | 앱 마운트 1회 | `is_returning_user`(progress.firstPlayedAt≠null) |
| `game_started` | Title BEGIN 또는 CONTINUE 탭 | `entry: 'begin'|'continue'` |
| `intro_completed` | Intro 3번째 카드에서 이동 | `duration_ms` |
| `intro_skipped` | SKIP 탭 | `at_card: 1|2|3` |
| `event_viewed` | Event 화면 진입 | — |
| `context_viewed` | Context 화면 진입 | — |
| `legend_opened` | ⓘ 탭 | `screen` |
| `choice_screen_viewed` | Choice 진입 | `is_loop: boolean`, `preselected_choice_id` |
| `choice_previewed` | 카드 탭(선택) | `choice_id`, `is_discovered` |
| `choice_selected` | 확정 버튼 | `choice_id`, `worldline_id`, `is_new_worldline`, `run_number`(totalRuns+1), `is_loop` |
| `timeline_started` | Timeline 진입 | `worldline_id` |
| `timeline_era_viewed` | 각 시대 카드 표시 | `worldline_id`, `year`, `via: 'auto'|'tap'|'initial'` |
| `timeline_skipped` | 건너뛰기 | `worldline_id`, `from_year` |
| `timeline_completed` | 2026에서 "인과관계 보기" | `worldline_id`, `duration_ms`, `skipped: boolean` |
| `butterfly_viewed` | Butterfly 진입 | `worldline_id` |
| `worldline_saved` | BUTTERFLY_DONE 처리 직후 | `worldline_id`, `worldline_number`, `is_new_worldline` |
| `worldline_viewed` | Result 진입 (결과 화면 도달) | `worldline_id`, `worldline_number`, `mode: 'fresh'|'revisit'|'archive'`, `run_number`, `run_duration_ms` |
| `comparison_viewed` | WorldComparison 최초 뷰포트 진입 | `worldline_id` |
| `butterfly_expanded` | Result에서 인과관계 펼침 | `worldline_id` |
| `loop_started` | RETURN TO THE PAST (모든 위치) | `source: 'result_cta'|'teaser_slot'|'title'|'archive'|'complete'`, `from_worldline_id`, `target_choice_id`(teaser만) |
| `all_worldlines_completed` | 3번째 신규 발견 시 1회 | `total_runs`, `minutes_since_first_play` |
| `complete_viewed` | Complete 진입 | — |
| `archive_opened` | Archive 진입 | `source` |
| `archive_worldline_viewed` | Archive 카드 탭 | `worldline_id` |
| `progress_reset` | 초기화 확정 | `discovered_count_before` |
| `session_hidden` | `visibilitychange` → hidden | `screen`, `ms_since_open` |

### N-4. 핵심 지표 계산 정의 (향후 분석용, 코드 구현 불필요)
- **최초 플레이 완료율** = `worldline_viewed(run_number=1)` 세션 수 / `game_started` 세션 수
- **결과 화면 도달률** = `worldline_viewed` / `choice_selected`
- **Loop Rate (최우선)** = 첫 `worldline_viewed(run_number=1)` 이후 같은 device에서 `loop_started` 가 1회 이상 발생한 device 비율
- **다른 선택 재시도율** = `choice_selected(is_loop=true, is_new_worldline=true)` device 수 / `loop_started` device 수
- **평균 발견 세계선 수** = device별 최종 `discovered_count` 평균
- **최초 세션 내 2회차 비율** = 같은 `session_id` 안에서 `worldline_viewed` 가 2회 이상인 세션 / `worldline_viewed` ≥1 세션

---

## O. Acceptance Criteria

각 항목은 구현자가 직접 확인 가능한 형태다. 모두 충족해야 MVP 완료.

### O-1. 실행 / 빌드
- [ ] 깨끗한 클론에서 `npm install && npm run dev` 로 실행, 브라우저에서 Title 표시.
- [ ] `npm run build` 경고 외 오류 0. `npm run typecheck` 오류 0. `npm test` 전부 통과.
- [ ] `package.json` 의존성이 §C-3 목록을 벗어나지 않는다.
- [ ] 네트워크 요청은 번들 자산 외 0건(DevTools Network에서 외부 도메인 요청 없음).

### O-2. 데이터 / 역사 구분
- [ ] `src/data/constantinople1453.json` 이 `docs/data/constantinople1453.json` 과 동일하다.
- [ ] `validateEventPack(eventPack)` 가 빈 배열을 반환한다(테스트로 보장).
- [ ] 화면에 표시되는 모든 역사/대체역사 텍스트 조각 옆에 라벨 배지가 있다(UI 문자열·버튼 제외).
- [ ] 대체 세계선의 Timeline 각 시대에 `원래 역사` 줄(FACT)이 표시된다.
- [ ] 대체 세계선 Result 화면에 Disclaimer가 보인다.
- [ ] Context/Result 에서 ⓘ 로 라벨 범례와 역사 노트를 열고 닫을 수 있다.

### O-3. Title / Intro
- [ ] 첫 방문: `BEGIN` → Intro 3장 → Warp → Event.
- [ ] Intro SKIP 동작, 이후 재방문 시 Intro 미표시.
- [ ] discovered ≥ 1 재방문: `RETURN TO 1453` 과 `ARCHIVE` 표시, 카운터 `n / 3` 표시.

### O-4. Event / Context
- [ ] Event 화면은 2.8초 후 자동으로 Context로, 탭 시 즉시 이동.
- [ ] Context에 사실 카드 4개 + 원래 결과 카드 1개.

### O-5. Choice
- [ ] 선택 전 확정 버튼 disabled. 카드 선택 시 활성화되고 해당 `ctaLabel` 표시.
- [ ] 발견된 선택지는 `WORLDLINE 0X · 발견됨`, 미발견은 `NEW` 배지.
- [ ] 관측 세계선 발견 후, 경고/대포 카드에 각 `NOTE` 문장이 나타난다.
- [ ] 확정 시 Divergence 연출(약 1초) 후 Timeline.

### O-6. Timeline
- [ ] 연도가 1453 → 1500 → 1600 → 1800 → 1900 → 2026 순서로 표시되고, 2026으로 즉시 점프하지 않는다(건너뛰기 제외).
- [ ] 각 시대 카드에 헤드라인 + 1~3개 항목 + 라벨 배지.
- [ ] 자동 진행 4.5초, `다음` 즉시 진행, `건너뛰기` 는 2026으로.
- [ ] 2026에서는 자동 진행이 멈추고 `인과관계 보기` 버튼 표시.
- [ ] TimelineRail 에서 대체 세계선 선이 시대가 지날수록 원래 선과 벌어진다. 관측 세계선은 겹친다.

### O-7. Butterfly
- [ ] 노드가 순차 등장, 화면 탭 시 전체 즉시 표시.
- [ ] 첫 노드 INTERVENTION(관측 제외), 마지막 노드 2026.

### O-8. Result (가장 중요)
- [ ] 첫 결과에 `WORLDLINE 01` + `SAVED` 스탬프, 두 번째 신규 결과는 `WORLDLINE 02`.
- [ ] `당신이 변경한 사건 1453.05.28 · Constantinople` + 선택한 선택지 제목 표시.
- [ ] 비교 지표 5개가 원래/변경 텍스트와 바, 델타로 표시.
- [ ] `WORLDLINES DISCOVERED n / 3` 과 미발견 슬롯의 teaserQuestion 표시.
- [ ] 미발견 슬롯 탭 → Warp → Choice에서 해당 선택지가 미리 선택됨.
- [ ] `RETURN TO THE PAST` 는 스크롤 위치와 무관하게 항상 화면 하단에 보인다.
- [ ] RETURN → Warp(역재생) → Choice (Intro/Event/Context 미표시).
- [ ] 같은 선택지 재플레이 시 번호 유지, `REVISITED` 스탬프, 발견 수 증가 없음.

### O-9. Completion / Archive
- [ ] 3번째 신규 발견 결과 화면의 Primary 가 `전체 비교 보기`, 탭 시 Complete.
- [ ] Complete에 원래 세계 + 세계선 3개 요약 카드.
- [ ] Archive에서 발견된 세계선 결과를 다시 볼 수 있고 번호/내용이 동일.

### O-10. Persistence
- [ ] 세계선 2개 발견 후 새로고침 → Title 카운터 `2 / 3`, Choice 배지 유지.
- [ ] LocalStorage 값을 깨진 JSON으로 바꾸고 새로고침해도 크래시 없이 초기 상태로 시작.
- [ ] `진행 초기화` 후 카운터 `0 / 3`, Intro 다시 표시.

### O-11. Analytics
- [ ] 전체 루프 1회 수행 후 `window.__ONE_CHANGE_EVENTS__` 에 `game_started → choice_selected → timeline_completed → worldline_saved → worldline_viewed` 가 순서대로 존재.
- [ ] RETURN 시 `loop_started` 1건, 3/3 시 `all_worldlines_completed` 정확히 1건.
- [ ] 모든 이벤트에 공통 속성(§N-2)이 있다.

### O-12. 모바일 / 품질
- [ ] 360×640, 390×844 뷰포트에서 가로 스크롤 없음, 텍스트 잘림 없음, CTA가 가려지지 않음.
- [ ] Timeline의 한 시대 카드가 390×844에서 스크롤 없이 한 화면에 들어온다.
- [ ] `prefers-reduced-motion` 에서 모든 흐름이 정상 완료된다.
- [ ] `?fast=1` 로 전체 3회 루프를 30초 안에 클릭만으로 완료할 수 있다.
- [ ] 콘솔 에러 0 (DEV 경고 제외).
- [ ] Lighthouse 모바일 Performance ≥ 90 (SHOULD).

---

## P. Test Cases

### P-1. 자동 테스트 (Vitest) — 필수

**validateEventPack.test.ts**
1. 실제 데이터 → 오류 0개.
2. 대체 세계선 1600 Era의 entry label을 `historical_fact` 로 바꾼 복사본 → 오류 1개 이상.
3. timeline 을 5개로 줄인 복사본 → 오류.
4. 관측 세계선 comparison.index 를 바꾼 복사본 → 오류.

**gameReducer.test.ts**
1. 초기 상태에서 BEGIN → `screen='intro'`.
2. hasSeenIntro=true 에서 BEGIN → warp.next='event'.
3. SELECT_CHOICE 없이 CONFIRM_CHOICE → 상태 변화 없음.
4. CONFIRM → TIMELINE_NEXT ×5 → timelineIndex=5, 6번째 NEXT 는 무시.
5. TIMELINE_SKIP → index=5.
6. 첫 BUTTERFLY_DONE → discovered[wl].number=1, totalRuns=1, resultMode='fresh'.
7. 같은 세계선 두 번째 BUTTERFLY_DONE → number 유지=1, timesViewed=2, resultMode='revisit'.
8. 세 세계선 순서대로 완료 → 번호 1,2,3, completedAllAt≠null, 세 번째에만 justCompletedAll=true.
9. RETURN_TO_PAST(preselect='silence_guns') → warp.next='choice', selectedChoiceId='silence_guns', loopsStarted+1.
10. RESET_PROGRESS → progress 가 INITIAL_PROGRESS 와 같음.

**selectors.test.ts**
1. 관측 세계선만 발견 → `unlockedNotesFor('warn_defenders')` 길이 1, `unlockedNotesFor('observe')` 길이 0.
2. `formatWorldlineNumber(3)` → `"WORLDLINE 03"`.

**storage.test.ts**
1. 저장 후 로드 → 동일 객체.
2. 깨진 JSON → INITIAL 반환.
3. version=2 → INITIAL 반환.
4. `localStorage.setItem` 이 throw 해도 saveProgress 가 throw 하지 않음.

**analytics.test.ts**
1. `track('game_started')` → `window.__ONE_CHANGE_EVENTS__` 에 공통 속성 포함 1건.
2. 510건 track → LocalStorage 버퍼 길이 500.

**flow.test.tsx (RTL 통합, fast 모드 타이밍 주입)**
1. 첫 방문 → BEGIN → Intro SKIP → (Warp 완료) → Event 탭 → Context → Choice → `choice-warn_defenders` 선택 → 확정 → Timeline 건너뛰기 → 인과관계 보기 → 2026년의 세계 보기 → Result에 `WORLDLINE 01` 과 `1 / 3`.
2. 이어서 RETURN → Choice (Event/Context 미경유) → `slot` 없이 `choice-silence_guns` → … → `WORLDLINE 02`, `2 / 3`.
3. 이어서 teaser 슬롯(`slot-teaser-observe`) 탭 → Choice에서 observe 가 `aria-checked=true` → 확정 → … → `WORLDLINE 03`, `btn-complete` 존재 → Complete 화면.

### P-2. E2E (Playwright, `e2e/full-loop.spec.ts`) — 필수 1개
- 뷰포트 390×844, URL `/?fast=1`, localStorage 비운 상태.
- flow.test 와 동일한 3회 루프를 실제 브라우저에서 수행.
- 각 Result 에서 `worldline-counter` 텍스트가 `1/3`, `2/3`, `3/3` 로 증가하는지 확인.
- 종료 후 `page.reload()` → Title 에 `btn-continue` 존재, 카운터 `3 / 3`.
- `page.evaluate(() => window.__ONE_CHANGE_EVENTS__.map(e => e.name))` 에 `loop_started` 2건, `all_worldlines_completed` 1건.
- 문서 가로 스크롤 없음: `document.documentElement.scrollWidth <= 390`.
- `playwright.config.ts`: `webServer: { command: 'npm run dev -- --port 5173', port: 5173, reuseExistingServer: true }`. 브라우저 다운로드가 불가능한 환경이면 로컬에 설치된 Chromium 경로를 `launchOptions.executablePath` 로 지정하거나, 불가 시 P-3 수동 체크리스트로 대체하고 그 사실을 보고한다.

### P-3. 수동 테스트 체크리스트
| # | 시나리오 | 기대 결과 |
|---|---|---|
| M1 | 실제 모바일(또는 DevTools 390×844)에서 fast 없이 첫 플레이 | 타이틀→결과까지 약 2.5~3분, 연도 롤링/분기/스탬프 연출 확인 |
| M2 | 첫 30초 안에 게임 방법 이해되는가 (Intro 3장 읽기) | Intro 카드 3장 합계 25초 이내 읽기 가능 |
| M3 | 관측 선택을 **먼저** 플레이 | 결과가 "변화 없음"이지만 이음새 3개 + NOTE 해금 + 미발견 teaser 로 재도전 유도가 명확 |
| M4 | Timeline 에서 아무것도 누르지 않기 | 1453→2026 까지 자동 진행 후 2026에서 멈춤 |
| M5 | Result 에서 즉시 RETURN 연타 | 워프 1회만 발생, 오류 없음 |
| M6 | 결과 도중 새로고침 | Title 로 복귀, 해당 세계선은 발견 상태 유지 |
| M7 | 시스템 설정 "동작 줄이기" ON | 애니메이션 최소화, 흐름 정상 |
| M8 | 데스크톱 1440px 폭 | 440px 중앙 컬럼, 좌우 배경 격자 |
| M9 | Safari 프라이빗 모드 | 저장 실패해도 플레이 가능 |
| M10 | 모든 화면 텍스트 중 라벨 없는 역사 서술이 있는지 육안 점검 | 없음 |

---

## Q. Implementation Order

각 단계 끝에서 `npm run typecheck && npm test` 를 통과시킨 뒤 다음 단계로 간다.

1. **프로젝트 초기화**: Vite React-TS 템플릿을 저장소 루트에 생성(기존 `docs/` 보존). Tailwind v4(`@tailwindcss/vite`), Vitest(jsdom), RTL, Playwright 설치. `index.html`(`lang="ko"`, viewport `width=device-width, initial-scale=1, viewport-fit=cover`, theme-color, manifest 링크). `npm run dev` 확인.
2. **타입 + 데이터**: `src/types/game.ts`, JSON 복사, `src/data/index.ts`, `validateEventPack` + 테스트.
3. **상태**: `gameReducer`, `selectors`, `storage`, `GameContext` + 테스트(P-1 reducer/selectors/storage).
4. **디자인 기초**: `index.css` 토큰/폰트/격자 배경/keyframes, `timing.ts`(fast/reduced-motion), `ScreenShell`, `TopBar`, `StickyCTA`, `Button`, `LabelBadge`, `Card`, `BottomSheet`.
5. **골격 루프(연출 없이)**: 10개 화면을 텍스트/버튼만으로 구현하여 Title → … → Result → RETURN → Choice 루프가 동작하게 한다. `flow.test.tsx` 통과.
6. **핵심 화면 완성**: Choice(배지/NOTE/preselect), Timeline(Rail/YearDisplay/EraCard/자동진행), Butterfly, Result(Header/2026/Comparison/Counter/Disclaimer/CTA 규칙).
7. **연출**: WarpOverlay, DivergenceOverlay, 연도 롤링, stagger, SavedStamp, 비교 바, teaser pulse. reduced-motion 처리.
8. **Archive / Complete / LabelLegendSheet / 진행 초기화.**
9. **Analytics**: `track()` + 전체 이벤트 배치 + analytics 테스트.
10. **PWA manifest/아이콘, 접근성 속성, 키보드.**
11. **E2E + 수동 검증**: Playwright 스모크 실행, 360/390 뷰포트 점검, 콘솔 에러 0, `npm run build` 확인.
12. **README.md** 작성: 실행 방법, 스크립트, 폴더 구조 요약, fast 모드, 분석 이벤트 확인 방법, 알려진 제한사항.

---

## 부록 1. UI 문자열 표

`src/data/strings.ts` 에 아래 키로 정의한다. (게임 콘텐츠 문구는 JSON, UI 문구는 여기.)

```ts
export const S = {
  title: {
    kicker: 'A TIME-TRAVEL WORLDLINE GAME',
    name: 'ONE CHANGE',
    tagline: 'Change one moment. Rewrite the world.',
    taglineKo: '과거의 단 한 순간을 바꾸고, 달라진 2026년을 관측하라.',
    begin: 'BEGIN',
    continue: 'RETURN TO 1453',
    archive: 'ARCHIVE',
    reset: '진행 초기화',
    resetConfirm: '발견한 세계선이 모두 삭제됩니다. 초기화할까요?',
  },
  intro: {
    skip: 'SKIP',
    next: '다음',
    go: '1453년으로 이동',
    cards: [
      { big: '당신은 시간여행자다.', small: '역사의 결정적 순간으로 이동할 수 있다.' },
      { big: '바꿀 수 있는 건 단 하나.', small: '한 번의 개입이 수백 년의 연쇄를 만든다.' },
      { big: '바뀐 세계를 관측하고, 다시 돌아가라.', small: '선택마다 새로운 세계선이 기록된다. 모두 찾아내라.' },
    ],
  },
  warp: { forward: 'TRAVELING TO 1453.05.28', rewind: 'REWINDING WORLDLINE' },
  event: { tapToContinue: '탭하여 계속' },
  context: {
    kicker: 'HISTORICAL RECORD',
    title: '역사 기록',
    outcomeTitle: '원래 역사에서 내일 일어날 일',
    cta: '단 하나를 바꿔라',
    estimate: '추정',
    disputed: '논쟁 있음',
  },
  choice: {
    title: '단 하나를 바꿔라',
    sub: '당신의 개입은 이 세계선에서 되돌릴 수 없다.',
    disabled: '선택지를 고르세요',
    newBadge: 'NEW',
    discoveredBadge: (n: string) => `${n} · 발견됨`,
    note: 'NOTE',
    diverged: (n: string) => `${n} DIVERGED`,
    observing: (n: string) => `${n} — OBSERVING`,
  },
  timeline: {
    next: '다음',
    skip: '건너뛰기',
    toButterfly: '인과관계 보기',
    originalHistory: '원래 역사',
    observing: '아무것도 바꾸지 않았다. 관측 중.',
    categories: { politics: '정치', trade: '무역', technology: '기술', culture: '문화·종교', powers: '국가·세력' },
  },
  butterfly: {
    kicker: 'BUTTERFLY EFFECT',
    title: '한 번의 개입이 만든 연쇄',
    titleOrigin: '역사를 결정한 연쇄',
    cta: '2026년의 세계 보기',
  },
  result: {
    saved: (n: string) => `${n} SAVED`,
    revisited: (n: string) => `${n} REVISITED`,
    changedEvent: '당신이 변경한 사건',
    observedEvent: '당신이 관측한 사건',
    alt2026: 'ALTERNATIVE 2026',
    orig2026: 'ORIGINAL 2026',
    fakeNewsTag: '가상 뉴스',
    compareTitle: 'ORIGINAL vs ALTERNATIVE',
    compareLegend: '원래 = FACT · 변경 = SPECULATIVE',
    original: '원래',
    changed: '변경',
    indexNote: (label: string) => `지수: ${label} (게임 내 상대 지수)`,
    noChange: '변화 없음 — 이 세계선은 원래 역사와 같다.',
    replayChain: '인과관계 다시 보기',
    discovered: 'WORLDLINES DISCOVERED',
    unknown: '??',
    nudge: (n: number) => `아직 ${n}개의 세계선이 관측되지 않았다.`,
    returnCta: '⟲ RETURN TO THE PAST',
    completeCta: 'ALL WORLDLINES · 전체 비교 보기',
    toComplete: '전체 비교 보기',
    toArchive: '아카이브 보기',
    backToArchive: '아카이브로',
    disclaimerAlt: '이 세계선은 ONE CHANGE의 가상 시뮬레이션입니다. FACT 배지가 붙은 내용만 실제 역사입니다.',
    disclaimerOrigin: '이 세계선의 모든 내용은 실제 역사입니다.',
  },
  archive: { title: 'WORLDLINE ARCHIVE', locked: '미관측', back: '← TITLE' },
  complete: {
    title: 'ALL WORLDLINES DISCOVERED',
    sub: '같은 밤, 세 개의 선택, 세 개의 2026년.',
    origin: 'ORIGIN · 실제 역사',
    nextEvent: 'NEXT EVENT · ????',
    later: 'COMING LATER',
    toTitle: 'TITLE',
  },
  legend: {
    title: '기록의 종류',
    historical_fact: '실제로 일어난 역사. 추정치나 논쟁이 있는 경우 따로 표시한다.',
    player_intervention: '시간여행자인 당신이 가한 변화. 실제 역사에는 없다.',
    simulated_consequence: '개입 직후 게임이 계산한 단기적 결과. 실제 역사가 아니다.',
    speculative_outcome: '수십~수백 년 뒤를 추정한 대체역사. 가장 불확실하다.',
    sourcesTitle: '역사 노트',
    close: '닫기',
  },
} as const;
```

---

## 부록 2. 게임 데이터 원본(JSON)

아래 JSON은 `docs/data/constantinople1453.json` 과 동일하다. `src/data/constantinople1453.json` 으로 그대로 복사한다.

```json
{
  "schemaVersion": 1,
  "event": {
    "id": "constantinople_1453",
    "title": "콘스탄티노폴리스 최후의 밤",
    "titleEn": "THE LAST NIGHT OF CONSTANTINOPLE",
    "dateLabel": "1453.05.28",
    "isoDate": "1453-05-28",
    "year": 1453,
    "place": "Constantinople",
    "placeKo": "콘스탄티노폴리스",
    "arrivalLine": "포위 53일째 밤. 오스만군의 총공세까지 몇 시간 남았다.",
    "contextFacts": [
      {
        "text": "1453년 4월 6일, 오스만 술탄 메흐메트 2세의 군대가 도시를 포위했다.",
        "label": "historical_fact",
        "certainty": "established"
      },
      {
        "text": "방어군은 약 7천~8천 명, 공격군은 그 몇 배로 추정된다. 추정치는 사료마다 다르다.",
        "label": "historical_fact",
        "certainty": "estimate"
      },
      {
        "text": "제노바 출신 지휘관 조반니 주스티니아니가 육지 성벽 방어의 핵심을 맡고 있다.",
        "label": "historical_fact",
        "certainty": "established"
      },
      {
        "text": "며칠 전 오스만 진영 회의에서 재상 할릴 파샤는 포위를 풀자고 주장했다.",
        "label": "historical_fact",
        "certainty": "established"
      }
    ],
    "originalOutcome": {
      "text": "원래 역사: 5월 29일 새벽 도시는 함락되고, 황제 콘스탄티노스 11세는 전사한다.",
      "label": "historical_fact",
      "certainty": "established"
    },
    "sourcesNote": [
      "포위 기간(4.6~5.29), 주스티니아니의 부상과 이탈, 할릴 파샤의 철군론은 일반적으로 받아들여지는 역사적 사실이다.",
      "병력 규모는 사료마다 차이가 크므로 '추정'으로 표시한다.",
      "케르코포르타 쪽문이 열려 있었다는 이야기는 후대 연대기(두카스)의 전승이며 논쟁적이다.",
      "대항해시대는 1453년 이전부터 시작되었다. 함락과 대서양 진출의 인과관계는 학계에서 논쟁적이며, 이 게임에서는 '추정 결과'로만 다룬다."
    ]
  },
  "choices": [
    {
      "id": "warn_defenders",
      "order": 1,
      "kind": "intervention",
      "title": "방어측에 경고를 남긴다",
      "titleEn": "WARN THE DEFENDERS",
      "summary": "주스티니아니에게 미래의 쪽지 한 장.",
      "detail": "\"새벽 공세 때 당신이 쓰러지면 성벽이 무너진다. 예비대를 성벽 뒤에 두어라.\" 믿을지는 그들의 몫이다.",
      "ctaLabel": "이 순간을 바꾼다",
      "teaserQuestion": "만약 성벽이 버텼다면?",
      "worldlineId": "wl_walls_held"
    },
    {
      "id": "silence_guns",
      "order": 2,
      "kind": "intervention",
      "title": "오스만의 대포를 침묵시킨다",
      "titleEn": "SILENCE THE GUNS",
      "summary": "포대의 화약 일부를 적셔 총공세를 늦춘다.",
      "detail": "새벽 공세는 대포 포격으로 시작될 예정이다. 화약이 젖으면 공세는 며칠 미뤄진다. 그 며칠이 무엇을 바꿀까?",
      "ctaLabel": "이 순간을 바꾼다",
      "teaserQuestion": "만약 대포가 침묵했다면?",
      "worldlineId": "wl_silent_guns"
    },
    {
      "id": "observe",
      "order": 3,
      "kind": "observation",
      "title": "개입하지 않는다",
      "titleEn": "ONLY OBSERVE",
      "summary": "기록자로서 원래 역사를 끝까지 지켜본다.",
      "detail": "아무것도 바꾸지 않는다. 대신 무엇이 이 도시의 운명을 결정했는지 직접 확인한다. 관측 기록은 다음 개입에 쓸 수 있다.",
      "ctaLabel": "지켜본다",
      "teaserQuestion": "원래 역사에서 결정적 순간은 언제였을까?",
      "worldlineId": "wl_origin_observed"
    }
  ],
  "metrics": [
    {
      "id": "bosporus_city",
      "label": "보스포루스의 도시",
      "indexLabel": "도시 규모",
      "original": { "text": "이스탄불 · 인구 1,500만 명 이상", "index": 95, "label": "historical_fact" }
    },
    {
      "id": "east_med_power",
      "label": "동지중해의 패권",
      "indexLabel": "오스만 영향력",
      "original": { "text": "오스만 제국 (15세기~20세기 초)", "index": 90, "label": "historical_fact" }
    },
    {
      "id": "trade_center",
      "label": "세계 교역의 중심",
      "indexLabel": "지중해 비중",
      "original": { "text": "16세기 이후 대서양·인도양으로 이동", "index": 20, "label": "historical_fact" }
    },
    {
      "id": "orthodox_center",
      "label": "정교회 세계의 중심",
      "indexLabel": "콘스탄티노폴리스의 종교적 영향력",
      "original": { "text": "신자 수 최대는 러시아 정교회, 이스탄불 총대주교청은 명예상 수위", "index": 30, "label": "historical_fact" }
    },
    {
      "id": "world_order",
      "label": "2026 국제질서",
      "indexLabel": "다극성",
      "original": { "text": "미국 중심 질서 · 영어가 사실상 국제 공용어", "index": 45, "label": "historical_fact" }
    }
  ],
  "worldlines": [
    {
      "id": "wl_walls_held",
      "choiceId": "warn_defenders",
      "isOrigin": false,
      "name": "성벽이 버틴 세계",
      "nameEn": "THE WALLS HELD",
      "tagline": "도시는 살아남았고, 신앙의 중심은 옮겨가지 않았다.",
      "intervention": {
        "text": "당신의 쪽지가 새벽 공세 전에 주스티니아니에게 전달된다.",
        "label": "player_intervention"
      },
      "timeline": [
        {
          "year": 1453,
          "divergence": 15,
          "headline": { "text": "총공세가 격퇴되다", "label": "simulated_consequence" },
          "entries": [
            { "category": "politics", "text": "주스티니아니가 부상당하지만 예비대가 곧바로 성벽 틈을 메운다.", "label": "simulated_consequence" },
            { "category": "powers", "text": "5월 29일 정오, 오스만군이 공세를 멈추고 물러난다.", "label": "simulated_consequence" }
          ],
          "originalHistory": { "text": "5월 29일 새벽 도시는 함락되었다.", "label": "historical_fact" }
        },
        {
          "year": 1500,
          "divergence": 30,
          "headline": { "text": "살아남은 도시국가", "label": "simulated_consequence" },
          "entries": [
            { "category": "politics", "text": "메흐메트 2세는 포위를 풀고 에디르네를 수도로 유지한다.", "label": "simulated_consequence" },
            { "category": "trade", "text": "보스포루스는 비잔티움이 통행세를 걷는 국제 항로로 남는다.", "label": "simulated_consequence" },
            { "category": "culture", "text": "그리스 학자들의 대규모 이탈리아 이주는 일어나지 않는다.", "label": "speculative_outcome" }
          ],
          "originalHistory": { "text": "이스탄불이 오스만 제국의 새 수도가 되었다.", "label": "historical_fact" }
        },
        {
          "year": 1600,
          "divergence": 45,
          "headline": { "text": "정교회의 로마", "label": "speculative_outcome" },
          "entries": [
            { "category": "culture", "text": "정교회 세계의 중심은 계속 콘스탄티노폴리스에 머문다.", "label": "speculative_outcome" },
            { "category": "powers", "text": "모스크바의 '제3의 로마' 사상은 힘을 얻지 못한다.", "label": "speculative_outcome" },
            { "category": "powers", "text": "오스만은 도시를 우회해 아나톨리아와 중동으로 확장한다.", "label": "simulated_consequence" }
          ],
          "originalHistory": { "text": "오스만 제국이 헝가리부터 북아프리카까지 지배했다.", "label": "historical_fact" }
        },
        {
          "year": 1800,
          "divergence": 60,
          "headline": { "text": "중립 해협의 시대", "label": "speculative_outcome" },
          "entries": [
            { "category": "politics", "text": "유럽 열강이 해협을 중립 수역으로 정하는 조약을 맺는다.", "label": "speculative_outcome" },
            { "category": "trade", "text": "콘스탄티노폴리스가 흑해 곡물 무역의 금융 중심이 된다.", "label": "speculative_outcome" },
            { "category": "technology", "text": "산업혁명의 증기선이 이 항구를 거쳐 흑해로 퍼진다.", "label": "speculative_outcome" }
          ],
          "originalHistory": { "text": "1798년 나폴레옹의 이집트 원정으로 오스만의 약화가 드러났다.", "label": "historical_fact" }
        },
        {
          "year": 1900,
          "divergence": 70,
          "headline": { "text": "입헌 도시공화국", "label": "speculative_outcome" },
          "entries": [
            { "category": "politics", "text": "황실은 상징으로 남고, 도시공화국 헌법이 제정된다.", "label": "speculative_outcome" },
            { "category": "powers", "text": "오스만 제국은 에디르네·부르사 중심의 개혁 국가로 존속한다.", "label": "speculative_outcome" },
            { "category": "culture", "text": "여러 언어가 공존하는 국제 항구도시로 알려진다.", "label": "speculative_outcome" }
          ],
          "originalHistory": { "text": "오스만 제국은 '유럽의 병자'로 불리며 영토를 잃고 있었다.", "label": "historical_fact" }
        },
        {
          "year": 2026,
          "divergence": 80,
          "headline": { "text": "콘스탄티노폴리스 자유시", "label": "speculative_outcome" },
          "entries": [
            { "category": "powers", "text": "인구 약 480만의 중립 자유시, 세계 5위권 해운 허브.", "label": "speculative_outcome" },
            { "category": "culture", "text": "총대주교청이 2억 명 넘는 정교회 신자의 실질적 중심이다.", "label": "speculative_outcome" },
            { "category": "politics", "text": "'이스탄불'이라는 도시 이름은 존재하지 않는다.", "label": "speculative_outcome" }
          ],
          "originalHistory": { "text": "이스탄불은 인구 1,500만 명 이상의 튀르키예 최대 도시다.", "label": "historical_fact" }
        }
      ],
      "butterfly": [
        { "id": "b1", "year": 1453, "text": "미래에서 온 쪽지", "label": "player_intervention" },
        { "id": "b2", "year": 1453, "text": "예비대가 성벽 틈을 메움", "label": "simulated_consequence" },
        { "id": "b3", "year": 1453, "text": "총공세 격퇴, 포위 해제", "label": "simulated_consequence" },
        { "id": "b4", "year": 1500, "text": "보스포루스가 국제 항로로 남음", "label": "simulated_consequence" },
        { "id": "b5", "year": 1600, "text": "정교회의 중심이 이동하지 않음", "label": "speculative_outcome" },
        { "id": "b6", "year": 2026, "text": "콘스탄티노폴리스 자유시", "label": "speculative_outcome" }
      ],
      "world2026": {
        "headline": { "text": "이스탄불 대신, 자유시 콘스탄티노폴리스", "label": "speculative_outcome" },
        "summary": { "text": "천 년 된 성벽 안쪽은 지금 세계에서 가장 바쁜 중립 항구다.", "label": "speculative_outcome" },
        "bulletinsTitle": "2026년 이 세계의 가상 뉴스",
        "bulletins": [
          { "text": "자유시, 흑해 해운 협정 의장국으로 선출", "label": "speculative_outcome" },
          { "text": "성 소피아 대성당 봉헌 1,489주년 미사 거행", "label": "speculative_outcome" },
          { "text": "해협 통행료 인하 두고 열강 협상 재개", "label": "speculative_outcome" }
        ]
      },
      "comparison": {
        "bosporus_city": { "text": "콘스탄티노폴리스 자유시 · 약 480만 명", "index": 45, "label": "speculative_outcome" },
        "east_med_power": { "text": "어느 한 제국도 독점하지 못함", "index": 55, "label": "speculative_outcome" },
        "trade_center": { "text": "대서양 중심, 흑해 항로의 비중 증가", "index": 30, "label": "speculative_outcome" },
        "orthodox_center": { "text": "콘스탄티노폴리스 총대주교청이 실질적 중심", "index": 90, "label": "speculative_outcome" },
        "world_order": { "text": "원래와 비슷한 다극화, 중립 해협 체제", "index": 50, "label": "speculative_outcome" }
      },
      "unlocksNotes": [
        { "choiceId": "silence_guns", "text": "세계선 기록: 도시를 지켜도 오스만의 확장은 멈추지 않았다. 싸우지 않고 끝낸다면?" },
        { "choiceId": "observe", "text": "세계선 기록: 원래 역사에서 방어선이 무너진 정확한 순간을 확인해 보라." }
      ]
    },
    {
      "id": "wl_silent_guns",
      "choiceId": "silence_guns",
      "isOrigin": false,
      "name": "대포가 침묵한 세계",
      "nameEn": "THE SILENT GUNS",
      "tagline": "며칠의 지연이 바다의 역사를 바꿨다.",
      "intervention": {
        "text": "총공세 전날 밤, 당신은 대포 진지의 화약 일부를 적신다.",
        "label": "player_intervention"
      },
      "timeline": [
        {
          "year": 1453,
          "divergence": 20,
          "headline": { "text": "총공세가 멈추다", "label": "simulated_consequence" },
          "entries": [
            { "category": "technology", "text": "새벽 공세를 여는 포격이 불가능해져 공세가 연기된다.", "label": "simulated_consequence" },
            { "category": "politics", "text": "구원군이 온다는 소문 속에 할릴 파샤의 철군론이 힘을 얻는다.", "label": "simulated_consequence" },
            { "category": "powers", "text": "6월 초, 오스만군이 포위를 풀고 물러난다.", "label": "simulated_consequence" }
          ],
          "originalHistory": { "text": "5월 29일 새벽 도시는 함락되었다.", "label": "historical_fact" }
        },
        {
          "year": 1500,
          "divergence": 35,
          "headline": { "text": "베네치아의 바다", "label": "simulated_consequence" },
          "entries": [
            { "category": "trade", "text": "베네치아가 비잔티움을 보호하는 대가로 동방 교역을 독점한다.", "label": "simulated_consequence" },
            { "category": "powers", "text": "오스만의 서진이 멈추고 헝가리가 발칸의 강국이 된다.", "label": "speculative_outcome" },
            { "category": "trade", "text": "대서양 항해 계획들은 후원자를 찾기 어려워진다.", "label": "speculative_outcome" }
          ],
          "originalHistory": { "text": "1498년 바스쿠 다 가마가 인도 항로를 열었다.", "label": "historical_fact" }
        },
        {
          "year": 1600,
          "divergence": 55,
          "headline": { "text": "조용한 대서양", "label": "speculative_outcome" },
          "entries": [
            { "category": "trade", "text": "향신료는 여전히 지중해로 흐르고, 우회 항로의 이익은 작다.", "label": "speculative_outcome" },
            { "category": "powers", "text": "아메리카 식민화는 느리고, 해안 거점에 머문다.", "label": "speculative_outcome" },
            { "category": "culture", "text": "르네상스는 베네치아와 비잔티움을 잇는 동지중해에서 꽃핀다.", "label": "speculative_outcome" }
          ],
          "originalHistory": { "text": "영국(1600)·네덜란드(1602) 동인도회사가 설립되었다.", "label": "historical_fact" }
        },
        {
          "year": 1800,
          "divergence": 75,
          "headline": { "text": "지중해의 산업화", "label": "speculative_outcome" },
          "entries": [
            { "category": "technology", "text": "산업혁명이 북이탈리아와 네덜란드에서 동시에 시작된다.", "label": "speculative_outcome" },
            { "category": "powers", "text": "아메리카 내륙은 대부분 원주민 연합들이 통치한다.", "label": "speculative_outcome" },
            { "category": "trade", "text": "베네치아·비잔티움 동맹이 흑해와 지중해 해운을 장악한다.", "label": "speculative_outcome" }
          ],
          "originalHistory": { "text": "영국에서 산업혁명이 진행 중이었다.", "label": "historical_fact" }
        },
        {
          "year": 1900,
          "divergence": 85,
          "headline": { "text": "다극의 세계", "label": "speculative_outcome" },
          "entries": [
            { "category": "politics", "text": "어느 한 제국도 세계의 4분의 1을 지배하지 못한다.", "label": "speculative_outcome" },
            { "category": "powers", "text": "오스만은 아나톨리아와 페르시아만 중심의 내륙 제국이 된다.", "label": "speculative_outcome" },
            { "category": "culture", "text": "국제 외교의 공용어는 이탈리아어다.", "label": "speculative_outcome" }
          ],
          "originalHistory": { "text": "유럽 열강이 아프리카와 아시아 대부분을 식민 지배했다.", "label": "historical_fact" }
        },
        {
          "year": 2026,
          "divergence": 95,
          "headline": { "text": "지중해가 세계의 중심", "label": "speculative_outcome" },
          "entries": [
            { "category": "powers", "text": "세계 최대 경제권은 '지중해 연합'이다.", "label": "speculative_outcome" },
            { "category": "politics", "text": "아메리카에는 원주민 계승 국가들이 다수 존재한다.", "label": "speculative_outcome" },
            { "category": "culture", "text": "콘스탄티노폴리스(약 900만)는 베네치아와 맺은 연방의 수도다.", "label": "speculative_outcome" }
          ],
          "originalHistory": { "text": "영어가 사실상 국제 공용어이고, 대서양 국가들이 국제질서를 주도한다.", "label": "historical_fact" }
        }
      ],
      "butterfly": [
        { "id": "b1", "year": 1453, "text": "젖은 화약", "label": "player_intervention" },
        { "id": "b2", "year": 1453, "text": "총공세 연기", "label": "simulated_consequence" },
        { "id": "b3", "year": 1453, "text": "철군론 승리, 포위 해제", "label": "simulated_consequence" },
        { "id": "b4", "year": 1500, "text": "베네치아의 동방 교역 독점", "label": "simulated_consequence" },
        { "id": "b5", "year": 1500, "text": "대서양 진출 동기 약화", "label": "speculative_outcome" },
        { "id": "b6", "year": 1600, "text": "식민화 경로 축소", "label": "speculative_outcome" },
        { "id": "b7", "year": 2026, "text": "지중해 중심의 다극 세계", "label": "speculative_outcome" }
      ],
      "world2026": {
        "headline": { "text": "대서양이 아닌 지중해의 세기", "label": "speculative_outcome" },
        "summary": { "text": "세계 지도의 중심에는 여전히 지중해가 있고, 아메리카는 다른 이름들로 가득하다.", "label": "speculative_outcome" },
        "bulletinsTitle": "2026년 이 세계의 가상 뉴스",
        "bulletins": [
          { "text": "지중해 연합 GDP, 12년 연속 세계 1위", "label": "speculative_outcome" },
          { "text": "베네치아-콘스탄티노폴리스 연방, 수도 이전 논쟁", "label": "speculative_outcome" },
          { "text": "아나톨리아 술탄국, 페르시아만 철도 개통", "label": "speculative_outcome" }
        ]
      },
      "comparison": {
        "bosporus_city": { "text": "콘스탄티노폴리스 · 약 900만 명, 연방 수도", "index": 70, "label": "speculative_outcome" },
        "east_med_power": { "text": "베네치아·비잔티움 해양 동맹", "index": 25, "label": "speculative_outcome" },
        "trade_center": { "text": "여전히 지중해", "index": 85, "label": "speculative_outcome" },
        "orthodox_center": { "text": "콘스탄티노폴리스, 라틴 교회와 긴밀한 공존", "index": 60, "label": "speculative_outcome" },
        "world_order": { "text": "지중해 연합 중심의 다극 질서", "index": 85, "label": "speculative_outcome" }
      },
      "unlocksNotes": [
        { "choiceId": "warn_defenders", "text": "세계선 기록: 싸우지 않고 물러난 술탄은 권위를 잃었다. 싸워서 이긴다면?" },
        { "choiceId": "observe", "text": "세계선 기록: 원래 역사의 오스만 진영은 무엇으로 철군론을 이겨냈을까?" }
      ]
    },
    {
      "id": "wl_origin_observed",
      "choiceId": "observe",
      "isOrigin": true,
      "name": "원래의 세계",
      "nameEn": "ORIGIN CONFIRMED",
      "tagline": "아무것도 바꾸지 않았다. 대신 역사의 이음새를 보았다.",
      "intervention": null,
      "timeline": [
        {
          "year": 1453,
          "divergence": 0,
          "headline": { "text": "새벽, 성벽이 무너지다", "label": "historical_fact" },
          "entries": [
            { "category": "politics", "text": "주스티니아니가 부상으로 물러나자 방어선이 흔들린다.", "label": "historical_fact" },
            { "category": "powers", "text": "5월 29일 도시 함락. 콘스탄티노스 11세 전사.", "label": "historical_fact" },
            { "category": "culture", "text": "천 년 넘게 이어진 동로마(비잔티움) 제국이 끝난다.", "label": "historical_fact" }
          ],
          "originalHistory": null
        },
        {
          "year": 1500,
          "divergence": 0,
          "headline": { "text": "오스만의 새 수도", "label": "historical_fact" },
          "entries": [
            { "category": "politics", "text": "이스탄불이 오스만 제국의 수도가 된다.", "label": "historical_fact" },
            { "category": "trade", "text": "1498년 바스쿠 다 가마가 인도 항로를 연다.", "label": "historical_fact" },
            { "category": "culture", "text": "그리스 학자와 문헌이 이탈리아 르네상스에 영향을 준다.", "label": "historical_fact" }
          ],
          "originalHistory": null
        },
        {
          "year": 1600,
          "divergence": 0,
          "headline": { "text": "오스만 제국의 절정", "label": "historical_fact" },
          "entries": [
            { "category": "powers", "text": "오스만 제국이 헝가리부터 북아프리카까지 지배한다.", "label": "historical_fact" },
            { "category": "trade", "text": "영국(1600)·네덜란드(1602) 동인도회사가 설립된다.", "label": "historical_fact" },
            { "category": "culture", "text": "모스크바를 '제3의 로마'로 보는 사상이 등장한다.", "label": "historical_fact" }
          ],
          "originalHistory": null
        },
        {
          "year": 1800,
          "divergence": 0,
          "headline": { "text": "무게중심은 대서양으로", "label": "historical_fact" },
          "entries": [
            { "category": "technology", "text": "영국에서 산업혁명이 진행 중이다.", "label": "historical_fact" },
            { "category": "powers", "text": "1798년 나폴레옹의 이집트 원정, 오스만의 약화가 드러난다.", "label": "historical_fact" },
            { "category": "trade", "text": "세계 교역의 중심이 지중해에서 대서양으로 옮겨갔다.", "label": "historical_fact" }
          ],
          "originalHistory": null
        },
        {
          "year": 1900,
          "divergence": 0,
          "headline": { "text": "'유럽의 병자'", "label": "historical_fact" },
          "entries": [
            { "category": "politics", "text": "오스만 제국은 '유럽의 병자'로 불리며 영토를 잃는다.", "label": "historical_fact" },
            { "category": "powers", "text": "그리스·세르비아 등 발칸 국가들이 독립했다.", "label": "historical_fact" },
            { "category": "trade", "text": "1869년 수에즈 운하가 개통되었다.", "label": "historical_fact" }
          ],
          "originalHistory": null
        },
        {
          "year": 2026,
          "divergence": 0,
          "headline": { "text": "우리가 아는 세계", "label": "historical_fact" },
          "entries": [
            { "category": "politics", "text": "이스탄불은 튀르키예 공화국(1923 수립)의 최대 도시다.", "label": "historical_fact" },
            { "category": "culture", "text": "하기아 소피아는 2020년 다시 모스크로 전환되었다.", "label": "historical_fact" },
            { "category": "powers", "text": "보스포루스 해협 통항은 1936년 몽트뢰 협약이 규정한다.", "label": "historical_fact" }
          ],
          "originalHistory": null
        }
      ],
      "butterfly": [
        { "id": "b1", "year": 1453, "text": "주스티니아니 부상", "label": "historical_fact" },
        { "id": "b2", "year": 1453, "text": "육지 성벽 방어선 붕괴", "label": "historical_fact" },
        { "id": "b3", "year": 1453, "text": "5월 29일 함락", "label": "historical_fact" },
        { "id": "b4", "year": 1500, "text": "오스만의 새 수도 이스탄불", "label": "historical_fact" },
        { "id": "b5", "year": 1600, "text": "동지중해의 오스만 패권", "label": "historical_fact" },
        { "id": "b6", "year": 2026, "text": "튀르키예 공화국의 이스탄불", "label": "historical_fact" }
      ],
      "world2026": {
        "headline": { "text": "우리가 알고 있는 2026년", "label": "historical_fact" },
        "summary": { "text": "이 세계선은 실제 역사와 같다. 아래는 모두 사실이다.", "label": "historical_fact" },
        "bulletinsTitle": "관측으로 찾은 역사의 이음새",
        "bulletins": [
          { "text": "방어선은 주스티니아니가 물러난 직후 무너졌다.", "label": "historical_fact" },
          { "text": "총공세 며칠 전, 오스만 진영에서는 철군론이 나왔다.", "label": "historical_fact" },
          { "text": "새벽 총공세는 대포 포격과 함께 시작되었다.", "label": "historical_fact" }
        ]
      },
      "comparison": {
        "bosporus_city": { "text": "이스탄불 · 인구 1,500만 명 이상", "index": 95, "label": "historical_fact" },
        "east_med_power": { "text": "오스만 제국 (15세기~20세기 초)", "index": 90, "label": "historical_fact" },
        "trade_center": { "text": "16세기 이후 대서양·인도양으로 이동", "index": 20, "label": "historical_fact" },
        "orthodox_center": { "text": "신자 수 최대는 러시아 정교회, 이스탄불 총대주교청은 명예상 수위", "index": 30, "label": "historical_fact" },
        "world_order": { "text": "미국 중심 질서 · 영어가 사실상 국제 공용어", "index": 45, "label": "historical_fact" }
      },
      "unlocksNotes": [
        { "choiceId": "warn_defenders", "text": "관측 기록: 방어선은 주스티니아니가 쓰러진 직후 무너졌다." },
        { "choiceId": "silence_guns", "text": "관측 기록: 총공세 며칠 전, 할릴 파샤는 철군을 주장했다." }
      ]
    }
  ]
}
```
