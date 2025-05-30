import { db } from '@/lib/db';
import { tryouts } from '@/lib/schema';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const tryoutsData = await db.select().from(tryouts);
        if (!tryoutsData) {
            return NextResponse.json({ error: 'No tryouts found' }, { status: 404 });
        }
        return NextResponse.json({ body: tryoutsData }, { status: 200 });
    } catch (error) {
        console.error('Error fetching tryouts:', error);
        return NextResponse.json({ error: 'Failed to fetch tryouts' }, { status: 500 });
    }
}