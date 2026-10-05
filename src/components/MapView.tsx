"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import type { Area, Layer } from "@/types";
import { getLayerScore } from "@/lib/scores";
import MapAreaMarker from "./MapAreaMarker";

export interface FlyTarget {
  lat: number;
  lng: number;
  zoom?: number;
  /** 바텀시트에 가리지 않도록 중심을 아래로 보정 (모바일) */
  offset?: boolean;
  key: number;
}

const SUWON_CENTER: [number, number] = [37.2750, 127.0300];

function Flyer({ target }: { target: FlyTarget | null }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    const zoom = target.zoom ?? 15;
    // 모바일에서는 바텀시트에 가리지 않도록 중심을 살짝 아래로 둔다
    const point = map.project([target.lat, target.lng], zoom);
    if (target.offset && map.getSize().x < 768) point.y += map.getSize().y * 0.2;
    map.flyTo(map.unproject(point, zoom), zoom, { duration: 0.8 });
  }, [target, map]);
  return null;
}

interface Props {
  areas: Area[];
  layer: Layer;
  selectedId: string | null;
  flyTarget: FlyTarget | null;
  onSelect: (id: string) => void;
}

export default function MapView({ areas, layer, selectedId, flyTarget, onSelect }: Props) {
  return (
    <MapContainer center={SUWON_CENTER} zoom={12} zoomControl={false} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {areas.map((area) => (
        <MapAreaMarker
          key={area.id}
          area={area}
          score={getLayerScore(area, layer)}
          selected={area.id === selectedId}
          onSelect={onSelect}
        />
      ))}
      <Flyer target={flyTarget} />
    </MapContainer>
  );
}
