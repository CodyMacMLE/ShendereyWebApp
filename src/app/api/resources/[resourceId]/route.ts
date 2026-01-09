import { db } from "@/lib/db";
import { resources } from "@/lib/schema";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// S3 Client configuration
const s3Config: { region: string; credentials?: { accessKeyId: string; secretAccessKey: string } } = {
  region: process.env.AWS_REGION!,
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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ resourceId: string }> }) {
    try {
        const { resourceId } = await params;
        const id = parseInt(resourceId);

        if (!id || isNaN(id)) {
            return NextResponse.json({ success: false, error: "Invalid or missing resource ID" }, { status: 400 });
        }

        // Fetch the resource to get its S3 URL before deleting
        const resource = await db.select().from(resources).where(eq(resources.id, id));
        
        if (resource.length === 0) {
            return NextResponse.json({ success: false, error: "Resource not found" }, { status: 404 });
        }

        // Delete from S3 if resource URL exists
        if (resource[0].resourceUrl) {
            await deleteFromS3(resource[0].resourceUrl);
        }

        // Delete from database
        await db.delete(resources).where(eq(resources.id, id));
        
        return NextResponse.json({ success: true, body: id }, { status: 200 });
    } catch (error) {
        console.error("Error in DELETE /api/resources/[resourceId]:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
