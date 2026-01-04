import {
    CloudWatchClient,
    GetMetricDataCommand,
    type GetMetricDataCommandInput,
} from "@aws-sdk/client-cloudwatch";
import { NextResponse } from "next/server";

// IMPORTANT: S3 storage metrics (BucketSizeBytes) are published to CloudWatch once per day.
// This endpoint returns the most recent datapoint available.

export const runtime = "nodejs"; // AWS SDK + credentials providers require Node runtime (not Edge)
export const dynamic = "force-dynamic"; // don't cache at build time

function latestPoint(values: number[] | undefined, timestamps: Date[] | undefined) {
  const v = values ?? [];
  const t = timestamps ?? [];
  if (v.length === 0 || t.length === 0) return null;

  let latestIdx = 0;
  for (let i = 1; i < t.length; i++) {
    if (t[i].getTime() > t[latestIdx].getTime()) latestIdx = i;
  }

  return { bytes: v[latestIdx], timestamp: t[latestIdx] };
}

export async function GET() {
  const bucketName = process.env.AWS_BUCKET_NAME;
  const storageType = process.env.S3_STORAGE_TYPE || "StandardStorage";

  if (!bucketName) {
    return NextResponse.json(
      { error: "Missing env var AWS_BUCKET_NAME" },
      { status: 400 }
    );
  }

  // Region matters for CloudWatch. In most setups AWS_REGION is already set.
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
  if (!region) {
    return NextResponse.json(
      { error: "Missing AWS region (set AWS_REGION)" },
      { status: 400 }
    );
  }

  // Fetch the last 14 days to ensure we capture the most recent daily datapoint.
  // S3 BucketSizeBytes metrics are published once per day and can have delays.
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - 14 * 24 * 60 * 60 * 1000);

  // CloudWatch Client configuration
  const cloudWatchConfig: { region: string; credentials?: { accessKeyId: string; secretAccessKey: string } } = {
    region,
  };

  // Only add explicit credentials if both are provided
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    cloudWatchConfig.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
  }

  const client = new CloudWatchClient(cloudWatchConfig);

  // Query for the total bucket size across all storage types
  // This ensures we get the complete picture if objects are in different storage classes
  const input: GetMetricDataCommandInput = {
    StartTime: startTime,
    EndTime: endTime,
    MetricDataQueries: [
      {
        Id: "bucketSize",
        MetricStat: {
          Metric: {
            Namespace: "AWS/S3",
            MetricName: "BucketSizeBytes",
            Dimensions: [
              { Name: "BucketName", Value: bucketName },
              { Name: "StorageType", Value: storageType },
            ],
          },
          Period: 86400, // 1 day in seconds
          Stat: "Average", // Average is appropriate for a single period - gives us the total size at that point
        },
        ReturnData: true,
      },
    ],
  };

  try {
    const out = await client.send(new GetMetricDataCommand(input));
    const result = out.MetricDataResults?.[0];

    // Debug logging (remove in production if needed)
    if (process.env.NODE_ENV === 'development') {
      console.log('CloudWatch response:', {
        statusCode: out.$metadata?.httpStatusCode,
        values: result?.Values,
        timestamps: result?.Timestamps,
        valuesLength: result?.Values?.length,
      });
    }

    const latest = latestPoint(result?.Values, result?.Timestamps);
    if (!latest) {
      return NextResponse.json(
        {
          bucket: bucketName,
          storageType,
          error: "No datapoints returned yet.",
          note:
            "S3 BucketSizeBytes is published once per day; it can take ~24h after bucket activity for data to appear. Try extending the time range or check if CloudWatch metrics are enabled for this bucket.",
          debug: process.env.NODE_ENV === 'development' ? {
            valuesCount: result?.Values?.length || 0,
            timestampsCount: result?.Timestamps?.length || 0,
            statusCode: out.$metadata?.httpStatusCode,
          } : undefined,
        },
        { status: 404 }
      );
    }

    // BucketSizeBytes represents the TOTAL size of all objects in the bucket
    // at the time of the metric, not a delta or change amount
    const gb = latest.bytes / 1024 ** 3;
    const mb = latest.bytes / 1024 ** 2;

    // Avoid CDN caching; callers can add their own caching if desired.
    return NextResponse.json(
      {
        bucket: bucketName,
        storageType,
        bytes: latest.bytes,
        mb: Number(mb.toFixed(2)),
        gb: Number(gb.toFixed(3)),
        timestamp: latest.timestamp.toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err?.name || "CloudWatchError",
        message: err?.message || "Failed to query CloudWatch",
        details: err?.stack || undefined,
      },
      { status: 500 }
    );
  }
}