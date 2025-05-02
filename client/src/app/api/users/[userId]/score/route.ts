import { db } from '@/lib/db';
import { scores } from '@/lib/schema';
import { eq } from 'drizzle-orm/sql';
import { NextRequest, NextResponse } from 'next/server';

type ScoreInput = {
  competitionName: string;
  competitionDate: string;
  competitionCategory: string;
  vaultScore: number;
  barsScore: number;
  beamScore: number;
  floorScore: number;
  overallScore: number;
};

export async function POST(req: NextRequest) {
  try {
    const body: ScoreInput = await req.json();
    const urlParts = req.url.split('/');
    const userId = urlParts[urlParts.length - 2];
    const id = parseInt(userId || '0');
    const date = body.competitionDate ? new Date(body.competitionDate) : null;

    if (isNaN(id) || id === 0) {
      return NextResponse.json({ success: false, error: 'Invalid user ID' }, { status: 400 });
    }

    const insertedScore = await db.insert(scores).values({
      athlete: id,
      competition: body.competitionName,
      date: date,
      category: body.competitionCategory,
      vault: body.vaultScore,
      bars: body.barsScore,
      beam: body.beamScore,
      floor: body.floorScore,
      overall: body.overallScore,
    }).returning();

    return NextResponse.json({ success: true, body: insertedScore[0] });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    const userScores = await db.select().from(scores).where(eq(scores.athlete, parseInt(userId)));
    return NextResponse.json({success: true, body: userScores})
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

