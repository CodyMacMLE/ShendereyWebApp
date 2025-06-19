import { db } from '@/lib/db';
import { programs } from '@/lib/schema';
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

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

export async function GET() {
    try {
        const allPrograms = await db.select().from(programs)
    
        return NextResponse.json({success: true, body: allPrograms}, {status: 200})
    } catch (error) {
        console.error("Error in GET /api/programs:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        // Grab Form Data
        const name = formData.get('name') as string;
        const category = formData.get('category');
        const ages = formData.get('ages') as string;
        const length = formData.get('length') as string;
        const description = formData.get('description') as string;

        // Handle S3 uploads for each image field with type checking
        const programImgRaw = formData.get('programImgFile');
        const programImgUrl = programImgRaw instanceof File ? await uploadToS3(programImgRaw, 'program') : '';

        // Insert Data into DB
        const insertedProgram = await db.insert(programs).values({
            name: name?.toString() || '',
            category: category as "competitive" | "recreational",
            description: description?.toString() || '',
            length: isNaN(parseInt(length)) ? 0 : parseInt(length),
            ages: ages?.toString() || '',
            programImgUrl: programImgUrl
        }).returning();

        // Return Program to Front-end
        return NextResponse.json({ success: true, body: insertedProgram[0] }, { status: 200 });

    } catch (error) {
        console.error("Error in GET /api/programs:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}