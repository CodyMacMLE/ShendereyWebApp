import { db } from '@/lib/db';
import { birthdayPackages } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const items: { id: number; order: number }[] = body.items;

        if (!Array.isArray(items)) {
            return NextResponse.json({ success: false, error: 'items array required' }, { status: 400 });
        }

        await Promise.all(
            items.map(item =>
                db.update(birthdayPackages)
                    .set({ order: item.order, updatedAt: new Date() })
                    .where(eq(birthdayPackages.id, item.id))
            )
        );

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
