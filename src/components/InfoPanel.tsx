import Sheet from "./Sheet";

export default function InfoPanel({ onClose }: { onClose: () => void }) {
  return (
    <Sheet title="상권 레이더 안내" onClose={onClose}>
      <p className="text-base font-bold">개인의 위치가 아니라 지역의 흐름을 봅니다.</p>
      <ul className="mt-3 space-y-2 text-sm text-slate-600">
        <li>· 위치는 지도에 익명·집계된 흐름만 표시합니다.</li>
        <li>· 향후 사용자 데이터를 활용하더라도 개인 위치가 아닌 익명 집계 데이터만 사용할 예정입니다.</li>
        <li>· 「내 주변 보기」는 버튼을 누를 때만 위치를 사용하며, 서버로 전송하거나 저장하지 않습니다.</li>
        <li>· 현재 점수는 UI 검증용 mock 데이터이며 실제 측정값이 아닙니다.</li>
      </ul>
    </Sheet>
  );
}
