import nodemailer from 'nodemailer';

// Helper function to escape HTML and prevent XSS
function escapeHtml(text: string | null | undefined): string {
    if (!text) return 'N/A';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

interface TryoutEmailData {
    athleteName: string;
    DoB: string;
    about: string;
    experienceProgram: string;
    experienceLevel: string;
    experienceYears: number;
    hoursPerWeek: number;
    currentClub: string;
    currentCoach: string;
    tryoutPreference: string;
    tryoutLevel: string;
    contactName: string;
    contactRelationship: string;
    contactEmail: string;
    contactPhone: string;
}

export async function sendTryoutEmail(data: TryoutEmailData): Promise<void> {
    // Validate required environment variables
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error('SMTP credentials are not configured. Please set SMTP_USER and SMTP_PASS environment variables.');
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    // Format the date safely
    let dateOfBirth = 'N/A';
    try {
        if (data.DoB) {
            // Parse date string as local date to avoid timezone issues
            // Format: YYYY-MM-DD
            const dateParts = data.DoB.split('-');
            if (dateParts.length === 3) {
                const year = parseInt(dateParts[0], 10);
                const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
                const day = parseInt(dateParts[2], 10);
                const dob = new Date(year, month, day);
                if (!isNaN(dob.getTime())) {
                    dateOfBirth = dob.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                }
            } else {
                // Fallback to original method if format is unexpected
                const dob = new Date(data.DoB);
                if (!isNaN(dob.getTime())) {
                    dateOfBirth = dob.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error formatting date:', error);
        dateOfBirth = data.DoB || 'N/A';
    }

    // Create HTML email content
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                h1 {
                    color: #ec4899;
                    border-bottom: 3px solid #ec4899;
                    padding-bottom: 10px;
                }
                .section {
                    margin: 20px 0;
                    padding: 15px;
                    background-color: #f9fafb;
                    border-left: 4px solid #ec4899;
                }
                .section-title {
                    font-weight: bold;
                    font-size: 18px;
                    color: #db2777;
                    margin-bottom: 10px;
                }
                .field {
                    margin: 10px 0;
                }
                .field-label {
                    font-weight: bold;
                    color: #4b5563;
                }
                .field-value {
                    color: #111827;
                    margin-left: 10px;
                }
            </style>
        </head>
        <body>
            <h1>New Tryout Registration</h1>
            
            <div class="section">
                <div class="section-title">Athlete Information</div>
                <div class="field">
                    <span class="field-label">Name:</span>
                    <span class="field-value">${escapeHtml(data.athleteName)}</span>
                </div>
                <div class="field">
                    <span class="field-label">Date of Birth:</span>
                    <span class="field-value">${escapeHtml(dateOfBirth)}</span>
                </div>
                <div class="field">
                    <span class="field-label">About:</span>
                    <span class="field-value">${escapeHtml(data.about)}</span>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Experience</div>
                <div class="field">
                    <span class="field-label">Program:</span>
                    <span class="field-value">${escapeHtml(data.experienceProgram)}</span>
                </div>
                <div class="field">
                    <span class="field-label">Level:</span>
                    <span class="field-value">${escapeHtml(data.experienceLevel)}</span>
                </div>
                <div class="field">
                    <span class="field-label">Years of Experience:</span>
                    <span class="field-value">${data.experienceYears || 0}</span>
                </div>
                <div class="field">
                    <span class="field-label">Hours per Week:</span>
                    <span class="field-value">${data.hoursPerWeek || 0}</span>
                </div>
                <div class="field">
                    <span class="field-label">Current Club:</span>
                    <span class="field-value">${escapeHtml(data.currentClub)}</span>
                </div>
                <div class="field">
                    <span class="field-label">Current Coach:</span>
                    <span class="field-value">${escapeHtml(data.currentCoach)}</span>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Tryout Preferences</div>
                <div class="field">
                    <span class="field-label">Preference:</span>
                    <span class="field-value">${escapeHtml(data.tryoutPreference)}</span>
                </div>
                <div class="field">
                    <span class="field-label">Level:</span>
                    <span class="field-value">${escapeHtml(data.tryoutLevel)}</span>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Contact Information</div>
                <div class="field">
                    <span class="field-label">Contact Name:</span>
                    <span class="field-value">${escapeHtml(data.contactName)}</span>
                </div>
                <div class="field">
                    <span class="field-label">Relationship:</span>
                    <span class="field-value">${escapeHtml(data.contactRelationship)}</span>
                </div>
                <div class="field">
                    <span class="field-label">Email:</span>
                    <span class="field-value">${escapeHtml(data.contactEmail)}</span>
                </div>
                <div class="field">
                    <span class="field-label">Phone:</span>
                    <span class="field-value">${escapeHtml(data.contactPhone)}</span>
                </div>
            </div>
        </body>
        </html>
    `;

    // Create plain text version
    const textContent = `
New Tryout Registration

Athlete Information:
- Name: ${data.athleteName || 'N/A'}
- Date of Birth: ${dateOfBirth}
- About: ${data.about || 'N/A'}

Experience:
- Program: ${data.experienceProgram || 'N/A'}
- Level: ${data.experienceLevel || 'N/A'}
- Years of Experience: ${data.experienceYears || 0}
- Hours per Week: ${data.hoursPerWeek || 0}
- Current Club: ${data.currentClub || 'N/A'}
- Current Coach: ${data.currentCoach || 'N/A'}

Tryout Preferences:
- Preference: ${data.tryoutPreference || 'N/A'}
- Level: ${data.tryoutLevel || 'N/A'}

Contact Information:
- Contact Name: ${data.contactName || 'N/A'}
- Relationship: ${data.contactRelationship || 'N/A'}
- Email: ${data.contactEmail || 'N/A'}
- Phone: ${data.contactPhone || 'N/A'}
    `;

    // Send email
    try {
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: 'shendereycomp@gmail.com',
            subject: `New Tryout Registration - ${data.athleteName || 'Unknown'}`,
            text: textContent,
            html: htmlContent,
        });
        console.log('Tryout notification email sent successfully');
    } catch (error) {
        console.error('Failed to send tryout notification email:', error);
        throw error;
    }
}

