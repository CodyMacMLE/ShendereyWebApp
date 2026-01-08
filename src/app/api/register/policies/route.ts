import { db } from "@/lib/db";
import { registrationPolicies } from "@/lib/schema";
import { asc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const allPolicies = await db.select().from(registrationPolicies).orderBy(asc(registrationPolicies.order));
    
        return NextResponse.json({success: true, body: allPolicies}, {status: 200})
    } catch (error) {
        console.error("Error in GET /api/register/policies:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const policies = body.policies as Array<{ id?: number; policy: string; order: number }>;

        if (!Array.isArray(policies)) {
            return NextResponse.json(
                { success: false, error: "Policies must be an array" },
                { status: 400 }
            );
        }

        // Get existing policies
        const existingPolicies = await db.select().from(registrationPolicies);

        // Delete policies that are no longer in the list
        const existingIds = existingPolicies.map(p => p.id);
        const newIds = policies.filter(p => p.id).map(p => p.id!);
        const idsToDelete = existingIds.filter(id => !newIds.includes(id));

        for (const id of idsToDelete) {
            await db.delete(registrationPolicies).where(eq(registrationPolicies.id, id));
        }

        // Update or insert policies
        for (const policy of policies) {
            if (policy.id) {
                // Update existing policy
                await db.update(registrationPolicies)
                    .set({
                        policy: policy.policy,
                        order: policy.order,
                        updatedAt: new Date(),
                    })
                    .where(eq(registrationPolicies.id, policy.id));
            } else {
                // Insert new policy
                await db.insert(registrationPolicies).values({
                    policy: policy.policy,
                    order: policy.order,
                });
            }
        }

        // Fetch updated policies
        const updatedPolicies = await db.select().from(registrationPolicies).orderBy(asc(registrationPolicies.order));

        return NextResponse.json({success: true, body: updatedPolicies}, {status: 200})
    } catch (error) {
        console.error("Error in PUT /api/register/policies:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

