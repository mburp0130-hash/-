import type { AreaRecord, Hourly } from "@/types";

/**
 * UI 테스트용 mock 데이터. 실제 측정값이 아니다.
 * 좌표는 데모용 근사값이다.
 */

type Profile = "station" | "downtown" | "leisure" | "mall" | "campus";

interface Seed {
  id: string;
  name: string;
  lat: number;
  lng: number;
  peopleScore: number;
  vehicleScore: number;
  trend: number;
  weekendScore: number;
  trafficVolume: number;
  trafficCongestion: number;
  peopleProfile: Profile;
  vehicleProfile: Profile;
  description: string;
}

const SEEDS: Seed[] = [
  {
    id: "suwon-station", name: "수원역", lat: 37.266, lng: 127.0001,
    peopleScore: 91, vehicleScore: 84, trend: 12, weekendScore: 80,
    trafficVolume: 88, trafficCongestion: 79,
    peopleProfile: "station", vehicleProfile: "station",
    description: "철도·버스 환승과 대형 상업시설이 모인 수원 최대 교통 거점입니다.",
  },
  {
    id: "haenggung", name: "행궁동", lat: 37.2819, lng: 127.0113,
    peopleScore: 82, vehicleScore: 48, trend: 82, weekendScore: 92,
    trafficVolume: 45, trafficCongestion: 52,
    peopleProfile: "leisure", vehicleProfile: "leisure",
    description: "화성행궁 주변 카페·공방 골목으로 주말과 저녁에 방문객이 몰립니다.",
  },
  {
    id: "ingye", name: "인계동", lat: 37.2652, lng: 127.033,
    peopleScore: 80, vehicleScore: 62, trend: 14, weekendScore: 78,
    trafficVolume: 64, trafficCongestion: 60,
    peopleProfile: "downtown", vehicleProfile: "downtown",
    description: "음식점과 유흥 상권이 밀집해 저녁부터 밤까지 활발합니다.",
  },
  {
    id: "gwanggyo-central", name: "광교중앙역", lat: 37.2886, lng: 127.0516,
    peopleScore: 88, vehicleScore: 72, trend: 24, weekendScore: 72,
    trafficVolume: 78, trafficCongestion: 55,
    peopleProfile: "station", vehicleProfile: "station",
    description: "신도시 업무·주거 수요가 겹치는 환승 지점입니다.",
  },
  {
    id: "gwanggyo-lake", name: "광교호수공원", lat: 37.284, lng: 127.066,
    peopleScore: 69, vehicleScore: 55, trend: 37, weekendScore: 95,
    trafficVolume: 58, trafficCongestion: 40,
    peopleProfile: "leisure", vehicleProfile: "leisure",
    description: "산책과 나들이 수요가 큰 호수공원으로 주말 방문이 특히 많습니다.",
  },
  {
    id: "starfield-suwon", name: "스타필드 수원", lat: 37.3005, lng: 127.0049,
    peopleScore: 88, vehicleScore: 78, trend: 61, weekendScore: 94,
    trafficVolume: 82, trafficCongestion: 70,
    peopleProfile: "mall", vehicleProfile: "mall",
    description: "대형 복합쇼핑몰로 차량 방문 비중이 높고 주말에 가장 붐빕니다.",
  },
  {
    id: "yeongtong", name: "영통역", lat: 37.2512, lng: 127.0714,
    peopleScore: 74, vehicleScore: 66, trend: 6, weekendScore: 70,
    trafficVolume: 68, trafficCongestion: 58,
    peopleProfile: "downtown", vehicleProfile: "station",
    description: "주거·상업이 섞인 생활 중심 상권으로 유동이 꾸준합니다.",
  },
  {
    id: "ajou-univ", name: "아주대학교 주변", lat: 37.2836, lng: 127.0454,
    peopleScore: 66, vehicleScore: 45, trend: -8, weekendScore: 42,
    trafficVolume: 47, trafficCongestion: 38,
    peopleProfile: "campus", vehicleProfile: "campus",
    description: "대학가 상권으로 평일 낮과 저녁 유동이 크고 주말에는 줄어듭니다.",
  },
];

/** 각 프로필의 시간대별 형태(0~1). */
function shape(profile: Profile, h: number): number {
  const bump = (center: number, width: number, height: number) =>
    height * Math.exp(-((h - center) ** 2) / (2 * width ** 2));
  switch (profile) {
    case "station":
      return 0.15 + bump(8, 1.6, 0.85) + bump(18.5, 1.8, 1) + bump(13, 3, 0.3);
    case "downtown":
      return 0.1 + bump(12.5, 1.5, 0.45) + bump(19.5, 2.2, 1) + bump(22, 1.5, 0.5);
    case "leisure":
      return 0.08 + bump(14, 2.5, 0.65) + bump(19, 2.2, 1);
    case "mall":
      return 0.05 + bump(15, 3, 0.85) + bump(19, 2, 1);
    case "campus":
      return 0.08 + bump(11, 2, 0.8) + bump(13, 1.5, 0.7) + bump(18, 2, 0.75);
  }
}

function buildHourly(profile: Profile, peak: number, salt: number): Hourly {
  const raw = Array.from({ length: 24 }, (_, h) => shape(profile, h));
  const max = Math.max(...raw);
  return raw.map((v, h) => {
    const noise = Math.sin(h * 2.3 + salt) * 2;
    return Math.max(2, Math.min(100, Math.round(8 + (v / max) * (peak - 8) + noise)));
  });
}

const avg = (xs: number[]) => Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);

function toRecord(seed: Seed, index: number): AreaRecord {
  const hourlyPeople = buildHourly(seed.peopleProfile, Math.min(100, seed.peopleScore + 7), index);
  const hourlyVehicle = buildHourly(seed.vehicleProfile, Math.min(100, seed.vehicleScore + 8), index + 5);
  const combined = hourlyPeople.map((p, h) => Math.round(p * 0.6 + hourlyVehicle[h] * 0.4));
  return {
    id: seed.id,
    name: seed.name,
    lat: seed.lat,
    lng: seed.lng,
    peopleScore: seed.peopleScore,
    vehicleScore: seed.vehicleScore,
    trend: seed.trend,
    hourlyPeople,
    hourlyVehicle,
    daytimeScore: avg(combined.slice(9, 18)),
    eveningScore: avg(combined.slice(18, 23)),
    nightScore: avg([...combined.slice(22), ...combined.slice(0, 5)]),
    weekendScore: seed.weekendScore,
    trafficVolume: seed.trafficVolume,
    trafficCongestion: seed.trafficCongestion,
    description: seed.description,
  };
}

export const MOCK_AREAS: AreaRecord[] = SEEDS.map(toRecord);
