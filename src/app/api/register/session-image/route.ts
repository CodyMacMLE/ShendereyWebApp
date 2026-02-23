import { db } from '@/lib/db';
import { registrationImage } from '@/lib/schema';
import { checkStorageLimit } from '@/lib/storage-limit';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
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

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    s3Config.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
}

const s3 = new S3Client(s3Config);
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

// Extract S3 key from a full S3 URL
function getS3KeyFromUrl(url: string): string | null {
    try {
        const urlObj = new URL(url);
        return urlObj.pathname.slice(1);
    } catch {
        return null;
    }
}

// Upload a file to S3 using a fully specified key
async function uploadToS3(file: File, key: string): Promise<string> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

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
        const registrationImages = await db.select().from(registrationImage);

        return NextResponse.json({
            success: true,
            body: registrationImages,
        }, { status: 200 });
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
        const slot = formData.get('slot') as string;

        if (!(imageRaw instanceof File)) {
            return NextResponse.json(
                { success: false, error: 'Image file is required' },
                { status: 400 }
            );
        }

        if (!slot) {
            return NextResponse.json(
                { success: false, error: 'Slot is required' },
                { status: 400 }
            );
        }

        const storageCheck = await checkStorageLimit();
        if (!storageCheck.allowed) {
            return NextResponse.json(
                { success: false, error: storageCheck.message },
                { status: 507 }
            );
        }

        // Build a unique S3 key per upload so multiple files can share the same slot
        const ext = imageRaw.name.split('.').pop()?.toLowerCase() || (imageRaw.type === 'application/pdf' ? 'pdf' : 'jpg');
        const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const key = `registration/${slot}-${uniqueSuffix}.${ext}`;

        const imageUrl = await uploadToS3(imageRaw, key);

        // Always insert a new record — multiple images per slot are supported
        const [result] = await db.insert(registrationImage).values({
            imageUrl,
            title,
            slot,
        }).returning();

        return NextResponse.json({
            success: true,
            body: result,
        }, { status: 200 });
    } catch (error) {
        console.error("Error in POST /api/register/session-image:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID is required' },
                { status: 400 }
            );
        }

        const existing = await db.select().from(registrationImage).where(eq(registrationImage.id, id));

        if (existing.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No image found with this ID' },
                { status: 404 }
            );
        }

        // Delete from S3
        if (existing[0].imageUrl) {
            const s3Key = getS3KeyFromUrl(existing[0].imageUrl);
            if (s3Key) {
                try {
                    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: s3Key }));
                } catch (error) {
                    console.error('S3 delete error (non-fatal):', error);
                }
            }
        }

        // Delete from DB
        await db.delete(registrationImage).where(eq(registrationImage.id, id));

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Error in DELETE /api/register/session-image:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
