import { db } from '@/lib/db';
import { groups, coachGroupLines, coaches, users } from '@/lib/schema';
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

export async function POST(req: NextRequest, { params }: { params: Promise<{ programId: string }> }) {
    const { programId } = await params;
    const id = parseInt(programId);

    if (!id) {
        return NextResponse.json({ success: false, error: "Missing program ID" }, { status: 400 });
    }

    try {
        const body = await req.json();
        const { coachId, day, startTime, endTime, startDate, endDate, active } = body;

        const [newGroup] = await db.insert(groups).values({
          program: id,
          day,
          startTime,
          endTime,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          active,
        }).returning({ id: groups.id });

        await db.insert(coachGroupLines).values({
          coachId,
          groupId: newGroup.id
        });

        return NextResponse.json({ success: true, body: newGroup }, { status: 201 });
    } catch (error) {
        console.error("Error in POST /api/groups/programId:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}