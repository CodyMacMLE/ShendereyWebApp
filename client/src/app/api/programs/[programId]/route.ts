import { db } from '@/lib/db';
import { programs } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ programId: string }> }) {
    const { programId } = await params;
    const id = parseInt(programId);

    if (!id) {
        return NextResponse.json({ success: false, error: "Missing program ID" }, { status: 400 });
    }

    try {
        const program = await db.select().from(programs).where(eq(programs.id, id))
    
        return NextResponse.json({success: true, body: program[0]}, {status: 200})
    } catch (error) {
        console.error("Error in GET /api/programs/programId:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}