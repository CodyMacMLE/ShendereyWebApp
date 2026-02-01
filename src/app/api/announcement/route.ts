import { db } from '@/lib/db';
import { announcement } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    try {
        const rows = await db.select().from(announcement).limit(1);
        return NextResponse.json({ success: true, body: rows[0] || null }, { status: 200 });
    } catch (error) {
        console.error("Error in GET /api/announcement:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { message, linkUrl, isActive } = await req.json();

        const existing = await db.select().from(announcement).limit(1);

        let result;
        if (existing.length > 0) {
            result = await db.update(announcement).set({
                message,
                linkUrl: linkUrl || null,
                isActive,
                updatedAt: new Date(),
            }).where(eq(announcement.id, existing[0].id)).returning();
        } else {
            result = await db.insert(announcement).values({
                message,
                linkUrl: linkUrl || null,
                isActive,
            }).returning();
        }

        return NextResponse.json({ success: true, body: result[0] }, { status: 200 });
    } catch (error) {
        console.error("Error in PUT /api/announcement:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function DELETE() {
    try {
        await db.delete(announcement);
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Error in DELETE /api/announcement:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
