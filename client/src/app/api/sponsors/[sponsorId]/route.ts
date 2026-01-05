import { db } from "@/lib/db";
import { sponsors } from "@/lib/schema";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Validate required environment variables
if (!process.env.AWS_REGION) {
  throw new Error('AWS_REGION environment variable is required');
}
if (!process.env.AWS_BUCKET_NAME) {
  throw new Error('AWS_BUCKET_NAME environment variable is required');
}

// S3 Client configuration
const s3Config: { region: string; credentials?: { accessKeyId: string; secretAccessKey: string } } = {
  region: process.env.AWS_REGION,
};

// Only add explicit credentials if both are provided
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3Config.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}

const s3 = new S3Client(s3Config);
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
      ContentType: file.type,
    }));
  
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function deleteFromS3(url: string) {
    try {
        // Extract the key from the S3 URL
        const key = url.replace(`https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`, '');
        
        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });
        await s3.send(command);
    } catch (error) {
        console.error("Error in deleteFromS3:", error);
        throw new Error(`Failed to delete file from S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ sponsorId: string }> }) {
    const { sponsorId } = await params;
    const id = parseInt(sponsorId);

    if (!id) {
        return NextResponse.json({ success: false, error: "Missing sponsor ID" }, { status: 400 });
    }

    try {
        const sponsor = await db.select().from(sponsors).where(eq(sponsors.id, id));
        if (sponsor.length > 0) {
            const sponsorImgUrl = sponsor[0].sponsorImgUrl;
            if (sponsorImgUrl) {
                await deleteFromS3(sponsorImgUrl);
            }
        }
        await db.delete(sponsors).where(eq(sponsors.id, id));
        return NextResponse.json({ success: true, body: id }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
} 

export async function PUT(req: NextRequest, { params }: { params: Promise<{ sponsorId: string }> }) {
    const { sponsorId } = await params;
    const id = parseInt(sponsorId);
    const formData = await req.formData();
    const website = formData.get('website');
    const description = formData.get('description');
    const organization = formData.get('organization');
    const sponsorLevel = formData.get('sponsorLevel');
    const sponsorImgRaw = formData.get('media');
    let newSponsorImgUrl = null;

    if (!id) {
        return NextResponse.json({ success: false, error: "Missing sponsor ID" }, { status: 400 });
    }

    if (sponsorImgRaw) {
        const sponsorImg = sponsorImgRaw as File;
        try {
            const sponsor = await db.select().from(sponsors).where(eq(sponsors.id, id));
            if (sponsor[0].sponsorImgUrl) {
                await deleteFromS3(sponsor[0].sponsorImgUrl);
            }
            newSponsorImgUrl = await uploadToS3(sponsorImg, 'sponsors');
        } catch (error) {
            return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
        }
    }

    const getString = (val: FormDataEntryValue | null) =>
      typeof val === "string" ? val : null;

    try {
        const sponsor = await db.update(sponsors).set({
            website: getString(website),
            description: getString(description),
            organization: getString(organization),
            sponsorLevel: getString(sponsorLevel),
            sponsorImgUrl: newSponsorImgUrl,
        }).where(eq(sponsors.id, id)).returning();

        return NextResponse.json({ success: true, body: sponsor[0] }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}