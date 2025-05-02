import { eq, and } from 'drizzle-orm';
import { db } from '../../../../../../../lib/db';
import { scores } from '../../../../../../../lib/schema';
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

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string, scoreId: string }> }
  ) {
    const { userId, scoreId } = await params;
    try {
      const body: Partial<ScoreInput> = await req.json();
      const updatedScore = await db.update(scores)
        .set({
          competition: body.competitionName,
          date: body.competitionDate ? new Date(body.competitionDate) : undefined,
          category: body.competitionCategory,
          vault: body.vaultScore,
          bars: body.barsScore,
          beam: body.beamScore,
          floor: body.floorScore,
          overall: body.overallScore,
        })
        .where(and( eq(scores.athlete, parseInt(userId)), eq(scores.id, parseInt(scoreId))))
        .returning();
  
      return NextResponse.json({ success: true, body: updatedScore[0] });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }
  }
  
  export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string, scoreId: string  }> }
  ) {
    const { userId, scoreId } = await params;
    
    try {
      const deletedScore = await db.delete(scores)
        .where(and( eq(scores.athlete, parseInt(userId)), eq(scores.id, parseInt(scoreId))))
        .returning();
  
      return NextResponse.json({ success: true, body: deletedScore[0] });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }
  }