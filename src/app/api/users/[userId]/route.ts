import { db } from '@/lib/db';
import { achievements, alumni, athletes, coachGroupLines, coaches, media, prospects, scores, userImages, users } from '@/lib/schema';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm/sql';
import { NextRequest, NextResponse } from 'next/server';

// Validate required environment variables
if (!process.env.AWS_REGION) {
  throw new Error('AWS_REGION environment variable is required');
}
if (!process.env.AWS_BUCKET_NAME) {
  throw new Error('AWS_BUCKET_NAME environment variable is required');
}

// S3 Client configuration
const s3Config: { region: string; credentials?: { accessKeyId: string; secretAccessKey: string } } = {
  region: process.env.AWS_REGION,
};

// Only add explicit credentials if both are provided
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3Config.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}

const s3 = new S3Client(s3Config);
const BUCKET_NAME = process.env.AWS_BUCKET_NAME!;

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

    const coachData = coachArray?.[0];
    const athleteData = athleteArray?.[0];
    const prospectData = prospectArray?.[0];
    const alumniData = alumniArray?.[0];

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
    const user = await db.select().from(users).where(eq(users.id, id));
    console.log(user);

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

    const oldUser = user[0];

    // ====== ROLE REMOVAL CLEANUP ======

    // Coach removed
    if (oldUser.isCoach && !isCoach) {
      try {
        const coachRecords = await db.select({ id: coaches.id }).from(coaches).where(eq(coaches.user, id));
        if (coachRecords.length > 0) {
          await db.delete(coachGroupLines).where(eq(coachGroupLines.coachId, coachRecords[0].id));
        }
        const images = await db.select({ staffUrl: userImages.staffUrl }).from(userImages).where(eq(userImages.user, id));
        if (images[0]?.staffUrl) {
          try {
            await s3.send(new DeleteObjectCommand({
              Bucket: BUCKET_NAME,
              Key: images[0].staffUrl.split('/').slice(3).join('/'),
            }));
          } catch (err) {
            console.error('Error deleting staff image from S3:', err);
          }
        }
        await db.update(userImages).set({ staffUrl: null }).where(eq(userImages.user, id));
        await db.delete(coaches).where(eq(coaches.user, id));
      } catch (err) {
        console.error('Error removing coach role:', err);
      }
    }

    // Athlete removed (also removes prospect, alumni, scores, media, achievements)
    if (oldUser.isAthlete && !isAthlete) {
      try {
        const athleteRecords = await db.select({ id: athletes.id }).from(athletes).where(eq(athletes.user, id));
        if (athleteRecords.length > 0) {
          const athleteId = athleteRecords[0].id;

          // Delete media files from S3
          const mediaRecords = await db.select({ mediaUrl: media.mediaUrl }).from(media).where(eq(media.athlete, athleteId));
          for (const m of mediaRecords) {
            if (m.mediaUrl) {
              try {
                await s3.send(new DeleteObjectCommand({
                  Bucket: BUCKET_NAME,
                  Key: m.mediaUrl.split('/').slice(3).join('/'),
                }));
              } catch (err) {
                console.error('Error deleting media from S3:', err);
              }
            }
          }

          await db.delete(scores).where(eq(scores.athlete, athleteId));
          await db.delete(media).where(eq(media.athlete, athleteId));
          await db.delete(achievements).where(eq(achievements.athlete, athleteId));
        }

        await db.delete(prospects).where(eq(prospects.user, id));
        await db.delete(alumni).where(eq(alumni.user, id));

        // Delete athlete/prospect/alumni images from S3
        const images = await db.select({
          athleteUrl: userImages.athleteUrl,
          prospectUrl: userImages.prospectUrl,
          alumniUrl: userImages.alumniUrl,
        }).from(userImages).where(eq(userImages.user, id));

        if (images[0]) {
          for (const url of [images[0].athleteUrl, images[0].prospectUrl, images[0].alumniUrl]) {
            if (url) {
              try {
                await s3.send(new DeleteObjectCommand({
                  Bucket: BUCKET_NAME,
                  Key: url.split('/').slice(3).join('/'),
                }));
              } catch (err) {
                console.error('Error deleting image from S3:', err);
              }
            }
          }
        }

        await db.update(userImages).set({ athleteUrl: null, prospectUrl: null, alumniUrl: null }).where(eq(userImages.user, id));
        await db.delete(athletes).where(eq(athletes.user, id));
      } catch (err) {
        console.error('Error removing athlete role:', err);
      }
    }

    // Prospect removed (athlete still kept, not transitioning to alumni)
    if (oldUser.isProspect && !isProspect && isAthlete && !isAlumni) {
      try {
        const images = await db.select({ prospectUrl: userImages.prospectUrl }).from(userImages).where(eq(userImages.user, id));
        if (images[0]?.prospectUrl) {
          try {
            await s3.send(new DeleteObjectCommand({
              Bucket: BUCKET_NAME,
              Key: images[0].prospectUrl.split('/').slice(3).join('/'),
            }));
          } catch (err) {
            console.error('Error deleting prospect image from S3:', err);
          }
        }
        await db.update(userImages).set({ prospectUrl: null }).where(eq(userImages.user, id));
        await db.delete(prospects).where(eq(prospects.user, id));
      } catch (err) {
        console.error('Error removing prospect role:', err);
      }
    }

    // Alumni removed (athlete still kept, not transitioning to prospect)
    if (oldUser.isAlumni && !isAlumni && isAthlete && !isProspect) {
      try {
        const images = await db.select({ alumniUrl: userImages.alumniUrl }).from(userImages).where(eq(userImages.user, id));
        if (images[0]?.alumniUrl) {
          try {
            await s3.send(new DeleteObjectCommand({
              Bucket: BUCKET_NAME,
              Key: images[0].alumniUrl.split('/').slice(3).join('/'),
            }));
          } catch (err) {
            console.error('Error deleting alumni image from S3:', err);
          }
        }
        await db.update(userImages).set({ alumniUrl: null }).where(eq(userImages.user, id));
        await db.delete(alumni).where(eq(alumni.user, id));
      } catch (err) {
        console.error('Error removing alumni role:', err);
      }
    }

    // ====== ROLE UPSERTS ======

    if (isCoach) {
      try {
        const existingCoach = await db.select().from(coaches).where(eq(coaches.user, id));
        if (existingCoach.length > 0) {
          await db.update(coaches)
            .set({
              title: coachTitle,
              description: coachDescription,
              isSeniorStaff
            })
            .where(eq(coaches.user, id));
        } else {
          await db.insert(coaches).values({
            user: id,
            title: coachTitle,
            description: coachDescription,
            isSeniorStaff,
          });
        }
      } catch (err) {
        console.error('Error updating coach:', err);
      }
    }

    if (isAthlete) {
      try {
        const existingAthlete = await db.select().from(athletes).where(eq(athletes.user, id));
        if (existingAthlete.length > 0) {
          await db.update(athletes)
            .set({
              level: athleteLevel
            })
            .where(eq(athletes.user, id));
        } else {
          await db.insert(athletes).values({
            user: id,
            level: athleteLevel,
          });
        }
      } catch (err) {
        console.error('Error updating athlete:', err);
      }
    }

    if (isProspect) {
      try {
        // Transition from alumni to prospect
        if (oldUser.isAlumni) {
          const images = await db.select().from(userImages).where(eq(userImages.user, id));
          if (images[0].alumniUrl) {
            await s3.send(new DeleteObjectCommand({
              Bucket: BUCKET_NAME,
              Key: images[0].alumniUrl.split('/').slice(3).join('/'),
            }));
          }
          await db.update(userImages).set({ alumniUrl: null }).where(eq(userImages.user, id));
          await db.delete(alumni).where(eq(alumni.user, id));

          await db.insert(prospects).values({
            user: id,
            gpa: prospectGPA ? parseFloat(prospectGPA) : null,
            major: prospectMajor,
            institution: prospectInstitution,
            description: prospectDescription,
            graduationYear: prospectGraduationYear ? new Date(`${prospectGraduationYear}-01-01`) : null,
            instagramLink: prospectInstagram,
            youtubeLink: prospectYoutube,
          });
        }

        if (oldUser.isProspect) {
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
        }
      } catch (err) {
        console.error('Error updating prospect:', err);
      }
    }

    if (isAlumni) {
      try {
        // Transition from prospect to alumni
        if (oldUser.isProspect) {
          const images = await db.select().from(userImages).where(eq(userImages.user, id));
          if (images[0].prospectUrl) {
            await s3.send(new DeleteObjectCommand({
              Bucket: BUCKET_NAME,
              Key: images[0].prospectUrl.split('/').slice(3).join('/'),
            }));
          }
          await db.update(userImages).set({ prospectUrl: null }).where(eq(userImages.user, id));
          await db.delete(prospects).where(eq(prospects.user, id));
          await db.insert(alumni).values({
            user: id,
            school: alumniSchool,
            year: alumniGraduationYear ? new Date(`${alumniGraduationYear}-01-01`) : null,
            description: alumniDescription,
          });
        }

        if (oldUser.isAlumni) {
          await db.update(alumni).set({
            school: alumniSchool,
            year: alumniGraduationYear ? new Date(`${alumniGraduationYear}-01-01`) : null,
            description: alumniDescription,
          }).where(eq(alumni.user, id));
        }
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const id = parseInt(userId);

  try {
    const { isActive } = await req.json();

    await db.update(users)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    return NextResponse.json({ success: true, isActive });
  } catch (error) {
    console.error('PATCH error:', error);
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

  // Helper function to extract S3 key from URL
  function extractS3Key(url: string): string {
    try {
      // Remove the S3 URL prefix to get the key
      const prefix = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
      if (url.startsWith(prefix)) {
        return url.replace(prefix, '');
      }
      // Fallback: split by '/' and take everything after index 3
      const parts = url.split('/');
      return parts.slice(3).join('/');
    } catch (error) {
      console.error('Error extracting S3 key from URL:', url, error);
      // Fallback: split by '/' and take everything after index 3
      const parts = url.split('/');
      return parts.slice(3).join('/');
    }
  }

  try {
    // Delete user images from S3 (should happen for ALL users, not just athletes)
    const userImageUrls = await db.select({
      staffUrl: userImages.staffUrl,
      athleteUrl: userImages.athleteUrl,
      prospectUrl: userImages.prospectUrl,
      alumniUrl: userImages.alumniUrl,
    }).from(userImages).where(eq(userImages.user, parseInt(userId)));
    
    const imageUrls = userImageUrls[0];
    const s3DeletePromises: Promise<void>[] = [];
    
    if (imageUrls) {
      const keys = ['staffUrl', 'athleteUrl', 'prospectUrl', 'alumniUrl'] as const;
      keys.forEach((key) => {
        const url = imageUrls[key];
        if (url) {
          const s3Key = extractS3Key(url);
          s3DeletePromises.push(
            s3.send(new DeleteObjectCommand({
              Bucket: BUCKET_NAME,
              Key: s3Key,
            })).then(() => {
              console.log(`Successfully deleted user image from S3: ${s3Key}`);
            }).catch((error) => {
              console.error(`Failed to delete user image from S3 (${s3Key}):`, error);
              // Continue with other deletions even if one fails
            })
          );
        }
      });
    }

    // Delete athlete media from S3 (only if user is an athlete)
    if (athleteId) {
      const mediaUrls = await db.select({ url: media.mediaUrl }).from(media).where(eq(media.athlete, athleteId));

      const mediaKeys = mediaUrls
        .filter((obj): obj is { url: string } => obj.url !== null)
        .map(obj => extractS3Key(obj.url));

      const s3MediaDeletePromises = mediaKeys.map(key =>
        s3.send(new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
        })).then(() => {
          console.log(`Successfully deleted media from S3: ${key}`);
        }).catch((error) => {
          console.error(`Failed to delete media from S3 (${key}):`, error);
          // Continue with other deletions even if one fails
        })
      );
      
      await Promise.all(s3MediaDeletePromises);
    }
    
    // Delete all user images from S3
    await Promise.all(s3DeletePromises);
  } catch (error) {
    console.error('Error deleting files from S3:', error);
    // Continue with database deletion even if S3 deletion fails
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