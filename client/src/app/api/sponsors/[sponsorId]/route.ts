import { db } from "@/lib/db";
import { sponsors } from "@/lib/schema";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

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

async function deleteFromS3(url: string) {
    const key = url.substring(1);
    await s3.send(new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    }));
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