"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import type { Area, Layer, TrendingItem } from "@/types";
import type { FlyTarget } from "@/components/MapView";
import AreaBottomSheet from "@/components/AreaBottomSheet";
import InfoPanel from "@/components/InfoPanel";
import LayerSelector from "@/components/LayerSelector";
import TrendingAreas from "@/components/TrendingAreas";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-slate-200" />,
});

type Panel = "area" | "trending" | "info" | null;

export default function Home() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [layer, setLayer] = useState<Layer>("total");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [flyTarget, setFlyTarget] = useState<FlyTarget | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/areas")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("fetch failed"))))
      .then((d: { areas: Area[] }) => setAreas(d.areas))
      .catch(() => setLoadError(true));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const flyTo = useCallback((lat: number, lng: number, zoom?: number, offset?: boolean) => {
    setFlyTarget({ lat, lng, zoom, offset, key: Date.now() });
  }, []);

  const selectArea = useCallback(
    (id: string, lat?: number, lng?: number) => {
      const area = areas.find((a) => a.id === id);
      if (!area) return;
      setSelectedId(id);
      setPanel("area");
      flyTo(lat ?? area.lat, lng ?? area.lng, 15, true);
    },
    [areas, flyTo],
  );

  const selected = areas.find((a) => a.id === selectedId) ?? null;

  const locate = () => {
    if (!navigator.geolocation) {
      setToast("이 브라우저는 위치 기능을 지원하지 않습니다.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => flyTo(pos.coords.latitude, pos.coords.longitude, 14),
      () => setToast("위치 권한이 없어 현재 위치로 이동할 수 없습니다."),
      { timeout: 8000 },
    );
  };

  const closePanel = () => {
    setPanel(null);
    setSelectedId(null);
  };

  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <div className="absolute inset-0">
        <MapView
          areas={areas}
          layer={layer}
          selectedId={selectedId}
          flyTarget={flyTarget}
          onSelect={selectArea}
        />
      </div>

      <header className="absolute left-3 right-3 top-3 z-[900] rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur md:right-auto md:w-[360px]">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-extrabold leading-tight">상권 레이더</h1>
            <p className="text-sm text-slate-500">지금 사람이 어디에 몰리고 있을까?</p>
          </div>
          <button
            onClick={() => setPanel("info")}
            aria-label="안내"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm text-slate-600"
          >
            ⓘ
          </button>
        </div>
        <div className="mt-3">
          <LayerSelector value={layer} onChange={setLayer} />
        </div>
      </header>

      <div
        className={`absolute bottom-5 left-3 z-[900] flex-col items-start gap-2 ${panel ? "hidden md:flex" : "flex"}`}
      >
        <button
          onClick={locate}
          className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold shadow-lg active:scale-95"
        >
          📍 내 주변 보기
        </button>
        <button
          onClick={() => setPanel("trending")}
          className="rounded-full bg-red-500 px-5 py-3 text-sm font-bold text-white shadow-lg active:scale-95"
        >
          🔥 지금 뜨는 곳
        </button>
      </div>

      {loadError && (
        <div className="absolute inset-x-3 top-36 z-[950] rounded-xl bg-red-50 p-3 text-sm text-red-600 shadow">
          데이터를 불러오지 못했습니다. 새로고침해 주세요.
        </div>
      )}
      {toast && (
        <div className="absolute left-1/2 top-36 z-[1100] -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      {panel === "area" && selected && <AreaBottomSheet key={selected.id} area={selected} onClose={closePanel} />}
      {panel === "trending" && (
        <TrendingAreas
          onClose={() => setPanel(null)}
          onSelect={(item: TrendingItem) => selectArea(item.id, item.lat, item.lng)}
        />
      )}
      {panel === "info" && <InfoPanel onClose={() => setPanel(null)} />}

      <p className="pointer-events-none absolute bottom-7 right-2 z-[800] rounded bg-white/80 px-1.5 text-[10px] text-slate-500">
        위치는 지도에 익명·집계된 흐름만 표시합니다.
      </p>
    </main>
  );
}
