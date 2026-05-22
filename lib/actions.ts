import { db } from "@/lib/db";
import { achievements, alumni, athletes, coaches, coachGroupLines, employment, gallery, groups, media, programs, prospects, resources, scores, sponsors, userImages, users, registrationPolicies, registrationImage, products, announcement, birthdayPackages } from "@/lib/schema";
import { unstable_cache } from "next/cache";
import { asc, desc, eq, count, and } from "drizzle-orm";

export const getSeniorStaff = unstable_cache(
    async () => {
        const seniorStaffWithUsers = await db.select({
            coach: coaches,
            user: users,
            staffUrl: userImages.staffUrl
        })
        .from(coaches)
        .innerJoin(users, eq(coaches.user, users.id))
        .innerJoin(userImages, eq(users.id, userImages.user))
        .where(and(eq(coaches.isSeniorStaff, true), eq(users.isActive, true)));

        seniorStaffWithUsers.sort((a, b) => {
            const dateA = a.coach.createdAt?.getTime();
            const dateB = b.coach.createdAt?.getTime();
            if (dateA && dateB) {
                return dateA - dateB;
            }
            return 0;
        });
        return seniorStaffWithUsers;
    },
    ['senior-staff'],
    { revalidate: 86400, tags: ['coaches'] }
)

export const getJuniorStaff = unstable_cache(
    async () => {
        const juniorStaffWithUsers = await db.select({
            coach: coaches,
            user: users,
            staffUrl: userImages.staffUrl
        })
        .from(coaches)
        .innerJoin(users, eq(coaches.user, users.id))
        .innerJoin(userImages, eq(users.id, userImages.user))
        .where(and(eq(coaches.isSeniorStaff, false), eq(users.isActive, true)));

        juniorStaffWithUsers.sort((a, b) => {
            const dateA = a.coach.createdAt?.getTime();
            const dateB = b.coach.createdAt?.getTime();
            if (dateA && dateB) {
                return dateA - dateB;
            }
            return 0;
        });
        return juniorStaffWithUsers;
    },
    ['junior-staff'],
    { revalidate: 86400, tags: ['coaches'] }
)

export const getCoaches = unstable_cache(
    async () => {
        const coachesWithUsers = await db.select({
            coach: coaches,
            user: users,
            staffUrl: userImages.staffUrl
        })
        .from(coaches)
        .innerJoin(users, eq(coaches.user, users.id))
        .innerJoin(userImages, eq(users.id, userImages.user))
        .where(eq(users.isActive, true))

        coachesWithUsers.sort((a, b) => {
            const dateA = a.coach.createdAt?.getTime();
            const dateB = b.coach.createdAt?.getTime();
            if (dateA && dateB) {
                return dateA - dateB;
            }
            return 0;
        });
        return coachesWithUsers;
    },
    ['coaches'],
    { revalidate: 86400, tags: ['coaches'] }
)

export const getCoach = unstable_cache(
    async (coachName: string) => {
        const coachesWithUsers = await db.select({
            coach: coaches,
            user: users,
            staffUrl: userImages.staffUrl
        })
        .from(coaches)
        .innerJoin(users, eq(coaches.user, users.id))
        .innerJoin(userImages, eq(users.id, userImages.user))
        .where(and(eq(users.name, coachName), eq(users.isActive, true)));
        return coachesWithUsers;
    },
    ['coach'],
    { revalidate: 86400, tags: ['coaches'] }
)

export const getCurrentAthletes = unstable_cache(
    async () => {
        const sortOrder = [
          "Senior", "Junior", "Novice", "10", "9", "8", "7",
          "Xcel Platinum", "6", "Xcel Gold", "5", "4", "3",
          "Xcel Silver", "2", "1", "Xcel Bronze", ""
        ];
        const athletesWithUsers = await db.select({
            athlete: athletes,
            user: users,
            athleteUrl: userImages.athleteUrl
        })
        .from(athletes)
        .innerJoin(users, eq(athletes.user, users.id))
        .innerJoin(userImages, eq(users.id, userImages.user))
        .where(and(eq(users.isAlumni, false), eq(users.isActive, true)));

        athletesWithUsers.sort((a, b) => {
          const aIndex = sortOrder.indexOf(a.athlete.level || '');
          const bIndex = sortOrder.indexOf(b.athlete.level || '');
          return aIndex - bIndex;
        });
        return athletesWithUsers;
    },
    ['current-athletes'],
    { revalidate: 86400, tags: ['athletes'] }
)

export const getAchievementsByYear = unstable_cache(
    async () => {
        const achievementsWithUsers = await db.select({
            achievement: achievements,
            user: users,
            imageUrl: userImages.athleteUrl
        })
        .from(achievements)
        .innerJoin(athletes, eq(achievements.athlete, athletes.id))
        .innerJoin(users, eq(athletes.user, users.id))
        .innerJoin(userImages, eq(users.id, userImages.user))
        .where(eq(users.isActive, true));

        const sortedAchievements = achievementsWithUsers.sort((a, b) => {
          const dateA = a.achievement.date?.getTime();
          const dateB = b.achievement.date?.getTime();
          return (dateA ?? 0) - (dateB ?? 0);
        });

        const groupedByYear = new Map<number, typeof achievementsWithUsers>();

        for (const achievement of sortedAchievements) {
          const year = achievement.achievement.date?.getFullYear();
          if (year !== undefined) {
            if (!groupedByYear.has(year)) {
              groupedByYear.set(year, []);
            }
            groupedByYear.get(year)!.push(achievement);
          }
        }

        const groupedAchievements = Array.from(groupedByYear.values()).reverse();

        return groupedAchievements;
    },
    ['achievements-by-year'],
    { revalidate: 86400, tags: ['achievements'] }
)

export const getRecreationalPrograms = unstable_cache(
    async () => {
        const recreationalPrograms = await db.select().from(programs).where(eq(programs.category, "recreational"));

        recreationalPrograms.sort((a, b) => {
            const getStartAge = (ages: string | null): number => {
                if (!ages) return Infinity;
                if (ages.toLowerCase().trim().startsWith('walking')) return -1;
                const match = ages.match(/^(\d+)/);
                return match ? parseInt(match[1], 10) : Infinity;
            };
            return getStartAge(a.ages) - getStartAge(b.ages);
        });

        return recreationalPrograms;
    },
    ['recreational-programs'],
    { revalidate: 86400, tags: ['programs'] }
)

export const getCompetitivePrograms = unstable_cache(
    async () => {
        const competitivePrograms = await db.select().from(programs).where(eq(programs.category, "competitive"));

        competitivePrograms.sort((a, b) => {
            const getStartAge = (ages: string | null): number => {
                if (!ages) return Infinity;
                const match = ages.match(/^(\d+)/);
                return match ? parseInt(match[1], 10) : Infinity;
            };
            const ageDiff = getStartAge(a.ages) - getStartAge(b.ages);
            if (ageDiff !== 0) return ageDiff;
            return (a.name || '').localeCompare(b.name || '');
        });

        return competitivePrograms;
    },
    ['competitive-programs'],
    { revalidate: 86400, tags: ['programs'] }
)

export const getProgram = unstable_cache(
    async (programId: number) => {
        const program = await db.select().from(programs).where(eq(programs.id, programId));
        return program;
    },
    ['program'],
    { revalidate: 86400, tags: ['programs'] }
)

export const getGroups = unstable_cache(
    async (programId: number) => {
        const groupsWithCoaches = await db.select().from(groups)
            .innerJoin(coachGroupLines, eq(groups.id, coachGroupLines.groupId))
            .innerJoin(coaches, eq(coachGroupLines.coachId, coaches.id))
            .innerJoin(users, eq(coaches.user, users.id))
            .where(and(eq(groups.program, programId), eq(users.isActive, true)))
            .orderBy(asc(groups.startDate));
        return groupsWithCoaches;
    },
    ['groups'],
    { revalidate: 86400, tags: ['groups'] }
)

export const getSponsors = unstable_cache(
    async () => {
        const diamondSponsors = await db.select().from(sponsors).where(eq(sponsors.sponsorLevel, "Diamond"));
        const platinumSponsors = await db.select().from(sponsors).where(eq(sponsors.sponsorLevel, "Platinum"));
        const goldSponsors = await db.select().from(sponsors).where(eq(sponsors.sponsorLevel, "Gold"));
        const silverSponsors = await db.select().from(sponsors).where(eq(sponsors.sponsorLevel, "Silver"));
        const affiliates = await db.select().from(sponsors).where(eq(sponsors.sponsorLevel, "Affiliate"));

        const allSponsors = {diamondSponsors, platinumSponsors, goldSponsors, silverSponsors, affiliates};
        return allSponsors;
    },
    ['sponsors'],
    { revalidate: 86400, tags: ['sponsors'] }
)

export const getJobs = unstable_cache(
    async () => {
        const jobs = await db.select().from(employment).orderBy(desc(employment.dateCreated));
        return jobs;
    },
    ['jobs'],
    { revalidate: 86400, tags: ['jobs'] }
)

export const getGallery = unstable_cache(
    async () => {
        const galleryItems = await db.select().from(gallery).orderBy(desc(gallery.date));
        return galleryItems;
    },
    ['gallery'],
    { revalidate: 86400, tags: ['gallery'] }
)

export const getAlumni = unstable_cache(
    async () => {
        const alumniData = await db.select()
        .from(alumni)
        .innerJoin(users, eq(alumni.user, users.id))
        .innerJoin(userImages, eq(users.id, userImages.user))
        .where(eq(users.isActive, true));
        return alumniData;
    },
    ['alumni'],
    { revalidate: 86400, tags: ['alumni'] }
)

export const getProspects = unstable_cache(
    async () => {
        const prospectsData = await db.select()
        .from(prospects)
        .innerJoin(users, eq(prospects.user, users.id))
        .innerJoin(userImages, eq(users.id, userImages.user))
        .innerJoin(athletes, eq(prospects.user, athletes.user))
        .where(eq(users.isActive, true));
        return prospectsData;
    },
    ['prospects'],
    { revalidate: 86400, tags: ['prospects'] }
)

export const getProspect = unstable_cache(
    async (prospectId: number) => {
        const prospect = await db.select()
        .from(prospects)
        .innerJoin(users, eq(prospects.user, users.id))
        .innerJoin(userImages, eq(users.id, userImages.user))
        .innerJoin(athletes, eq(prospects.user, athletes.user))
        .where(and(eq(prospects.id, prospectId), eq(users.isActive, true)));
        return prospect[0];
    },
    ['prospect'],
    { revalidate: 86400, tags: ['prospects'] }
)

export const getAthleteScores = async (athleteId: number) => {
    const athleteScores = await db.select().from(scores).where(eq(scores.athlete, athleteId)).orderBy(desc(scores.date));
    return athleteScores;
}

export const getAthleteMedia = async (athleteId: number) => {
    const athleteMedia = await db.select().from(media).where(eq(media.athlete, athleteId)).orderBy(desc(media.date));
    return athleteMedia;
}

export const getAthleteAchievements = async (athleteId: number) => {
    const athleteAchievements = await db.select().from(achievements).where(eq(achievements.athlete, athleteId)).orderBy(desc(achievements.date));
    return athleteAchievements;
}

export const getGalleryMedia = unstable_cache(
    async (page: number = 1, limit: number = 20) => {
        const offset = (page - 1) * limit;

        const [galleryMedia, totalCountResult] = await Promise.all([
            db.select()
                .from(gallery)
                .orderBy(desc(gallery.date))
                .limit(limit)
                .offset(offset),
            db.select({ count: count() }).from(gallery)
        ]);

        const totalCount = totalCountResult[0]?.count || 0;
        const totalPages = Math.ceil(totalCount / limit);

        return {
            data: galleryMedia.map(item => ({
                ...item,
                id: item.id.toString()
            })),
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        };
    },
    ['gallery-media'],
    { revalidate: 86400, tags: ['gallery'] }
)

export const getAllGalleryMedia = unstable_cache(
    async () => {
        const items = await db.select().from(gallery).orderBy(desc(gallery.date)).limit(500);
        return items.map(item => ({ ...item, id: item.id.toString() }));
    },
    ['all-gallery-media'],
    { revalidate: 86400, tags: ['gallery'] }
)

export const getResources = unstable_cache(
    async () => {
        const resourcesData = await db.select({
            id: resources.id,
            name: resources.name,
            size: resources.size,
            views: resources.views,
            createdAt: resources.createdAt,
        }).from(resources).orderBy(desc(resources.createdAt));
        return resourcesData.map(item => ({
            ...item,
            id: item.id.toString()
        }));
    },
    ['resources'],
    { revalidate: 3600, tags: ['resources'] }
)

export const incrementResourceView = async (resourceId: number) => {
    try {
        const currentResource = await db.select().from(resources).where(eq(resources.id, resourceId));

        if (!currentResource.length) {
            throw new Error('Resource not found');
        }

        const [updatedResource] = await db
            .update(resources)
            .set({
                views: (currentResource[0].views || 0) + 1
            })
            .where(eq(resources.id, resourceId))
            .returning();

        return updatedResource;
    } catch (error) {
        console.error("Error incrementing resource view:", error);
        throw error;
    }
}

export const getRegistrationPolicies = unstable_cache(
    async () => {
        const policies = await db.select().from(registrationPolicies).orderBy(asc(registrationPolicies.order));
        return policies;
    },
    ['registration-policies'],
    { revalidate: 86400, tags: ['registration'] }
)

export const getRegistrationImages = unstable_cache(
    async () => {
        const images = await db.select().from(registrationImage);
        return images;
    },
    ['registration-images'],
    { revalidate: 3600, tags: ['registration'] }
)

export const getProducts = unstable_cache(
    async () => {
        const allProducts = await db.select().from(products);
        return allProducts;
    },
    ['products'],
    { revalidate: 86400, tags: ['products'] }
)

export const getActiveAnnouncement = unstable_cache(
    async () => {
        const result = await db.select().from(announcement).where(eq(announcement.isActive, true)).limit(1);
        return result[0] || null;
    },
    ['active-announcement'],
    { revalidate: 300, tags: ['announcement'] }
)

export const getBirthdayPackages = unstable_cache(
    async () => {
        const packages = await db.select().from(birthdayPackages).orderBy(asc(birthdayPackages.order));
        return packages;
    },
    ['birthday-packages'],
    { revalidate: 86400, tags: ['birthday-packages'] }
)
