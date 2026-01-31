import { db } from '@/lib/db';
import { registrationImage } from '@/lib/schema';
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

        // Upload image to S3 using slot as the file key
        const imageUrl = await uploadToS3(imageRaw, 'registration', slot);

        // Check if a registration image already exists for this slot
        const existingImages = await db.select().from(registrationImage).where(eq(registrationImage.slot, slot));

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
                slot,
            }).returning();
        }

        return NextResponse.json({
            success: true,
            body: result,
            imageUrl: imageUrl,
        }, { status: 200 });
    } catch (error) {
        console.error("Error in POST /api/register/session-image:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { action } = await req.json();

        if (action !== 'promote-next') {
            return NextResponse.json(
                { success: false, error: 'Invalid action' },
                { status: 400 }
            );
        }

        // Find the next session image
        const nextImages = await db.select().from(registrationImage).where(eq(registrationImage.slot, 'next'));

        if (nextImages.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No next session image to promote' },
                { status: 404 }
            );
        }

        // Delete the current session image if it exists
        const currentImages = await db.select().from(registrationImage).where(eq(registrationImage.slot, 'current'));

        if (currentImages.length > 0) {
            try {
                await s3.send(new DeleteObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: `registration/current`,
                }));
            } catch (error) {
                console.error('S3 delete error (non-fatal):', error);
            }
            await db.delete(registrationImage).where(eq(registrationImage.id, currentImages[0].id));
        }

        // Update the next session record to become current
        const [result] = await db.update(registrationImage)
            .set({
                slot: 'current',
                updatedAt: new Date(),
            })
            .where(eq(registrationImage.id, nextImages[0].id))
            .returning();

        return NextResponse.json({
            success: true,
            body: result,
        }, { status: 200 });
    } catch (error) {
        console.error("Error in PATCH /api/register/session-image:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { slot } = await req.json();

        if (!slot) {
            return NextResponse.json(
                { success: false, error: 'Slot is required' },
                { status: 400 }
            );
        }

        // Find the existing record for this slot
        const existingImages = await db.select().from(registrationImage).where(eq(registrationImage.slot, slot));

        if (existingImages.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No image found for this slot' },
                { status: 404 }
            );
        }

        // Delete from S3
        try {
            await s3.send(new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: `registration/${slot}`,
            }));
        } catch (error) {
            console.error('S3 delete error (non-fatal):', error);
        }

        // Delete from DB
        await db.delete(registrationImage).where(eq(registrationImage.id, existingImages[0].id));

        return NextResponse.json({
            success: true,
        }, { status: 200 });
    } catch (error) {
        console.error("Error in DELETE /api/register/session-image:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
