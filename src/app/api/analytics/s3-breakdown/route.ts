import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const s3Config: {
    region: string;
    credentials?: { accessKeyId: string; secretAccessKey: string };
} = { region: process.env.AWS_REGION! };

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    s3Config.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
}

const s3 = new S3Client(s3Config);

type Category = 'gallery' | 'team' | 'content' | 'resources';

function categorize(key: string): Category {
    if (key.startsWith('gallery/')) return 'gallery';
    if (
        key.startsWith('coach/') ||
        key.startsWith('athlete/') ||
        key.startsWith('prospect/') ||
        key.startsWith('alumni/')
    ) return 'team';
    if (
        key.startsWith('registration/') ||
        key.startsWith('program/') ||
        key.startsWith('sponsors/') ||
        key.startsWith('products/')
    ) return 'content';
    if (key.startsWith('resources/')) return 'resources';
    return 'content'; // catch-all
}

export async function GET() {
    const bucketName = process.env.AWS_BUCKET_NAME;
    if (!bucketName) {
        return NextResponse.json({ error: 'Missing AWS_BUCKET_NAME' }, { status: 400 });
    }

    const tally: Record<Category, { bytes: number; count: number }> = {
        gallery:   { bytes: 0, count: 0 },
        team:      { bytes: 0, count: 0 },
        content:   { bytes: 0, count: 0 },
        resources: { bytes: 0, count: 0 },
    };

    let totalBytes = 0;
    let totalCount = 0;
    let continuationToken: string | undefined;
    const MAX_OBJECTS = 10_000; // safety cap for very large buckets

    try {
        do {
            const res = await s3.send(
                new ListObjectsV2Command({
                    Bucket: bucketName,
                    ContinuationToken: continuationToken,
                    MaxKeys: 1000,
                })
            );

            for (const obj of res.Contents ?? []) {
                const bytes = obj.Size ?? 0;
                const key = obj.Key ?? '';
                const cat = categorize(key);
                tally[cat].bytes += bytes;
                tally[cat].count += 1;
                totalBytes += bytes;
                totalCount += 1;
            }

            continuationToken = res.NextContinuationToken;
            if (totalCount >= MAX_OBJECTS) break;
        } while (continuationToken);

        return NextResponse.json(
            { totalBytes, totalCount, breakdown: tally },
            { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' } }
        );
    } catch (err) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Failed to list S3 objects' },
            { status: 500 }
        );
    }
}
