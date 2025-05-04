import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'
import { users, userImages, coaches, athletes, prospects, alumni, scores, media, achievements } from '@/lib/schema'
import { eq } from 'drizzle-orm/sql'
import { S3Client, DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET_NAME = process.env.AWS_BUCKET_NAME

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const id = parseInt(userId);

  try {
    const [userArray, imagesArray] = await Promise.all([
      db.select().from(users).where(eq(users.id, id)),
      db.select({
        staffUrl: userImages.staffUrl,
        athleteUrl: userImages.athleteUrl,
        prospectUrl: userImages.prospectUrl,
        alumniUrl: userImages.alumniUrl,
      }).from(userImages).where(eq(userImages.user, id))
    ]);

    const userData = userArray[0];
    const imagesData = imagesArray[0];

    let coachData, athleteData, prospectData, alumniData;

    const subqueries = [];

    if (userData.isCoach) {
      subqueries.push(
        db.select({
          id: coaches.id,
          title: coaches.title,
          description: coaches.description,
          isSeniorStaff: coaches.isSeniorStaff
        }).from(coaches).where(eq(coaches.user, userData.id))
      );
    } else {
      subqueries.push(Promise.resolve(undefined));
    }

    if (userData.isAthlete) {
      subqueries.push(
        db.select({
          id: athletes.id,
          level: athletes.level
        }).from(athletes).where(eq(athletes.user, userData.id))
      );

      if (userData.isProspect) {
        subqueries.push(
          db.select({
            graduationYear: prospects.graduationYear,
            description: prospects.description,
            gpa: prospects.gpa,
            major: prospects.major,
            institution: prospects.institution,
            instagramLink: prospects.instagramLink,
            youtubeLink: prospects.youtubeLink
          }).from(prospects).where(eq(prospects.user, userData.id))
        );
      } else {
        subqueries.push(Promise.resolve(undefined));
      }

      if (userData.isAlumni) {
        subqueries.push(
          db.select({
            school: alumni.school,
            year: alumni.year,
            description: alumni.description
          }).from(alumni).where(eq(alumni.user, userData.id))
        );
      } else {
        subqueries.push(Promise.resolve(undefined));
      }
    } else {
      subqueries.push(Promise.resolve(undefined), Promise.resolve(undefined));
    }

    const [coachArray, athleteArray, prospectArray, alumniArray] = await Promise.all(subqueries);

    coachData = coachArray?.[0];
    athleteData = athleteArray?.[0];
    prospectData = prospectArray?.[0];
    alumniData = alumniArray?.[0];

    let scoresData, videosData, achievementsData;

    const data = {
      ...userData,
      images : imagesData,
      coach : coachData,
      athlete : {
        ...athleteData,
        alumni: alumniData,
        prospect: prospectData,
        scores: scoresData,
        videos: videosData,
        achievements: achievementsData
      },
    }

    return NextResponse.json({success: true, body: data})
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const id = parseInt(userId);
  const formData = await req.formData();

  try {
    const name = formData.get('name') as string;
    const isCoach = formData.get('isCoach') === 'true';
    const isAthlete = formData.get('isAthlete') === 'true';
    const isProspect = formData.get('isProspect') === 'true';
    const isAlumni = formData.get('isAlumni') === 'true';
    const isSeniorStaff = formData.get('isSeniorStaff') === 'true';

    const coachTitle = formData.get('coachTitle') as string;
    const coachDescription = formData.get('coachDescription') as string;

    const athleteLevel = formData.get('athleteLevel') as string;

    const prospectGPA = formData.get('prospectGPA') as string;
    const prospectMajor = formData.get('prospectMajor') as string;
    const prospectInstitution = formData.get('prospectInstitution') as string;
    const prospectGraduationYear = formData.get('prospectGraduationYear') as string;
    const prospectDescription = formData.get('prospectDescription') as string;
    const prospectInstagram = formData.get('prospectInstagram') as string;
    const prospectYoutube = formData.get('prospectYoutube') as string;

    const alumniSchool = formData.get('alumniSchool') as string;
    const alumniGraduationYear = formData.get('alumniGraduationYear') as string;
    const alumniDescription = formData.get('alumniDescription') as string;

    const updatedImageFields: Partial<typeof userImages.$inferSelect> = {};

    const imageFields = [
      { field: 'staffImg', dbKey: 'staffUrl' },
      { field: 'athleteImg', dbKey: 'athleteUrl' },
      { field: 'prospectImg', dbKey: 'prospectUrl' },
      { field: 'alumniImg', dbKey: 'alumniUrl' }
    ];

    for (const { field, dbKey } of imageFields) {
      const file = formData.get(field) as File | null;
      if (file && typeof file === 'object') {
        // Get current URL from DB
        let selectedColumn;
        switch (dbKey) {
          case 'staffUrl':
            selectedColumn = userImages.staffUrl;
            break;
          case 'athleteUrl':
            selectedColumn = userImages.athleteUrl;
            break;
          case 'prospectUrl':
            selectedColumn = userImages.prospectUrl;
            break;
          case 'alumniUrl':
            selectedColumn = userImages.alumniUrl;
            break;
          default:
            continue; // skip to next iteration if key is invalid
        }

        const currentImage = await db
          .select({ url: selectedColumn })
          .from(userImages)
          .where(eq(userImages.user, id));
        const currentUrl = currentImage?.[0]?.url;

        // Delete existing image if present
        if (currentUrl) {
          const existingKey = currentUrl.split('/').slice(3).join('/');
          await s3.send(new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: existingKey,
          }));
        }

        // Upload new image
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const folderMap = {
          staffImg: 'coach',
          athleteImg: 'athlete',
          prospectImg: 'prospect',
          alumniImg: 'alumni',
        };
        const folder = folderMap[field as keyof typeof folderMap] || 'user';
        const key = `${folder}/${randomUUID()}-${file.name}`;

        try {
          await s3.send(new PutObjectCommand({ 
            Bucket: BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: file.type,
           }));
          updatedImageFields[dbKey] = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
        } catch (err) {
          console.error(`Failed to upload ${dbKey}`, err);
        }
      }
    }

    if (Object.keys(updatedImageFields).length > 0) {
      await db.update(userImages)
        .set(updatedImageFields)
        .where(eq(userImages.user, id));
    }

    try {
      console.log('Starting user update...');
      await db.update(users)
        .set({
          name,
          isCoach,
          isAthlete,
          isProspect,
          isAlumni,
        })
        .where(eq(users.id, id));
    } catch (err) {
      console.error('Error updating user:', err);
    }

    if (isCoach) {
      try {
        await db.update(coaches)
          .set({
            title: coachTitle,
            description: coachDescription,
            isSeniorStaff
          })
          .where(eq(coaches.user, id));
      } catch (err) {
        console.error('Error updating coach:', err);
      }
    }

    if (isAthlete) {
      try {
        await db.update(athletes)
          .set({
            level: athleteLevel
          })
          .where(eq(athletes.user, id));
      } catch (err) {
        console.error('Error updating athlete:', err);
      }
    }

    if (isProspect) {
      try {
        await db.update(prospects)
          .set({
            gpa: prospectGPA ? parseFloat(prospectGPA) : null,
            major: prospectMajor,
            institution: prospectInstitution,
            description: prospectDescription,
            graduationYear: prospectGraduationYear ? new Date(`${prospectGraduationYear}-01-01`) : null,
            instagramLink: prospectInstagram,
            youtubeLink: prospectYoutube,
          })
          .where(eq(prospects.user, id));
      } catch (err) {
        console.error('Error updating prospect:', err);
      }
    }

    if (isAlumni) {
      try {
        await db.update(alumni)
          .set({
            school: alumniSchool,
            year: alumniGraduationYear ? new Date(`${alumniGraduationYear}-01-01`) : null,
            description: alumniDescription,
          })
          .where(eq(alumni.user, id));
      } catch (err) {
        console.error('Error updating alumni:', err);
      }
    }

    return NextResponse.json({ success: true, redirect: `/admin/users/${userId}` });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const athleteIdResult = await db.select({ athleteId: athletes.id })
  .from(athletes)
  .where(eq(athletes.user, parseInt(userId)));

  const athleteId = athleteIdResult.length > 0 ? athleteIdResult[0].athleteId : null;

  if (athleteId) {
    const mediaUrls = await db.select({ url: media.mediaUrl }).from(media).where(eq(media.athlete, athleteId));

    const mediaKeys = mediaUrls
      .filter((obj): obj is { url: string } => obj.url !== null)
      .map(obj => {
        const parts = obj.url.split('/');
        return parts.slice(3).join('/');
      });

    const s3MediaDeletePromises = mediaKeys.map(key =>
      s3.send(new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      }))
    );

    const userImageUrls = await db.select({
      staffUrl: userImages.staffUrl,
      athleteUrl: userImages.athleteUrl,
      prospectUrl: userImages.prospectUrl,
      alumniUrl: userImages.alumniUrl,
    }).from(userImages).where(eq(userImages.user, parseInt(userId)));
    
    const imageUrls = userImageUrls[0];
    const keys = ['staffUrl', 'athleteUrl', 'prospectUrl', 'alumniUrl'] as const;
    const s3Keys = keys
      .map((key) => {
        switch (key) {
          case 'staffUrl': return imageUrls?.staffUrl;
          case 'athleteUrl': return imageUrls?.athleteUrl;
          case 'prospectUrl': return imageUrls?.prospectUrl;
          case 'alumniUrl': return imageUrls?.alumniUrl;
        }
      })
      .filter((url): url is string => Boolean(url))
      .map((url) => {
        const parts = url.split('/');
        return parts.slice(3).join('/');
      });
    
    const s3DeletePromises = s3Keys.map(key =>
      s3.send(new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      }))
    );
    
    await Promise.all(s3DeletePromises);
    await Promise.all(s3MediaDeletePromises);
  }

  try {
    const deletePromises = [];

    if (athleteId) {
      deletePromises.push(
        db.delete(achievements).where(eq(achievements.athlete, athleteId)),
        db.delete(media).where(eq(media.athlete, athleteId)),
        db.delete(scores).where(eq(scores.athlete, athleteId))
      );
    }

    deletePromises.push(
      db.delete(alumni).where(eq(alumni.user, parseInt(userId))),
      db.delete(prospects).where(eq(prospects.user, parseInt(userId))),
      db.delete(athletes).where(eq(athletes.user, parseInt(userId))),
      db.delete(coaches).where(eq(coaches.user, parseInt(userId))),
      db.delete(userImages).where(eq(userImages.user, parseInt(userId)))
    );

    await Promise.all(deletePromises);

    await db.delete(users)
      .where(eq(users.id, parseInt(userId)))
      .returning();

    return NextResponse.json({ success: true, redirect: '/admin/users' });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}