import { db } from "@/lib/db";
import { achievements, alumni, athletes, coaches, coachGroupLines, employment, gallery, groups, media, programs, prospects, resources, scores, sponsors, userImages, users } from "@/lib/schema";
import { asc, desc, eq } from "drizzle-orm";

export const getSeniorStaff = async () => {
    const seniorStaffWithUsers = await db.select({
        coach: coaches,
        user: users,
        staffUrl: userImages.staffUrl
    })
    .from(coaches)
    .innerJoin(users, eq(coaches.user, users.id))
    .innerJoin(userImages, eq(users.id, userImages.user))
    .where(eq(coaches.isSeniorStaff, true));

    seniorStaffWithUsers.sort((a, b) => {
        const dateA = a.coach.createdAt?.getTime();
        const dateB = b.coach.createdAt?.getTime();
        if (dateA && dateB) {
            return dateA - dateB;
        }
        return 0;
    });
    return seniorStaffWithUsers;
}

export const getJuniorStaff = async () => {
    const juniorStaffWithUsers = await db.select({
        coach: coaches,
        user: users,
        staffUrl: userImages.staffUrl
    })
    .from(coaches)
    .innerJoin(users, eq(coaches.user, users.id))
    .innerJoin(userImages, eq(users.id, userImages.user))
    .where(eq(coaches.isSeniorStaff, false));

    juniorStaffWithUsers.sort((a, b) => {
        const dateA = a.coach.createdAt?.getTime();
        const dateB = b.coach.createdAt?.getTime();
        if (dateA && dateB) {
            return dateA - dateB;
        }
        return 0;
    });
    return juniorStaffWithUsers;
}

export const getCoaches = async () => {
    const coachesWithUsers = await db.select({
        coach: coaches,
        user: users,
        staffUrl: userImages.staffUrl
    })
    .from(coaches)
    .innerJoin(users, eq(coaches.user, users.id))
    .innerJoin(userImages, eq(users.id, userImages.user))

    coachesWithUsers.sort((a, b) => {
        const dateA = a.coach.createdAt?.getTime();
        const dateB = b.coach.createdAt?.getTime();
        if (dateA && dateB) {
            return dateA - dateB;
        }
        return 0;
    });
    return coachesWithUsers;
}

export const getCoach = async (coachName: string) => {
    const coachesWithUsers = await db.select({
        coach: coaches,
        user: users,
        staffUrl: userImages.staffUrl
    })
    .from(coaches)
    .innerJoin(users, eq(coaches.user, users.id))
    .innerJoin(userImages, eq(users.id, userImages.user))
    .where(eq(users.name, coachName));
    return coachesWithUsers;
}

export const getCurrentAthletes = async () => {
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
    .where(eq(users.isAlumni, false));

    athletesWithUsers.sort((a, b) => {
      const aIndex = sortOrder.indexOf(a.athlete.level || '');
      const bIndex = sortOrder.indexOf(b.athlete.level || '');
      return aIndex - bIndex;
    });
    return athletesWithUsers;
}

export const getAchievementsByYear = async () => {
    const achievementsWithUsers = await db.select({
        achievement: achievements,
        user: users,
        imageUrl: userImages.athleteUrl
    })
    .from(achievements)
    .innerJoin(athletes, eq(achievements.athlete, athletes.id))
    .innerJoin(users, eq(athletes.user, users.id))
    .innerJoin(userImages, eq(users.id, userImages.user));

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
}

export const getRecreationalPrograms = async () => {
    const recreationalPrograms = await db.select().from(programs).where(eq(programs.category, "recreational"));
    return recreationalPrograms;
}

export const getCompetitivePrograms = async () => {
    const competitivePrograms = await db.select().from(programs).where(eq(programs.category, "competitive"));
    return competitivePrograms;
}

export const getProgram = async (programId: number) => {
    const program = await db.select().from(programs).where(eq(programs.id, programId));
    return program;
}

export const getGroups = async (programId: number) => {
    const groupsWithCoaches = await db.select().from(groups)
        .innerJoin(coachGroupLines, eq(groups.id, coachGroupLines.groupId))
        .innerJoin(coaches, eq(coachGroupLines.coachId, coaches.id))
        .innerJoin(users, eq(coaches.user, users.id))
        .where(eq(groups.program, programId))
        .orderBy(asc(groups.startDate));
    return groupsWithCoaches;
}

export const getSponsors = async () => {
    const diamondSponsors = await db.select().from(sponsors).where(eq(sponsors.sponsorLevel, "Diamond"));
    const goldSponsors = await db.select().from(sponsors).where(eq(sponsors.sponsorLevel, "Gold"));
    const silverSponsors = await db.select().from(sponsors).where(eq(sponsors.sponsorLevel, "Silver"));
    const affiliates = await db.select().from(sponsors).where(eq(sponsors.sponsorLevel, "Affiliate"));

    const allSponsors = {diamondSponsors, goldSponsors, silverSponsors, affiliates};
    return allSponsors;
}

export const getJobs = async () => {
    const jobs = await db.select().from(employment).orderBy(desc(employment.dateCreated));
    return jobs;
}

export const getGallery = async () => {
    const galleryItems = await db.select().from(gallery).orderBy(desc(gallery.date));
    return galleryItems;
}

export const getAlumni = async () => {
    const alumniData = await db.select()
    .from(alumni)
    .innerJoin(users, eq(alumni.user, users.id))
    .innerJoin(userImages, eq(users.id, userImages.user));
    return alumniData;
}

export const getProspects = async () => {
    const prospectsData = await db.select()
    .from(prospects)
    .innerJoin(users, eq(prospects.user, users.id))
    .innerJoin(userImages, eq(users.id, userImages.user))
    .innerJoin(athletes, eq(prospects.user, athletes.user));
    return prospectsData;
}

export const getProspect = async (prospectId: number) => {
    const prospect = await db.select()
    .from(prospects)
    .innerJoin(users, eq(prospects.user, users.id))
    .innerJoin(userImages, eq(users.id, userImages.user))
    .innerJoin(athletes, eq(prospects.user, athletes.user))
    .where(eq(prospects.id, prospectId));
    return prospect[0];
}

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

export const getGalleryMedia = async () => {
    const galleryMedia = await db.select().from(gallery).orderBy(desc(gallery.date));
    return galleryMedia.map(item => ({
        ...item,
        id: item.id.toString()
    }));
}

export const getResources = async () => {
    const resourcesData = await db.select().from(resources).orderBy(desc(resources.createdAt));
    return resourcesData.map(item => ({
        ...item,
        id: item.id.toString()
    }));
}   