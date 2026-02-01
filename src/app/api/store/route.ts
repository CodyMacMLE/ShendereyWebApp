import { db } from '@/lib/db';
import { products } from '@/lib/schema';
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
        const allProducts = await db.select().from(products)

        return NextResponse.json({success: true, body: allProducts}, {status: 200})
    } catch (error) {
        console.error("Error in GET /api/store:", error);
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
        const category = formData.get('category') as string;
        const sizes = formData.get('sizes') as string;
        const description = formData.get('description') as string;
        const price = parseFloat(formData.get('price') as string);

        // Handle S3 uploads for image with type checking
        const productImgRaw = formData.get('media');
        const productImgUrl = productImgRaw instanceof File ? await uploadToS3(productImgRaw, 'products') : '';

        // Insert Data into DB
        const insertedProduct = await db.insert(products).values({
            name: name?.toString() || '',
            category: category?.toString() || '',
            sizes: sizes?.toString() || '',
            description: description?.toString() || '',
            price: isNaN(price) ? 0 : price,
            productImgUrl: productImgUrl,
        }).returning();

        // Return Product to Front-end
        return NextResponse.json({ success: true, body: insertedProduct[0] }, { status: 200 });

    } catch (error) {
        console.error("Error in POST /api/store:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
