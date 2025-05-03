import {
    pgTable,
    serial,
    text,
    integer,
    boolean,
    timestamp,
    time,
    doublePrecision,
    pgEnum,
  } from 'drizzle-orm/pg-core'
  
// ENUMS
export const categoryEnum = pgEnum('category', ['competitive', 'recreational'])

// USER
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    isActive: boolean('isActive').default(false),
    isAthlete: boolean('isAthlete').default(false),
    isAlumni: boolean('isAlumni').default(false),
    isProspect: boolean('isProspect').default(false),
    isCoach: boolean('isCoach').default(false),
    isScouted: boolean('isScouted').default(false),
    createdAt: timestamp('createdAt'),
    updatedAt: timestamp('updatedAt'),
})

// USER IMAGES
export const userImages = pgTable('user_images', {
    id: serial('id').primaryKey(),
    user: integer('user').references(() => users.id).notNull(),
    staffUrl: text('staffUrl'),
    athleteUrl: text('athleteUrl'),
    prospectUrl: text('prospectUrl'),
    alumniUrl: text('alumniUrl'),
  });

// ATHLETE
export const athletes = pgTable('athletes', {
    id: serial('id').primaryKey(),
    user: integer('user').references(() => users.id),
    level: text('level'),
})

// ALUMNI
export const alumni = pgTable('alumni', {
    id: serial('id').primaryKey(),
    user: integer('user').references(() => users.id),
    school: text('school'),
    year: timestamp('year'),
    description: text('description'),
})

// PROSPECT
export const prospects = pgTable('prospects', {
    id: serial('id').primaryKey(),
    user: integer('user').references(() => users.id),
    graduationYear: timestamp('graduationYear'),
    description: text('description'),
    gpa: doublePrecision('gpa'),
    major: text('major'),
    institution: text('institution'),
    instagramLink: text('instagramLink'),
    youtubeLink: text('youtubeLink'),
})

// COACH
export const coaches = pgTable('coaches', {
    id: serial('id').primaryKey(),
    user: integer('user').references(() => users.id),
    title: text('title'),
    description: text('description'),
    isSeniorStaff: boolean('isSeniorStaff').default(false),
})

// SCORES
export const scores = pgTable('scores', {
    id: serial('id').primaryKey(),
    athlete: integer('athlete').references(() => athletes.id),
    competition: text('competition'),
    date: timestamp('date'),
    category: text('category'),
    bars: doublePrecision('bars'),
    beam: doublePrecision('beam'),
    floor: doublePrecision('floor'),
    vault: doublePrecision('vault'),
    overall: doublePrecision('overall'),
})

// VIDEOS
export const media = pgTable('media', {
    id: serial('id').primaryKey(),
    athlete: integer('athlete').references(() => athletes.id),
    name: text('name'),
    description: text('description'),
    date: timestamp('date'),
    mediaType: text('mediaType'),
    mediaUrl: text('videoUrl'),
})

// ACHIEVEMENT
export const achievements = pgTable('achievements', {
    id: serial('id').primaryKey(),
    athlete: integer('athlete').references(() => athletes.id),
    title: text('title'),
    description: text('description'),
    date: timestamp('date'),
})

// TESTIMONIAL
export const testimonials = pgTable('testimonials', {
    id: serial('id').primaryKey(),
    author: text('author'),
    authorImgUrl: text('authorImgUrl'),
    testimonial: text('testimonial'),
    isFeatured: boolean('isFeatured'),
})

// SPONSOR
export const sponsors = pgTable('sponsors', {
    id: serial('id').primaryKey(),
    organization: text('organization'),
    description: text('description'),
    requirements: text('requirements'),
    sponsorLevel: text('sponsorLevel'),
    sponsorImgUrl: text('sponsorImgUrl'),
})

// EMPLOYMENT
export const employment = pgTable('employment', {
    id: serial('id').primaryKey(),
    position: text('position'),
    description: text('description'),
    requirements: text('requirements'),
    contract: text('contract'),
    isFeatured: boolean('isFeatured'),
    dateCreated: timestamp('dateCreated'),
})

// PROGRAM
export const programs = pgTable('programs', {
    id: serial('id').primaryKey(),
    name: text('name'),
    category: categoryEnum('category'),
    description: text('description'),
    length: integer('length'),
    ages: text('ages'),
    programImgUrl: text('programImgUrl'),
})

// GROUP
export const groups = pgTable('groups', {
    id: serial('id').primaryKey(),
    program: integer('program').references(() => programs.id),
    coach: text('coach'),
    day: text('day'),
    startTime: time('startTime'),
    endTime: time('endTime'),
    startDate: timestamp('startDate'),
    endDate: timestamp('endDate'),
})

// COACHGROUPLINE
export const coachGroupLines = pgTable('coach_group_lines', {
    id: serial('id').primaryKey(),
    coachId: integer('coachId').references(() => coaches.id),
    groupId: integer('groupId').references(() => groups.id),
})

// GALLERY
export const gallery = pgTable('gallery', {
    id: serial('id').primaryKey(),
    name: text('name'),
    description: text('description'),
    date: timestamp('date'),
    mediaType: text('mediaType'),
    mediaUrl: text('videoUrl'),
})

// RESOURCES
export const resources = pgTable('resources', {
    id: serial('id').primaryKey(),
    name: text('name'),
    date: timestamp('date'),
    resourceUrl: text('resourceUrl'),
})