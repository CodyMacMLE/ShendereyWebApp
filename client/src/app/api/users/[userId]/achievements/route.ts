import { db } from '@/lib/db';
import { achievements } from '@/lib/schema';
import { eq } from 'drizzle-orm/sql';
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

  export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
  ) {
    const { userId } = await params;
    const id = parseInt(userId);
  
    try {
      const { title, description, date } = await req.json();
  
      const newAchievement = await db.insert(achievements)
        .values({
          athlete: id,
          title,
          description,
          date: new Date(date),
        })
        .returning();
  
      return NextResponse.json({ success: true, body: newAchievement[0] });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }
  }