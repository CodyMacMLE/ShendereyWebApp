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

export async function GET(req: NextRequest) {
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

        // Handle S3 uploads for each image field with type checking
        const programImgRaw = formData.get('programImg');
        const programImgUrl = programImgRaw instanceof File ? await uploadToS3(programImgRaw, 'program') : '';

        // Grab Form Data
        const name = formData.get('programName') as string;
        const categoryRaw = formData.get('programCategory');
        const description = formData.get('programDescription') as string;
        const length = formData.get('programLength') as string;
        const ages = formData.get('programAges') as string;

        // Validate Form Data
        const category = (categoryRaw === 'competitive' || categoryRaw === 'recreational')
            ? categoryRaw
            : null;

        if (!category) {
            return NextResponse.json({ success: false, error: 'Invalid program category' }, { status: 400 });
        }


        // Insert Data into DB
        const insertedProgram = await db.insert(programs).values({
            name: name?.toString() || '',
            category: category,
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