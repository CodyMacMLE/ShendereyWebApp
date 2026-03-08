import { db } from '@/lib/db';
import { birthdayPackages } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ packageId: string }> }) {
    const { packageId } = await params;
    const id = parseInt(packageId);

    if (!id) {
        return NextResponse.json({ success: false, error: 'Missing package ID' }, { status: 400 });
    }

    try {
        const body = await req.json();
        const { name, price, description, features, isPopular, order } = body;

        const updated = await db.update(birthdayPackages).set({
            name: name != null ? String(name) : undefined,
            price: price != null ? Number(price) : undefined,
            description: description !== undefined ? (description ? String(description) : null) : undefined,
            features: features !== undefined ? (features ? JSON.stringify(features) : null) : undefined,
            isPopular: isPopular != null ? Boolean(isPopular) : undefined,
            order: order != null ? Number(order) : undefined,
            updatedAt: new Date(),
        }).where(eq(birthdayPackages.id, id)).returning();

        return NextResponse.json({ success: true, body: updated[0] }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ packageId: string }> }) {
    const { packageId } = await params;
    const id = parseInt(packageId);

    if (!id) {
        return NextResponse.json({ success: false, error: 'Missing package ID' }, { status: 400 });
    }

    try {
        await db.delete(birthdayPackages).where(eq(birthdayPackages.id, id));
        return NextResponse.json({ success: true, body: id }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
