import { db } from '@/lib/db';
import { coachGroupLines, groups } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ programId: string, groupId: string }> }) {
    const { groupId } = await params;
    
    try {
        const groupIdInt = parseInt(groupId);

        await db.delete(coachGroupLines).where(eq(coachGroupLines.groupId, groupIdInt));
        await db.delete(groups).where(eq(groups.id, groupIdInt));

        return NextResponse.json({ success: true, body: { group: groupIdInt } });
    } catch (error) {
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ programId: string; groupId: string }> }) {
    const { groupId } = await params;
    try {
        const formData = await req.formData();
        const coachIdRaw = formData.get('coachId');
        const day = formData.get('day');
        const startTime = formData.get('startTime');
        const endTime = formData.get('endTime');
        const startDateRaw = formData.get('startDate');
        const endDateRaw = formData.get('endDate');

        // Convert types as needed
        const coachId = coachIdRaw ? parseInt(coachIdRaw.toString(), 10) : undefined;
        const startDate = startDateRaw ? new Date(startDateRaw.toString()) : undefined;
        const endDate = endDateRaw ? new Date(endDateRaw.toString()) : undefined;

        // Update group in DB
        const [updatedGroup] = await db.update(groups)
            .set({
                day: day?.toString() || '',
                startTime: startTime?.toString() || '',
                endTime: endTime?.toString() || '',
                startDate,
                endDate,
            })
            .where(eq(groups.id, parseInt(groupId, 10)))
            .returning();

        let updatedCoachGroupLine = null;
        if (coachId) {
            // Check if a coachGroupLine exists for this group
            const existing = await db.select().from(coachGroupLines).where(eq(coachGroupLines.groupId, parseInt(groupId, 10)));
            if (existing.length > 0) {
                // Update existing
                [updatedCoachGroupLine] = await db.update(coachGroupLines)
                    .set({ coachId })
                    .where(eq(coachGroupLines.groupId, parseInt(groupId, 10)))
                    .returning();
            } else {
                // Insert new
                [updatedCoachGroupLine] = await db.insert(coachGroupLines).values({
                    groupId: parseInt(groupId, 10),
                    coachId,
                }).returning();
            }
        }

        return NextResponse.json({ success: true, body: { group: updatedGroup, coachGroupLine: updatedCoachGroupLine } });
    } catch (error) {
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}