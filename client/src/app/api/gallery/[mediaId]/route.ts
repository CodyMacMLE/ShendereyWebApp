import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gallery } from "@/lib/schema";
import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET_NAME = process.env.AWS_BUCKET_NAME!;

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ mediaId: string }> }
) {
  const { mediaId } = await context.params;

  const formData = await req.formData();
  const name = formData.get('name')?.toString() || '';
  const description = formData.get('description')?.toString() || '';
  const dateRaw = formData.get('date');
  const date = typeof dateRaw === 'string' ? new Date(dateRaw) : null;

  if (!mediaId) {
    return NextResponse.json({ success: false, error: 'Missing mediaId query param' }, { status: 400 });
  }

  try {
    await db.update(gallery)
      .set({ name, description, date })
      .where(eq(gallery.id, parseInt(mediaId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ mediaId: string }> }
) {
  const { mediaId } = await context.params;

  if (!mediaId) {
    return NextResponse.json({ success: false, error: 'Missing mediaId query param' }, { status: 400 });
  }

  try {
    const [target] = await db.select().from(gallery).where(eq(gallery.id, parseInt(mediaId)));
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

    await db.delete(gallery).where(eq(gallery.id, parseInt(mediaId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}