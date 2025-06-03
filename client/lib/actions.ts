import { db } from "@/lib/db";
import { athletes, coaches, users, userImages, achievements, programs, groups, coachGroupLines } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";

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

export const getCoaches = async () => {
    const coachesWithUsers = await db.select({
        coach: coaches,
        user: users,
        staffUrl: userImages.staffUrl
    })
    .from(coaches)
    .innerJoin(users, eq(coaches.user, users.id))
    .innerJoin(userImages, eq(users.id, userImages.user))
    .where(eq(coaches.isSeniorStaff, false));

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
    .where(eq(athletes.isActive, true));

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