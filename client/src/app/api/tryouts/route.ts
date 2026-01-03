import { db } from '@/lib/db';
import { sendTryoutEmail } from '@/lib/email';
import { tryouts } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
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

export async function POST(req: NextRequest) {
    let formData;
    try {
        formData = await req.json();
    } catch (error) {
        return NextResponse.json({ error: 'Failed to submit tryout form - ' + error }, { status: 500 });
    }
    
    try {
        const { athleteName, DoB, about, experienceProgram, experienceLevel, experienceYears, hoursPerWeek, currentClub, currentCoach, tryoutPreference, tryoutLevel, contactName, contactRelationship, contactEmail, contactPhone, honeypot } = formData;
        if (honeypot) {
            return NextResponse.json({ error: 'Spam detected' }, { status: 400 });
        }

        // Check if email already exists
        const existingEmail = await db.select().from(tryouts).where(eq(tryouts.contactEmail, contactEmail.trim()));
        if (existingEmail.length > 0) {
            return NextResponse.json({ message: 'Email already exists' }, { status: 200 });
        }

        await db.insert(tryouts).values({ 
            athleteName: athleteName.trim(), 
            athleteDOB: new Date(DoB), 
            athleteAbout: about, 
            experienceProgram: experienceProgram.trim(), 
            experienceLevel: experienceLevel.trim(), 
            experienceYears: parseInt(experienceYears), 
            currentHours: parseInt(hoursPerWeek), 
            currentClub: currentClub.trim(), 
            currentCoach: currentCoach.trim(), 
            tryoutPreferences: tryoutPreference.trim(), 
            tryoutLevel: tryoutLevel.trim(), 
            contactName: contactName.trim(), 
            contactRelationship: contactRelationship.trim(),
            contactEmail: contactEmail.trim(), 
            contactPhone: contactPhone.trim(), 
        });

        // Send email notification
        try {
            await sendTryoutEmail({
                athleteName: athleteName.trim(),
                DoB,
                about,
                experienceProgram: experienceProgram.trim(),
                experienceLevel: experienceLevel.trim(),
                experienceYears: parseInt(experienceYears),
                hoursPerWeek: parseInt(hoursPerWeek),
                currentClub: currentClub.trim(),
                currentCoach: currentCoach.trim(),
                tryoutPreference: tryoutPreference.trim(),
                tryoutLevel: tryoutLevel.trim(),
                contactName: contactName.trim(),
                contactRelationship: contactRelationship.trim(),
                contactEmail: contactEmail.trim(),
                contactPhone: contactPhone.trim(),
            });
        } catch (emailError) {
            console.error('Error sending email notification:', emailError);
            // Don't fail the request if email fails, just log it
        }
        
        return NextResponse.json({ success: 'Tryout form submitted successfully' }, { status: 200 });

    } catch (error) {
        console.error('Error submitting tryout form:', error);
        return NextResponse.json({ error: 'Failed to submit tryout form' }, { status: 500 });
    }
}