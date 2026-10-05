import { NextResponse } from "next/server";
import { getTrending } from "@/lib/provider";

export async function GET() {
  return NextResponse.json({ items: await getTrending(5) });
}
