import { db } from '@/lib/db';
import { groups, coachGroupLines, coaches, users, programs } from '@/lib/schema';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { eq, inArray } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET_NAME = process.env.AWS_BUCKET_NAME!;

async function uploadToS3(file: File, keyPrefix: string) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const key = `${keyPrefix}/${randomUUID()}-${file.name}`;

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  }));

  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

async function deleteFromS3(url: string) {
    const key = url.substring(1);
    await s3.send(new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    }));
}

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

export async function DELETE(req: NextRequest, { params }: { params: { programId: string } }) {
    const { programId } = await params;
    const id = parseInt(programId);

    if (!id) {
        return NextResponse.json({ success: false, error: "Missing program ID" }, { status: 400 });
    }

    try {
        const groupsIds = await db.select({ id: groups.id }).from(groups).where(eq(groups.program, id));
        await db.delete(coachGroupLines).where(inArray(coachGroupLines.groupId, groupsIds.map(group => group.id)));
        await db.delete(groups).where(eq(groups.program, id));
        // Delete program image from S3
        const program = await db.select().from(programs).where(eq(programs.id, id));
        if (program.length > 0) {
            const programImgUrl = program[0].programImgUrl;
            if (programImgUrl) {
                await deleteFromS3(programImgUrl);
            }
        }
        await db.delete(programs).where(eq(programs.id, id));
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
} 
