import { db } from '@/lib/db';
import { users, coaches, athletes, prospects, alumni, userImages } from '@/lib/schema';
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET_NAME = process.env.AWS_BUCKET_NAME!;

async function uploadToS3(file: File, keyPrefix: string) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const key = `${keyPrefix}/${randomUUID()}-${file.name}`;

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  }));

  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

export async function GET(req: NextRequest) {
  try {
    const allUsers = await db.select().from(users)
    const allImages = await db.select().from(userImages);

    const userImagesMap = new Map(
      allImages.map(({ id, user, ...rest }) => [user, rest])
    );

    const userData = allUsers.map(user => ({
      ...user,
      images: userImagesMap.get(user.id) || null,
    }));

    return NextResponse.json({success: true, data: userData})
  } catch (error) {
    console.error("Error in GET /api/users:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const name = formData.get('name') as string;
    const isAthlete = formData.get('isAthlete') === 'true';
    const isCoach = formData.get('isCoach') === 'true';
    const isProspect = formData.get('isProspect') === 'true';
    const isAlumni = formData.get('isAlumni') === 'true';
    const isSeniorStaff = formData.get('isSeniorStaff') === 'true';

    // Handle S3 uploads for each image field with type checking
    const coachRaw = formData.get('coachImg');
    const coachImgUrl = coachRaw instanceof File ? await uploadToS3(coachRaw, 'coach') : '';

    const athleteRaw = formData.get('athleteImg');
    const athleteImgUrl = athleteRaw instanceof File ? await uploadToS3(athleteRaw, 'athlete') : '';

    const prospectRaw = formData.get('prospectImg');
    const prospectImgUrl = prospectRaw instanceof File ? await uploadToS3(prospectRaw, 'prospect') : '';

    const alumniRaw = formData.get('alumniImg');
    const alumniImgUrl = alumniRaw instanceof File ? await uploadToS3(alumniRaw, 'alumni') : '';

    // Safe parsing for prospectGPA and prospectGraduationYear
    const prospectGpaRaw = formData.get('prospectGPA') as string;
    const gpa = prospectGpaRaw ? parseFloat(prospectGpaRaw) : null;

    const prospectGradYearRaw = formData.get('prospectGraduationYear') as string;
    const graduationYear = prospectGradYearRaw ? new Date(prospectGradYearRaw) : null;

    // 1. Insert user
    const insertedUser = await db.insert(users).values({
      name,
      isActive: true,
      isAthlete,
      isCoach,
      isProspect,
      isAlumni,
      isScouted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning({ id: users.id });

    const userId = insertedUser[0].id;

    // 2. Insert coach if staff
    if (isCoach) {
      await db.insert(coaches).values({
        user: userId,
        title: formData.get('coachTitle') as string,
        description: formData.get('coachDescription') as string,
        isSeniorStaff,
      });
    }

    // 3. Insert athlete if athlete
    if (isAthlete) {
      await db.insert(athletes).values({
        user: userId,
        level: formData.get('athleteLevel') as string,
      });
    }

    // 4. Insert prospect or alumni
    if (isProspect) {
      await db.insert(prospects).values({
        user: userId,
        major: formData.get('prospectMajor') as string,
        gpa,
        institution: formData.get('prospectInstitution') as string,
        graduationYear,
        description: formData.get('prospectDescription') as string,
        youtubeLink: formData.get('prospectYoutube') as string,
        instagramLink: formData.get('prospectInstagram') as string,
      });
    }

    if (isAlumni) {
      await db.insert(alumni).values({
        user: userId,
        school: formData.get('alumniSchool') as string,
        year: new Date(formData.get('alumniGraduationYear') as string),
        description: formData.get('alumniDescription') as string,
      });
    }

    await db.insert(userImages).values({
      user: userId,
      staffUrl: coachImgUrl || null,
      athleteUrl: athleteImgUrl || null,
      prospectUrl: prospectImgUrl || null,
      alumniUrl: alumniImgUrl || null,
    });

    return NextResponse.json({ success: true, redirect: `/admin/users/${userId}` });

  } catch (error) {
    console.error("Error in POST /api/users/create:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}