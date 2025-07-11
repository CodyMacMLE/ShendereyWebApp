import { db } from '@/lib/db';
import { media } from '@/lib/schema';
import { eq } from 'drizzle-orm/sql';
import { NextRequest, NextResponse } from 'next/server';

// Configure route to handle larger file uploads
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes timeout

import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

import Ffmpeg from 'fluent-ffmpeg';
import { existsSync } from 'fs';
// FFmpeg configuration - only set paths if binaries exist
const ffmpegPath = process.env.FFMPEG_PATH || '/opt/homebrew/bin/ffmpeg';
const ffprobePath = process.env.FFPROBE_PATH || '/opt/homebrew/bin/ffprobe';

// Check if we're in a Vercel environment
const isVercel = process.env.VERCEL === '1';

if (!isVercel) {
  // Only set FFmpeg paths in development/local environment
  try {
    if (existsSync(ffmpegPath)) {
      Ffmpeg.setFfmpegPath(ffmpegPath);
    }
    if (existsSync(ffprobePath)) {
      Ffmpeg.setFfprobePath(ffprobePath);
    }
  } catch {
    console.warn('FFmpeg not available, thumbnail generation will be skipped');
  }
}

// Validate required environment variables
if (!process.env.AWS_REGION) {
  throw new Error('AWS_REGION environment variable is required');
}
if (!process.env.AWS_BUCKET_NAME) {
  throw new Error('AWS_BUCKET_NAME environment variable is required');
}
if (!process.env.AWS_ACCESS_KEY_ID) {
  throw new Error('AWS_ACCESS_KEY_ID environment variable is required');
}
if (!process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error('AWS_SECRET_ACCESS_KEY environment variable is required');
}

const s3 = new S3Client({ 
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

// Helper function to test S3 connectivity and permissions
async function testS3Access() {
  try {
    // Try to list objects in the bucket to test access
    const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');
    await s3.send(new ListObjectsV2Command({ Bucket: BUCKET_NAME, MaxKeys: 1 }));
    console.log('S3 access test successful');
    return true;
  } catch (error) {
    console.error('S3 access test failed:', error);
    return false;
  }
}

async function uploadToS3(file: File, keyPrefix: string) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const key = `${keyPrefix}/${randomUUID()}-${file.name}`;

    await s3.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type
    }));

    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ userId: string, athleteId: string }> }
) {
  const { athleteId } = await context.params;
  
  // Check if this is a JSON request (for direct S3 upload) or FormData request
  const contentType = req.headers.get('content-type');
  
  if (contentType?.includes('application/json')) {
    // Handle JSON request (direct S3 upload)
    const body = await req.json();
    const { name, description, category, date, mediaType, mediaUrl, videoThumbnail } = body;
    
    try {
      // Use the thumbnail URL provided by the client, or default to empty string
      const thumbnailUrl = videoThumbnail || '';

      await db.insert(media).values({
        athlete: parseInt(athleteId),
        name: name || '',
        description: description || '',
        category: category || '',
        date: date ? new Date(date) : null,
        mediaType: mediaType || '',
        mediaUrl: mediaUrl || '',
        videoThumbnail: thumbnailUrl
      });

      const fetchedMedia = await db.select().from(media).where(eq(media.athlete, parseInt(athleteId)));

      return NextResponse.json({ success: true, body: fetchedMedia });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }
  } else {
    // Handle FormData request (legacy upload - keeping for backward compatibility)
    const formData = await req.formData();
    try {
      const mediaType = formData.get('mediaType');
      const mediaRaw = formData.get('media');
      const mediaUrl = mediaRaw instanceof File ? await uploadToS3(mediaRaw, 'athlete/media') : '';
      
      // Handle videoThumbnail - ensure it's a string
      const thumbnailRaw = formData.get('videoThumbnail');
      const thumbnailUrl = typeof thumbnailRaw === 'string' ? thumbnailRaw : '';

      const title = formData.get('name');
      const description = formData.get('description');
      const category = formData.get('category');
      const dateRaw = formData.get('date');
      const date = typeof dateRaw === 'string' ? new Date(dateRaw) : null;

      await db.insert(media).values({
        athlete: parseInt(athleteId),
        name: title?.toString() || '',
        description: description?.toString() || '',
        category: category?.toString() || '',
        date: date,
        mediaType: mediaType?.toString() || '',
        mediaUrl: mediaUrl,
        videoThumbnail: thumbnailUrl
      });

      const fetchedMedia = await db.select().from(media).where(eq(media.athlete, parseInt(athleteId)));

      return NextResponse.json({ success: true, body: fetchedMedia });
    
    } catch (error) {
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ athleteId: string }> }
) {
  const { athleteId } = await context.params;
  try {
    const userMedia = await db.select().from(media).where(eq(media.athlete, parseInt(athleteId)));
    return NextResponse.json({success: true, body: userMedia})
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest
) {
  const { searchParams } = req.nextUrl;
  const mediaId = searchParams.get('mediaId');

  const formData = await req.formData();
  const name = formData.get('name')?.toString() || '';
  const category = formData.get('category')?.toString() || '';
  const description = formData.get('description')?.toString() || '';
  const dateRaw = formData.get('date');
  const date = typeof dateRaw === 'string' ? new Date(dateRaw) : null;

  if (!mediaId) {
    return NextResponse.json({ success: false, error: 'Missing mediaId query param' }, { status: 400 });
  }

  try {
    await db.update(media)
      .set({ name, description, category, date })
      .where(eq(media.id, parseInt(mediaId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest
) {
  const { searchParams } = req.nextUrl;
  const mediaId = searchParams.get('mediaId');

  if (!mediaId) {
    return NextResponse.json({ success: false, error: 'Missing mediaId query param' }, { status: 400 });
  }

  try {
    // Test S3 access first
    const s3AccessOk = await testS3Access();
    if (!s3AccessOk) {
      console.error('S3 access test failed - cannot proceed with deletion');
      return NextResponse.json({ success: false, error: 'S3 access test failed' }, { status: 500 });
    }

    const [target] = await db.select().from(media).where(eq(media.id, parseInt(mediaId)));
    
    if (!target) {
      return NextResponse.json({ success: false, error: 'Media not found' }, { status: 404 });
    }

    console.log('Target media record:', {
      id: target.id,
      mediaUrl: target.mediaUrl,
      videoThumbnail: target.videoThumbnail,
      mediaType: target.mediaType
    });

    const commands = [];
    const deletionResults = [];

    // Helper function to extract S3 key from URL
    function extractS3Key(url: string): string | null {
      try {
        const urlObj = new URL(url);
        // Remove leading slash from pathname
        return urlObj.pathname.substring(1);
      } catch (error) {
        console.error('Failed to parse URL:', url, error);
        return null;
      }
    }

    if (target.mediaUrl) {
      const mediaKey = extractS3Key(target.mediaUrl);
      if (mediaKey) {
        console.log(`Attempting to delete media file with key: ${mediaKey}`);
        commands.push(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: mediaKey }));
        deletionResults.push({ type: 'media', key: mediaKey });
      } else {
        console.warn(`Could not extract key from mediaUrl: ${target.mediaUrl}`);
      }
    }

    if (target.videoThumbnail && target.mediaType?.startsWith('video/')) {
      const thumbKey = extractS3Key(target.videoThumbnail);
      if (thumbKey) {
        console.log(`Attempting to delete thumbnail with key: ${thumbKey}`);
        commands.push(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: thumbKey }));
        deletionResults.push({ type: 'thumbnail', key: thumbKey });
      } else {
        console.warn(`Could not extract key from videoThumbnail: ${target.videoThumbnail}`);
      }
    }

    // Execute S3 deletions with better error handling
    for (const cmd of commands) {
      try {
        await s3.send(cmd);
        console.log(`Successfully deleted S3 object: ${cmd.input.Key}`);
      } catch (s3Error) {
        console.error(`Failed to delete S3 object ${cmd.input.Key}:`, s3Error);
        // Continue with other deletions even if one fails
      }
    }

    // Delete from database
    await db.delete(media).where(eq(media.id, parseInt(mediaId)));
    console.log(`Successfully deleted media record from database: ${mediaId}`);

    return NextResponse.json({ 
      success: true, 
      deletedFiles: deletionResults,
      message: `Deleted ${deletionResults.length} file(s) from S3 and database record`
    });
  } catch (error) {
    console.error('DELETE operation failed:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}