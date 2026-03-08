import { db } from '@/lib/db';
import { birthdayPackages } from '@/lib/schema';
import { asc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    try {
        const packages = await db.select().from(birthdayPackages).orderBy(asc(birthdayPackages.order));
        return NextResponse.json({ success: true, body: packages }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, price, description, features, isPopular, order } = body;

        if (!name || price == null) {
            return NextResponse.json({ success: false, error: 'Name and price are required' }, { status: 400 });
        }

        const inserted = await db.insert(birthdayPackages).values({
            name: String(name),
            price: Number(price),
            description: description ? String(description) : null,
            features: features ? JSON.stringify(features) : null,
            isPopular: Boolean(isPopular),
            order: order != null ? Number(order) : 0,
        }).returning();

        return NextResponse.json({ success: true, body: inserted[0] }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
