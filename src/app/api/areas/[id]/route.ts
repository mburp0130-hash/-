import { NextResponse } from "next/server";
import { provider } from "@/lib/provider";
import { buildBusinessInsights } from "@/lib/business";
import type { AreaDetail } from "@/types";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const area = await provider.getArea(id);
  if (!area) return NextResponse.json({ error: "지역을 찾을 수 없습니다." }, { status: 404 });
  const peers = await provider.getAreas();
  const detail: AreaDetail = { area, insights: buildBusinessInsights(area, peers) };
  return NextResponse.json(detail);
}
