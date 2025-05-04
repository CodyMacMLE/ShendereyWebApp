import { db } from '@/lib/db';
import { media } from '@/lib/schema';
import { eq } from 'drizzle-orm/sql';
import { NextRequest, NextResponse } from 'next/server';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

import { file as tmpFile } from 'tmp-promise';
import path from 'path';
import fs from 'fs/promises';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';

ffmpeg.setFfmpegPath(ffmpegPath.path);

const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET_NAME = process.env.AWS_BUCKET_NAME!;

async function uploadToS3(file: File, keyPrefix: string) {
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

      const { path: tmpVideoPath, cleanup } = await tmpFile({ postfix: path.extname(mediaRaw.name) });
      await fs.writeFile(tmpVideoPath, buffer);

      const { path: thumbPath } = await tmpFile({ postfix: '.jpg' });

      await new Promise((resolve, reject) => {
        ffmpeg(tmpVideoPath)
          .on('end', resolve)
          .on('error', reject)
          .screenshots({
            timestamps: ['1'],
            filename: path.basename(thumbPath),
            folder: path.dirname(thumbPath),
            size: '320x240',
          });
      });

      const thumbBuffer = await fs.readFile(thumbPath);
      const thumbKey = `athlete/media/thumbnails/${randomUUID()}.jpg`;

      await s3.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: thumbKey,
        Body: thumbBuffer,
        ContentType: 'image/jpeg',
      }));

      thumbnailUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${thumbKey}`;

      await cleanup();
    }
    

    const title = formData.get('name');
    const description = formData.get('description');
    const dateRaw = formData.get('date');
    const date = typeof dateRaw === 'string' ? new Date(dateRaw) : null;
    

    await db.insert(media).values({
      athlete: parseInt(athleteId),
      name: title?.toString() || '',
      description: description?.toString() || '',
      date,
      mediaType: mediaType?.toString() || '',
      mediaUrl,
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