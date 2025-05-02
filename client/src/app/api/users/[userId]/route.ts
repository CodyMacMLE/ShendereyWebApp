import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'
import { users, userImages, coaches, athletes, prospects, alumni, scores, videos, achievements } from '@/lib/schema'
import { eq } from 'drizzle-orm/sql'


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

  try {
    const formData = await req.formData();

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

    await db.update(users)
      .set({
        name,
        isCoach,
        isAthlete,
        isProspect,
        isAlumni,
      })
      .where(eq(users.id, id));

    if (isCoach) {
      await db.update(coaches)
        .set({
          title: coachTitle,
          description: coachDescription,
          isSeniorStaff
        })
        .where(eq(coaches.user, id));
    }

    if (isAthlete) {
      await db.update(athletes)
        .set({
          level: athleteLevel
        })
        .where(eq(athletes.user, id));
    }

    if (isProspect) {
      await db.update(prospects)
        .set({
          gpa: parseFloat(prospectGPA),
          major: prospectMajor,
          institution: prospectInstitution,
          description: prospectDescription,
          graduationYear: new Date(`${prospectGraduationYear}-01-01`),
          instagramLink: prospectInstagram,
          youtubeLink: prospectYoutube,
        })
        .where(eq(prospects.user, id));
    }

    if (isAlumni) {
      await db.update(alumni)
        .set({
          school: alumniSchool,
          year: new Date(`${alumniGraduationYear}-01-01`),
          description: alumniDescription,
        })
        .where(eq(alumni.user, id));
    }

    return NextResponse.json({ success: true, redirect: `/admin/users/${userId}` });

  } catch (error) {
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

try {
  const deletePromises = [];

  if (athleteId) {
    deletePromises.push(
      db.delete(achievements).where(eq(achievements.athlete, athleteId)),
      db.delete(videos).where(eq(videos.athlete, athleteId)),
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