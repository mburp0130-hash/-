import { NextResponse } from "next/server";
import { provider } from "@/lib/provider";

export async function GET() {
  const areas = await provider.getAreas();
  return NextResponse.json({ areas });
}
