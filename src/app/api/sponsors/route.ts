import { db } from '@/lib/db';
import { sponsors } from '@/lib/schema';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

// Validate required environment variables
if (!process.env.AWS_REGION) {
  throw new Error('AWS_REGION environment variable is required');
}
if (!process.env.AWS_BUCKET_NAME) {
  throw new Error('AWS_BUCKET_NAME environment variable is required');
}

// S3 Client configuration
const s3Config: { region: string; credentials?: { accessKeyId: string; secretAccessKey: string } } = {
  region: process.env.AWS_REGION,
};

// Only add explicit credentials if both are provided
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3Config.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}

const s3 = new S3Client(s3Config);
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

export async function GET() {
    try {
        const allSponsors = await db.select().from(sponsors)
    
        return NextResponse.json({success: true, body: allSponsors}, {status: 200})
    } catch (error) {
        console.error("Error in GET /api/sponsors:", error);
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
        const organization = formData.get('organization') as string;
        const sponsorLevel = formData.get('sponsorLevel') as string;
        const description = formData.get('description') as string;
        const website = formData.get('website') as string;

        // Handle S3 uploads for each image field with type checking
        const sponsorImgRaw = formData.get('media');
        const sponsorImgUrl = sponsorImgRaw instanceof File ? await uploadToS3(sponsorImgRaw, 'sponsors') : '';

        // Insert Data into DB
        const insertedSponsor = await db.insert(sponsors).values({
            organization: organization?.toString() || '',
            sponsorLevel: sponsorLevel?.toString() || '',
            description: description?.toString() || '',
            sponsorImgUrl: sponsorImgUrl,
            website: website?.toString() || ''
        }).returning();

        // Return Program to Front-end
        return NextResponse.json({ success: true, body: insertedSponsor[0] }, { status: 200 });

    } catch (error) {
        console.error("Error in POST /api/sponsors:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}