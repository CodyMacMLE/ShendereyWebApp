import { db } from '@/lib/db';
import { tryouts } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: { tryoutId: string } }) {
    try {
        const { tryoutId } = await params;
        const { readStatus } = await req.json();

        const tryoutsData = await db.update(tryouts).set({ readStatus }).where(eq(tryouts.id, parseInt(tryoutId)));

        if (!tryoutsData) {
            return NextResponse.json({ error: 'No tryout found' }, { status: 404 });
        }

        return NextResponse.json({ body: tryoutsData }, { status: 200 });
    } catch (error) {
        console.error('Error updating tryout:', error);
        return NextResponse.json({ error: 'Failed to update tryout' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { tryoutId: string } }) {
    try {
        const { tryoutId } = await params;
        const tryoutsData = await db.delete(tryouts).where(eq(tryouts.id, parseInt(tryoutId)));

        if (!tryoutsData) {
            return NextResponse.json({ error: 'No tryout found' }, { status: 404 });
        }

        return NextResponse.json({ body: tryoutsData }, { status: 200 });
    } catch (error) {
        console.error('Error deleting tryout:', error);
        return NextResponse.json({ error: 'Failed to delete tryout' }, { status: 500 });
    }
}