import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

// S3 Client configuration - initialize lazily when needed
function getS3Client(): S3Client {
  const s3Config: { region: string; credentials?: { accessKeyId: string; secretAccessKey: string } } = {
    region: process.env.AWS_REGION || '',
  };

  // Only add explicit credentials if both are provided
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    s3Config.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
  }

  return new S3Client(s3Config);
}

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || '';

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

    const s3 = getS3Client();
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