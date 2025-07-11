import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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
    const { fileName, fileType } = await req.json();
    const { searchParams } = new URL(req.url);
    const prefix = searchParams.get('prefix') || 'athlete/media/';

    if (!fileName || !fileType) {
      return NextResponse.json(
        { success: false, error: 'fileName and fileType are required' },
        { status: 400 }
      );
    }

    const key = `${prefix}${randomUUID()}-${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour

    return NextResponse.json({
      success: true,
      uploadUrl: presignedUrl,
      key: key,
      mediaUrl: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
    });

  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 