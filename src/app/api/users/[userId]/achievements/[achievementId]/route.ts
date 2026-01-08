import { db } from '@/lib/db';
import { achievements } from '@/lib/schema';
import { and, eq } from 'drizzle-orm/sql';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string, achievementId: string }> }
  ) {
    const { userId, achievementId } = await params;

    try {
        const deletedAchievement = await db.delete(achievements)
        .where(and( eq(achievements.athlete, parseInt(userId)), eq(achievements.id, parseInt(achievementId))))
        .returning();

      return NextResponse.json({ success: true, body: deletedAchievement?.[0] ?? null });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }
  }