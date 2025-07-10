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

const s3 = new S3Client({ 
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
});
const BUCKET_NAME = process.env.AWS_BUCKET_NAME!;

export async function POST(
  req: NextRequest,
) {
  try {
    const formData = await req.formData();
    const thumbnailFile = formData.get('thumbnail') as File;

    if (!thumbnailFile) {
      return NextResponse.json(
        { success: false, error: 'Thumbnail file is required' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await thumbnailFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const key = `athlete/media/thumbnails/${randomUUID()}-${thumbnailFile.name}`;
    
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: thumbnailFile.type || 'image/jpeg',
    }));

    const thumbnailUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return NextResponse.json({
      success: true,
      thumbnailUrl: thumbnailUrl,
    });

  } catch (error) {
    console.error('Error uploading thumbnail:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 