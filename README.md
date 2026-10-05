# 상권 레이더 MVP

> 개인의 위치가 아니라 지역의 흐름을 봅니다.

지도에서 "지금 사람과 차량이 어디에 몰리고 있는가?"를 보고, 지역별 시간대 변화와 업종 적합도를 탐색하는 웹 MVP. 수원 8개 지역의 **mock 데이터**로 동작합니다(실제 측정값 아님).

## 실행

Node 20 이상.

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build && npm start
```

Vercel: 저장소를 import 하면 그대로 배포됩니다(환경변수 불필요). DB 없음.

## 스택

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Leaflet + react-leaflet (OpenStreetMap) · Recharts. 전역 상태 라이브러리 없이 React state만 사용.

## 구조

```
src/
  app/
    page.tsx                 메인 화면(지도 + 시트 조합, 상태 보관)
    api/areas/route.ts       GET /api/areas
    api/areas/[id]/route.ts  GET /api/areas/:id  (지역 + 업종 추천)
    api/trending/route.ts    GET /api/trending   (trend 상위 5)
  components/
    MapView, MapAreaMarker   지도 / 지역 heat 표현(현재 원형 → 추후 H3 hex로 교체)
    LayerSelector            사람·차량·종합
    AreaBottomSheet, Sheet   모바일 바텀시트 / 데스크톱 사이드 패널
    AreaScore, TrendIndicator, TrafficChart
    BusinessInsight, BusinessScoreCard
    TrendingAreas, InfoPanel
  lib/
    scores.ts                activityScore, 점수 등급, trend 등급 (UI와 분리)
    business.ts              업종 적합도 계산 + "왜?" 근거 생성
    businessConfig.ts        업종별 가중치 설정
    summary.ts               시간대 요약 문구(규칙 기반, AI 없음)
    provider.ts              현재 사용 중인 데이터 공급자 + trending
    providers/               AreaProvider 인터페이스, mockProvider
  data/mockAreas.ts          mock 데이터 생성(시드 + 시간대 곡선)
  types/index.ts             Area 등 타입 (trafficVolume / trafficCongestion 포함)
```

## 실제 데이터로 교체하기

1. `src/lib/providers/`에 `AreaProvider`(`getAreas`, `getArea`)를 구현하는 클래스 추가 (예: `SeoulOpenDataProvider`).
2. `src/lib/provider.ts`의 `provider`를 교체. API Route와 UI는 수정 불필요.
3. 지도 표현을 H3로 바꿀 때는 `MapAreaMarker`만 hex polygon 컴포넌트로 교체.

## 개인정보

- 「내 주변 보기」는 버튼을 누를 때만 브라우저 Geolocation을 호출해 지도 중심을 옮깁니다. 서버 전송·저장·지도 표시를 하지 않습니다.
- 향후에도 개인 위치가 아닌 익명 집계 데이터만 사용할 예정입니다.

## MVP 범위 밖

로그인, 결제, AI/ML 예측, 매출·임대료·경쟁매장 분석, 푸시 알림 등은 구현하지 않았습니다.
