# Codex Kickoff Prompt — ONE CHANGE MVP

아래 프롬프트를 `docs/ONE_CHANGE_MVP_SPEC.md` 와 함께 Codex에 전달한다.

---

너는 모바일 우선 웹게임 **ONE CHANGE** 의 MVP를 구현한다.
명세서는 `docs/ONE_CHANGE_MVP_SPEC.md`, 게임 데이터 원본은 `docs/data/constantinople1453.json` 이다.

작업 방식:

1. **명세서를 처음부터 끝까지 읽는다.** 특히 §0 제품 불변 원칙, §C MVP Scope(IN/OUT, 허용 의존성), §O Acceptance Criteria를 기준으로 삼는다.
2. **현재 작업 디렉터리를 먼저 확인한다** (`pwd`, `ls -la`, `git status`). `docs/` 는 수정하지 말고 그대로 둔다.
3. 저장소 루트에 **Vite + React + TypeScript 프로젝트를 초기화**하고, §C-3에 명시된 의존성만 설치한다(Tailwind v4, Vitest, Testing Library, Playwright).
4. §Q Implementation Order에 따라 **5~10줄짜리 짧은 구현 계획**을 적은 뒤 곧바로 구현한다.
5. **사소한 결정은 질문하지 말고** 명세의 의도(Loop Rate 극대화, 단순한 인터페이스, 역사/대체역사 구분)에 맞게 합리적으로 결정한다. 결정한 내용은 최종 보고에 짧게 적는다.
6. 게임 데이터는 `docs/data/constantinople1453.json` 을 `src/data/` 로 **그대로 복사**한다. 문구를 창작하거나 바꾸지 않는다.
7. 각 단계마다 `npm run typecheck` 와 `npm test` 를 돌리고, 끝에 `npm run build` 와 `npm run test:e2e` 를 실행한다. **오류가 나면 원인을 고치고 다시 실행한다.**
8. `npm run dev` 로 앱을 띄우고, 390×844 뷰포트에서 **Title → Intro → 1453 → 선택 → 타임라인 → 버터플라이 → 결과 → RETURN TO THE PAST → 두 번째·세 번째 선택 → 3/3 완료 → 새로고침 후 진행 유지**까지 전체 루프가 브라우저에서 끝까지 작동하는지 직접 확인한다. `?fast=1` 모드도 확인한다.
9. **과도한 기능을 추가하지 않는다.** §C-2 OUT 목록(AI API, 백엔드, 로그인, 추가 역사 사건, 지도, 사운드, 설정 화면, 애니메이션/상태관리/라우터 라이브러리 등)은 어떤 이유로도 넣지 않는다.
10. 완료 후 다음을 요약해 보고한다:
    - 구현한 내용 (화면/기능 목록, §O 체크리스트 충족 여부)
    - 실행 방법 (`npm install`, `npm run dev`, `npm test`, `npm run test:e2e`, `?fast=1`)
    - 스스로 내린 결정과 명세에서 벗어난 부분(있다면 이유)
    - 남은 제한사항 / 알려진 이슈 / 실행하지 못한 테스트
