import {
    CloudWatchClient,
    GetMetricDataCommand,
} from '@aws-sdk/client-cloudwatch';

const MAX_STORAGE_BYTES = 200 * 1024 ** 3; // 200 GB hard cap

export type StorageCheckResult =
    | { allowed: true;  currentBytes: number }
    | { allowed: false; currentBytes: number; message: string };

/**
 * Queries the most recent CloudWatch S3 BucketSizeBytes datapoint and
 * returns whether a new upload is permitted under the 200 GB hard cap.
 *
 * Fails OPEN (allows the upload) when CloudWatch is unavailable or has no
 * data yet, so that a monitoring outage never blocks legitimate uploads.
 */
export async function checkStorageLimit(): Promise<StorageCheckResult> {
    const bucketName = process.env.AWS_BUCKET_NAME;
    const region     = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;

    if (!bucketName || !region) {
        console.warn('[storage-limit] Missing AWS_BUCKET_NAME or AWS_REGION — skipping check');
        return { allowed: true, currentBytes: 0 };
    }

    const cwConfig: {
        region: string;
        credentials?: { accessKeyId: string; secretAccessKey: string };
    } = { region };

    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        cwConfig.credentials = {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        };
    }

    const client = new CloudWatchClient(cwConfig);

    const endTime   = new Date();
    const startTime = new Date(endTime.getTime() - 14 * 24 * 60 * 60 * 1000); // last 14 days

    try {
        const out = await client.send(
            new GetMetricDataCommand({
                StartTime: startTime,
                EndTime:   endTime,
                MetricDataQueries: [{
                    Id: 'bucketSize',
                    MetricStat: {
                        Metric: {
                            Namespace:  'AWS/S3',
                            MetricName: 'BucketSizeBytes',
                            Dimensions: [
                                { Name: 'BucketName',   Value: bucketName },
                                { Name: 'StorageType',  Value: process.env.S3_STORAGE_TYPE || 'StandardStorage' },
                            ],
                        },
                        Period: 86400, // daily
                        Stat:   'Average',
                    },
                    ReturnData: true,
                }],
            })
        );

        const result     = out.MetricDataResults?.[0];
        const values     = result?.Values     ?? [];
        const timestamps = result?.Timestamps ?? [];

        if (values.length === 0) {
            // Bucket is new or < 24 h old — no data yet, fail open
            console.warn('[storage-limit] No CloudWatch datapoints available — skipping check');
            return { allowed: true, currentBytes: 0 };
        }

        // Find the most recent datapoint
        let latestIdx = 0;
        for (let i = 1; i < timestamps.length; i++) {
            if (timestamps[i].getTime() > timestamps[latestIdx].getTime()) latestIdx = i;
        }

        const currentBytes = values[latestIdx];

        if (currentBytes >= MAX_STORAGE_BYTES) {
            const currentGB = (currentBytes / 1024 ** 3).toFixed(2);
            return {
                allowed: false,
                currentBytes,
                message: `Storage limit reached (${currentGB} GB / 200 GB). Delete unused files to free space before uploading.`,
            };
        }

        return { allowed: true, currentBytes };

    } catch (err) {
        // CloudWatch unavailable — fail open so monitoring issues don't break uploads
        console.warn('[storage-limit] CloudWatch check failed, skipping:', err instanceof Error ? err.message : err);
        return { allowed: true, currentBytes: 0 };
    }
}
