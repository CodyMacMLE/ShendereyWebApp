import { db } from '@/lib/db';
import { coaches, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const allCoaches = await db
      .select({
        id: coaches.id,
        user: coaches.user,
        name: users.name,
        title: coaches.title,
        description: coaches.description,
        isSeniorStaff: coaches.isSeniorStaff,
      })
      .from(coaches)
      .innerJoin(users, eq(coaches.user, users.id));

    return NextResponse.json({ success: true, body: allCoaches }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/coach:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}