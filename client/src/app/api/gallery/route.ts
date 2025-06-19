import { db } from '@/lib/db';
import { gallery } from '@/lib/schema';
import { NextRequest, NextResponse } from 'next/server';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

import { file as tmpFile } from 'tmp-promise';
import path from 'path';
import fs from 'fs/promises';
const ffmpegPath = '/opt/homebrew/bin/ffmpeg'
import Ffmpeg from 'fluent-ffmpeg';

if (!ffmpegPath) {
  throw new Error('ffmpeg binary not found');
}
Ffmpeg.setFfmpegPath(ffmpegPath);

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
    ContentType: file.type
  }));

  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

export async function POST(
  req: NextRequest
) {
  const formData = await req.formData();
  try {
    const mediaType = formData.get('mediaType');
    const mediaRaw = formData.get('media');
    const mediaUrl = mediaRaw instanceof File ? await uploadToS3(mediaRaw, 'gallery') : '';

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
      const thumbKey = `gallery/thumbnails/${randomUUID()}.jpg`;

      await s3.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: thumbKey,
        Body: thumbBuffer,
        ContentType: 'image/jpeg'
      }));

      thumbnailUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${thumbKey}`;

      await tmpThumb.cleanup();
    }
    

    const name = formData.get('name');
    const description = formData.get('description');
    const dateRaw = formData.get('date');
    const date = typeof dateRaw === 'string' ? new Date(dateRaw) : null;

    const fetchedMedia = await db.insert(gallery).values({
      name: name?.toString() || '',
      description: description?.toString() || '',
      date: date,
      mediaType: mediaType?.toString() || '',
      mediaUrl: mediaUrl,
      videoThumbnail: thumbnailUrl || ''
    }).returning();

    return NextResponse.json({ success: true, body: fetchedMedia[0] });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
    try {
        const fetchedMedia = await db.select().from(gallery);
        return NextResponse.json({ success: true, body: fetchedMedia });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}