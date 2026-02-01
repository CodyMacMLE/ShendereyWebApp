import {
    boolean,
    doublePrecision,
    integer,
    pgEnum,
    pgTable,
    serial,
    text,
    time,
    timestamp,
} from 'drizzle-orm/pg-core';
  
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
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
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
    isActive: boolean('isActive').default(true),
})

// ALUMNI
export const alumni = pgTable('alumni', {
    id: serial('id').primaryKey(),
    user: integer('user').references(() => users.id),
    school: text('school'),
    year: timestamp('year'),
    description: text('description'),
    isActive: boolean('isActive').default(true),
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
    isActive: boolean('isActive').default(true),
})

// COACH
export const coaches = pgTable('coaches', {
    id: serial('id').primaryKey(),
    user: integer('user').references(() => users.id),
    title: text('title'),
    description: text('description'),
    isSeniorStaff: boolean('isSeniorStaff').default(false),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
    isActive: boolean('isActive').default(true),
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

// MEDIA
export const media = pgTable('media', {
    id: serial('id').primaryKey(),
    athlete: integer('athlete').references(() => athletes.id),
    name: text('name'),
    description: text('description'),
    category: text('category'),
    date: timestamp('date'),
    mediaType: text('mediaType'),
    mediaUrl: text('mediaUrl'),
    videoThumbnail: text('videoThumbnail')
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
    website: text('website'),
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
    hours: integer('hours'),
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
    day: text('day'),
    startTime: time('startTime'),
    endTime: time('endTime'),
    startDate: timestamp('startDate'),
    endDate: timestamp('endDate'),
    active: boolean('active')
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
    mediaUrl: text('mediaUrl'),
    videoThumbnail: text('videoThumbnail')
})

// RESOURCES
export const resources = pgTable('resources', {
    id: serial('id').primaryKey(),
    name: text('name'),
    size: integer('size'),
    views: integer('views').default(0),
    createdAt: timestamp('createdAt').defaultNow(),
    resourceUrl: text('resourceUrl'),
})

// TRYOUTS
export const tryouts = pgTable('tryouts', {
    id: serial('id').primaryKey(),
    athleteName: text('athleteName'),
    athleteDOB: timestamp('athleteDOB'),
    athleteAbout: text('athleteAbout'),
    experienceProgram: text('experienceProgram'),
    experienceLevel: text('experienceLevel'),
    experienceYears: integer('experienceYears'),
    currentClub: text('currentClub'),
    currentCoach: text('currentCoach'),
    currentHours: integer('currentHours'),
    tryoutPreferences: text('tryoutPreferences'),
    tryoutLevel: text('tryoutLevel'),
    contactName: text('contactName'),
    contactEmail: text('contactEmail'),
    contactPhone: text('contactPhone'),
    contactRelationship: text('contactRelationship'),
    readStatus: boolean('readStatus').default(false),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
})

export const registrationImage = pgTable('registration_images', {
    id: serial('id').primaryKey(),
    imageUrl: text('imageUrl'),
    title: text('title'),
    slot: text('slot'),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
})

export const registrationPolicies = pgTable('registration_policies', {
    id: serial('id').primaryKey(),
    policy: text('policy').notNull(),
    order: integer('order').notNull(),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
})

// PRODUCTS
export const products = pgTable('products', {
    id: serial('id').primaryKey(),
    name: text('name'),
    category: text('category'),
    sizes: text('sizes'),
    description: text('description'),
    price: doublePrecision('price'),
    productImgUrl: text('productImgUrl'),
})

// ANNOUNCEMENT
export const announcement = pgTable('announcement', {
    id: serial('id').primaryKey(),
    message: text('message').notNull(),
    linkUrl: text('linkUrl'),
    isActive: boolean('isActive').default(false),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
})