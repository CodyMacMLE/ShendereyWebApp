import { db } from "@/lib/db";
import { resources } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ resourceId: string }> }
) {
    try {
        const { resourceId } = await params;
        const id = parseInt(resourceId);

        if (isNaN(id)) {
            return NextResponse.json(
                { success: false, error: 'Invalid resource ID' },
                { status: 400 }
            );
        }

        // Get current resource to check if it exists
        const currentResource = await db.select().from(resources).where(eq(resources.id, id));
        
        if (!currentResource.length) {
            return NextResponse.json(
                { success: false, error: 'Resource not found' },
                { status: 404 }
            );
        }

        // Increment the views count
        const [updatedResource] = await db
            .update(resources)
            .set({
                views: (currentResource[0].views || 0) + 1
            })
            .where(eq(resources.id, id))
            .returning();

        return NextResponse.json(
            { success: true, body: updatedResource },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error in POST /api/resources/[resourceId]/increment-view:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
} 