import { db } from "@/lib/db";
import { products } from "@/lib/schema";
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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
    const { productId } = await params;
    const id = parseInt(productId);

    if (!id) {
        return NextResponse.json({ success: false, error: "Missing product ID" }, { status: 400 });
    }

    try {
        const product = await db.select().from(products).where(eq(products.id, id));
        if (product.length > 0) {
            const productImgUrl = product[0].productImgUrl;
            if (productImgUrl) {
                await deleteFromS3(productImgUrl);
            }
        }
        await db.delete(products).where(eq(products.id, id));
        return NextResponse.json({ success: true, body: id }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
    const { productId } = await params;
    const id = parseInt(productId);
    const formData = await req.formData();
    const name = formData.get('name');
    const category = formData.get('category');
    const sizes = formData.get('sizes');
    const description = formData.get('description');
    const price = formData.get('price');
    const productImgRaw = formData.get('media');
    let newProductImgUrl = null;

    if (!id) {
        return NextResponse.json({ success: false, error: "Missing product ID" }, { status: 400 });
    }

    if (productImgRaw) {
        const productImg = productImgRaw as File;
        try {
            const product = await db.select().from(products).where(eq(products.id, id));
            if (product[0].productImgUrl) {
                await deleteFromS3(product[0].productImgUrl);
            }
            newProductImgUrl = await uploadToS3(productImg, 'products');
        } catch (error) {
            return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
        }
    }

    const getString = (val: FormDataEntryValue | null) =>
      typeof val === "string" ? val : null;

    try {
        const updatedProduct = await db.update(products).set({
            name: getString(name),
            category: getString(category),
            sizes: getString(sizes),
            description: getString(description),
            price: price ? parseFloat(price as string) : null,
            ...(newProductImgUrl ? { productImgUrl: newProductImgUrl } : {}),
        }).where(eq(products.id, id)).returning();

        return NextResponse.json({ success: true, body: updatedProduct[0] }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
