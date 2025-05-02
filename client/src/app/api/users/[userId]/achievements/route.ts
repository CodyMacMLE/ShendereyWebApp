import { eq } from 'drizzle-orm';
import { db } from '../../../../../../lib/db';
import { achievements, users } from '../../../../../../lib/schema';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
  ) {
    const { userId } = await params;
    const id = parseInt(userId);
  
    try {
        const data = await db.select().from(achievements).where(eq(achievements.athlete, id));
        
  
      return NextResponse.json({success: true, body: data})
    } catch (error) {
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }
  }