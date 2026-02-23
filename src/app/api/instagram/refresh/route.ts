import { refreshInstagramToken } from "@/lib/instagram";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  const expectedSecret = process.env.INSTAGRAM_REFRESH_SECRET;

  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await refreshInstagramToken();

  if (!result) {
    return NextResponse.json({ error: 'Failed to refresh token' }, { status: 500 });
  }

  return NextResponse.json(result);
}
