import { sendEventEmail } from '@/lib/email';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    let formData;
    try {
        formData = await req.json();
    } catch (error) {
        return NextResponse.json({ error: 'Failed to parse request - ' + error }, { status: 400 });
    }

    try {
        const { eventType, childName, childAge, contactName, contactEmail, contactPhone, notes, preferredDate, numGuests, honeypot } = formData;

        if (honeypot) {
            return NextResponse.json({ error: 'Spam detected' }, { status: 400 });
        }

        await sendEventEmail({
            eventType,
            childName: childName?.trim(),
            childAge: parseInt(childAge),
            contactName: contactName?.trim(),
            contactEmail: contactEmail?.trim(),
            contactPhone: contactPhone?.trim(),
            notes: notes?.trim(),
            preferredDate: preferredDate || null,
            numGuests: numGuests ? parseInt(numGuests) : null,
        });

        return NextResponse.json({ success: 'Event registration submitted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error submitting event registration:', error);
        return NextResponse.json({ error: 'Failed to submit event registration' }, { status: 500 });
    }
}
