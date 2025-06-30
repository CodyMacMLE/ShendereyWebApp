import { db } from '@/lib/db';
import { coachGroupLines, groups, programs } from '@/lib/schema';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { eq, inArray } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

// Validate required environment variables
if (!process.env.AWS_REGION) {
  throw new Error('AWS_REGION environment variable is required');
}
if (!process.env.AWS_BUCKET_NAME) {
  throw new Error('AWS_BUCKET_NAME environment variable is required');
}

const s3 = new S3Client({ 
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
});
const BUCKET_NAME = process.env.AWS_BUCKET_NAME!;

async function uploadToS3(file: File, keyPrefix: string) {
  try {
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
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ programId: string }> }) {
    const { programId } = await params;
    const id = parseInt(programId);

    if (!id) {
        return NextResponse.json({ success: false, error: "Missing program ID" }, { status: 400 });
    }

    const formData = await req.formData();

    // Grab Form Data
    const name = formData.get('name') as string;
    const category = formData.get('category');
    const ages = formData.get('ages') as string;
    const length = formData.get('length') as string;
    const description = formData.get('description') as string;

    // Handle S3 uploads for each image field with type checking
    const programImgRaw = formData.get('programImgFile');
    let programImgUrl = '';
    const existingProgram = await db.select().from(programs).where(eq(programs.id, id));
    const oldImgUrl = existingProgram[0]?.programImgUrl;
    programImgUrl = oldImgUrl || '';

    if (programImgRaw instanceof File) {
      if (oldImgUrl) {
        const oldKey = oldImgUrl.split('.amazonaws.com/')[1];
        await s3.send(new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: oldKey,
        }));
      }
      programImgUrl = await uploadToS3(programImgRaw, 'program');
    }

    try {
        const program = await db.update(programs).set({
            name: name,
            category: category as "competitive" | "recreational",
            ages: ages,
            length: parseInt(length),
            description: description,
            programImgUrl: programImgUrl
        }).where(eq(programs.id, id)).returning();

        return NextResponse.json({success: true, body: program[0]}, {status: 200})
    } catch (error) {
        console.error("Error in POST /api/programs/programId:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }

}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ programId: string }> }) {
    const { programId } = await params;
    const id = parseInt(programId);

    if (!id) {
        return NextResponse.json({ success: false, error: "Missing program ID" }, { status: 400 });
    }

    try {
        const groupsIds = await db.select({ id: groups.id }).from(groups).where(eq(groups.program, parseInt(programId)));
        if (groupsIds.length > 0) {
            await db.delete(coachGroupLines).where(inArray(coachGroupLines.groupId, groupsIds.map(group => group.id)));
            await db.delete(groups).where(eq(groups.program, id));
        }
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