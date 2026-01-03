import { db } from '@/lib/db';
import { registrationImage } from '@/lib/schema';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

// Validate required environment variables
if (!process.env.AWS_REGION) {
    throw new Error('AWS_REGION environment variable is required');
}

if (!process.env.AWS_BUCKET_NAME) {
    throw new Error('AWS_BUCKET_NAME environment variable is required');
}

// S3 Client
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
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

// Upload to S3
async function uploadToS3(file: File, keyPrefix: string, fileTitle: string) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const key = `${keyPrefix}/${fileTitle}`;

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
        const registrationImages = await db.select().from(registrationImage).limit(1);
        
        if (registrationImages.length > 0) {
            return NextResponse.json({
                success: true,
                body: registrationImages[0],
            }, { status: 200 });
        } else {
            return NextResponse.json({
                success: true,
                body: null,
            }, { status: 200 });
        }
    } catch (error) {
        console.error("Error in GET /api/register/session-image:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        const imageRaw = formData.get('image') as File;
        const title = formData.get('title') as string;
        
        if (!(imageRaw instanceof File)) {
            return NextResponse.json(
                { success: false, error: 'Image file is required' },
                { status: 400 }
            );
        }

        // Upload image to S3 (this will replace existing file if it exists at the same key)
        const imageUrl = await uploadToS3(imageRaw, 'registration', 'currentRegistration');

        // Check if a registration image already exists
        const existingImages = await db.select().from(registrationImage).limit(1);
        
        let result;
        if (existingImages.length > 0) {
            // Update existing record
            const existingImage = existingImages[0];
            [result] = await db.update(registrationImage)
                .set({
                    imageUrl,
                    title,
                    updatedAt: new Date(),
                })
                .where(eq(registrationImage.id, existingImage.id))
                .returning();
        } else {
            // Insert new record
            [result] = await db.insert(registrationImage).values({
                imageUrl,
                title,
            }).returning();
        }

        return NextResponse.json({
            success: true,
            body: result,
            imageUrl: imageUrl,
        }, { status: 200 });
    } catch (error) {
        console.error("Error in POST /api/registerImage:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}