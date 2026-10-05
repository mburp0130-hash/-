"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Area } from "@/types";
import { buildHourlySummary } from "@/lib/summary";

export default function TrafficChart({ area }: { area: Area }) {
  const data = area.hourlyPeople.map((p, h) => ({
    hour: `${String(h).padStart(2, "0")}`,
    사람: p,
    차량: area.hourlyVehicle[h],
  }));
  return (
    <div>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="hour" tick={{ fontSize: 11 }} interval={3} unit="시" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip labelFormatter={(l) => `${l}시`} />
            <Legend iconType="plainline" wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="사람" stroke="#2563eb" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="차량" stroke="#f97316" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-2 space-y-1 text-sm text-slate-600">
        {buildHourlySummary(area).map((line) => (
          <li key={line}>· {line}</li>
        ))}
      </ul>
    </div>
  );
}
