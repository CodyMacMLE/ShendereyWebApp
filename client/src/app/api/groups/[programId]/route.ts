import { db } from '@/lib/db';
import { groups, coachGroupLines, coaches, users, programs } from '@/lib/schema';
import { eq, inArray } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ programId: string }> }) {
    const { programId } = await params;
    const id = parseInt(programId);

    if (!id) {
        return NextResponse.json({ success: false, error: "Missing program ID" }, { status: 400 });
    }

    try {
        const groupData = await db.select().from(groups).where(eq(groups.program, id));

        const responseData = await Promise.all(groupData.map(async (group) => {
            // Get coachGroupLines for this group
            const coachLinks = await db.select().from(coachGroupLines).where(eq(coachGroupLines.groupId, group.id));
            const coachIds = coachLinks.map(link => link.coachId).filter((id): id is number => id !== null);

            let coachList = <any>[];
            if (coachIds.length > 0) {
                coachList = await db.select().from(coaches).where(inArray(coaches.id, coachIds));
            }
            let userList = <any>[];
            if (coachList.length > 0) {
                const userIds = coachList.map((coach: { user: number | null }) => coach.user).filter((id: number | null): id is number => id !== null);
                userList = await db.select({ name: users.name }).from(users).where(inArray(users.id, userIds));
            }

            return {
                ...group,
                coaches: userList
            };
        }));

        return NextResponse.json({ success: true, body: responseData }, { status: 200 });
    } catch (error) {
        console.error("Error in GET /api/groups/programId:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest, { params }: { params: { programId: string } }) {
    const { programId } = await params;
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

        // Insert into DB
        const [newGroup] = await db.insert(groups).values({
            program: parseInt(programId, 10),
            day: day?.toString() || '',
            startTime: startTime?.toString() || '',
            endTime: endTime?.toString() || '',
            startDate,
            endDate,
            active: true,
        }).returning();

        let newCoachGroupLine = null;
        if (coachId) {
            [newCoachGroupLine] = await db.insert(coachGroupLines).values({
                groupId: newGroup.id,
                coachId,
            }).returning();
        }

        return NextResponse.json({ success: true, body: { group: newGroup, coachGroupLine: newCoachGroupLine } });
    } catch (error) {
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}  