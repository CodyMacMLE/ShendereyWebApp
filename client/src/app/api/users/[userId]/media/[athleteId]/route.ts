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
import fs from 'fs/promises';
import path from 'path';
import { file as tmpFile } from 'tmp-promise';
const ffmpegPath = '/opt/homebrew/bin/ffmpeg'

if (!ffmpegPath) {
  throw new Error('ffmpeg binary not found');
}
Ffmpeg.setFfmpegPath(ffmpegPath);

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
  const formData = await req.formData();
  try {
    const mediaType = formData.get('mediaType');
    const mediaRaw = formData.get('media');
    const mediaUrl = mediaRaw instanceof File ? await uploadToS3(mediaRaw, 'athlete/media') : '';

    let thumbnailUrl = '';

    if (mediaRaw instanceof File && mediaType?.toString().startsWith('video/')) {
      const arrayBuffer = await mediaRaw.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { path: tmpVideoPath } = await tmpFile({ postfix: path.extname(mediaRaw.name) });
      await fs.writeFile(tmpVideoPath, buffer);

      const getVideoDimensions = (): Promise<{ width: number; height: number }> => {
        return new Promise((resolve, reject) => {
          Ffmpeg.ffprobe(tmpVideoPath, (err, metadata) => {
            if (err) return reject(err);
            const stream = metadata.streams.find(s => s.width && s.height);
            if (!stream) return reject(new Error('No video stream found'));
            resolve({ width: stream.width!, height: stream.height! });
          });
        });
      };

      const { width, height } = await getVideoDimensions();
      const isPortrait = height > width;
      const thumbnailSize = isPortrait ? '360x640' : '640x360';

      const tmpThumb = await tmpFile({ postfix: '.jpg' });
      const thumbPath = tmpThumb.path;

      await new Promise((resolve, reject) => {
        // Ensure thumbPath is not null
        if (!thumbPath) {
          return reject(new Error('Thumbnail path is null'));
        }

        
        Ffmpeg(tmpVideoPath)
          .on('end', resolve)
          .on('error', reject)
          .screenshots({
            timestamps: ['5'],
            filename: path.basename(thumbPath),
            folder: path.dirname(thumbPath),
            size: thumbnailSize,
          });
      });

      const thumbBuffer = await fs.readFile(thumbPath);
      const thumbKey = `athlete/media/thumbnails/${randomUUID()}.jpg`;

      await s3.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: thumbKey,
        Body: thumbBuffer,
        ContentType: 'image/jpeg'
      }));

      thumbnailUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${thumbKey}`;

      await tmpThumb.cleanup();
    }
    

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
      videoThumbnail: thumbnailUrl || ''
    })

    const fetchedMedia = await db.select().from(media).where(eq(media.athlete, parseInt(athleteId)))

    return NextResponse.json({ success: true, body: fetchedMedia });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
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
    const [target] = await db.select().from(media).where(eq(media.id, parseInt(mediaId)));
    if (!target) {
      return NextResponse.json({ success: false, error: 'Media not found' }, { status: 404 });
    }

    const commands = [];

    if (target.mediaUrl) {
      const mediaKey = target.mediaUrl.split('.com/')[1];
      if (mediaKey) {
        commands.push(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: mediaKey }));
      }
    }

    if (target.videoThumbnail && target.mediaType?.startsWith('video/')) {
      const thumbKey = target.videoThumbnail.split('.com/')[1];
      if (thumbKey) {
        commands.push(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: thumbKey }));
      }
    }

    for (const cmd of commands) {
      await s3.send(cmd);
    }

    await db.delete(media).where(eq(media.id, parseInt(mediaId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}