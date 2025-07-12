import { db } from "@/lib/db";
import { resources } from "@/lib/schema";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

async function deleteFromS3(url: string) {
    try {
        // Extract the key from the S3 URL
        const key = url.replace(`https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`, '');
        
        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: key,
        });
        await s3.send(command);
    } catch (error) {
        console.error("Error in deleteFromS3:", error);
        throw new Error(`Failed to delete file from S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

async function uploadToS3(file: File, keyPrefix: string) {
    try {
        const key = `${keyPrefix}/${randomUUID()}-${file.name}`;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: key,
            Body: buffer,
            ContentType: file.type,
        };

        const command = new PutObjectCommand(uploadParams);
        await s3.send(command);
        
        // Return the S3 URL
        return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
        console.error("Error in uploadToS3:", error);
        throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function GET() {
    try {
        const allResources = await db.select().from(resources)
    
        return NextResponse.json({success: true, body: allResources}, {status: 200})
    } catch (error) {
        console.error("Error in GET /api/resources:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const name = formData.get('name') as string;
        const size = formData.get('size') as unknown as number;
        const downloads = formData.get('downloads') as unknown as number || 0;
        const resourceFile = formData.get('resourceFile') as unknown as File;

        const resourceUrl = await uploadToS3(resourceFile, 'resources');
        
        const newResource = await db.insert(resources).values({
            name: name,
            size: size,
            downloads: downloads,
            resourceUrl: resourceUrl,
        })

        return NextResponse.json({success: true, body: newResource}, {status: 200})
    } catch (error) {
        console.error("Error in POST /api/resources:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const formData = await req.formData();
        const id = formData.get('id') as unknown as number;
        const resource = await db.select().from(resources).where(eq(resources.id, id));
        if (resource[0].resourceUrl) {
            await deleteFromS3(resource[0].resourceUrl);
        }
        await db.delete(resources).where(eq(resources.id, id));
        return NextResponse.json({success: true, body: id}, {status: 200})
    } catch (error) {
        console.error("Error in DELETE /api/resources:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const formData = await req.formData();
        const id = formData.get('id') as unknown as number;
        const name = formData.get('name') as string;
        const size = formData.get('size') as unknown as number;
        const resourceFile = formData.get('resourceFile') as unknown as File;

        const resource = await db.select().from(resources).where(eq(resources.id, id));
        let resourceUrl = resource[0].resourceUrl;
        let updatedResource = null;

        if (resourceFile && resourceFile.size > 0) {
            if (resource[0].resourceUrl) {
                await deleteFromS3(resource[0].resourceUrl);
            }
            resourceUrl = await uploadToS3(resourceFile, 'resources');

            updatedResource = await db.update(resources).set({
                name: name,
                size: size,
                resourceUrl: resourceUrl || null,
            }).where(eq(resources.id, id));
        } else {
            updatedResource = await db.update(resources).set({
                name: name,
                size: size
            }).where(eq(resources.id, id));
        }

        return NextResponse.json({success: true, body: updatedResource}, {status: 200})
    } catch (error) {
        console.error("Error in PUT /api/resources:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}