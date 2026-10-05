"use client";

import L from "leaflet";
import { Circle, Marker } from "react-leaflet";
import type { Area } from "@/types";
import { LEVEL_META, getScoreLevel } from "@/lib/scores";

interface Props {
  area: Area;
  score: number;
  selected: boolean;
  onSelect: (id: string) => void;
}

/**
 * 한 지역의 heat 표현. 지금은 원형 + 숫자 라벨.
 * 추후 H3 hex polygon으로 바꿀 때 이 컴포넌트만 교체하면 된다.
 */
export default function MapAreaMarker({ area, score, selected, onSelect }: Props) {
  const color = LEVEL_META[getScoreLevel(score)].color;
  const icon = L.divIcon({
    className: "",
    html: `<div class="heat-label${selected ? " selected" : ""}" style="background:${color}">${score}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
  const handlers = { click: () => onSelect(area.id) };

  return (
    <>
      <Circle
        center={[area.lat, area.lng]}
        radius={260 + score * 3}
        pathOptions={{ color, weight: 1, fillColor: color, fillOpacity: 0.15 + (score / 100) * 0.5 }}
        eventHandlers={handlers}
      />
      <Marker position={[area.lat, area.lng]} icon={icon} eventHandlers={handlers} />
    </>
  );
}
