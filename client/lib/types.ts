// USERS
export type User = {
    id: string,
    name: string,
    isActive: boolean,
    isAthlete: boolean,
    isAlumni: boolean,
    isProspect: boolean,
    isCoach: boolean,
    isScouted: boolean,
    createdAt: Date,
    updatedAt: Date,
};

// USER IMAGES
export type UserImages = {
    id: string,
    user: string,
    staffUrl: string,
    athleteUrl: string,
    prospectUrl: string,
    alumniUrl: string,
  };

// ATHLETE
export type Athlete = {
    id: string,
    user: string,
    level: string,
};

// ALUMNI
export type Alumni = {
    id: string,
    user: string,
    school: string,
    year: Date,
    description: string,
};

// PROSPECT
export type Prospect = {
    id: string,
    user: string,
    graduationYear: Date,
    description: string,
    gpa: number,
    major: string,
    institution: string,
    instagramLink: string,
    youtubeLink: string,
};

// COACH
export type Coach = {
    id: string,
    user: string,
    title: string,
    description: string,
    isSeniorStaff: boolean,
};

// SCORES
export type Score = {
    id: string,
    athlete: string,
    competition: string,
    date: Date,
    category: string,
    bars: number,
    beam: number,
    floor: number,
    vault: number,
    overall: number,
};

// MEDIA
export type Media = {
    id: string,
    athlete: string,
    name: string,
    description: string,
    category: string,
    date: Date,
    mediaType: string,
    mediaUrl: string,
    videoThumbnail: string,
};

// ACHIEVEMENT
export type Achievement = {
    id: string,
    athlete: string,
    title: string,
    description: string,
    date: Date,
};

// TESTIMONIAL
export type Testimonial = {
    id: string,
    author: string,
    authorImgUrl: string,
    testimonial: string,
    isFeatured: boolean,
};

// SPONSOR
export type Sponsor = {
    id: string,
    organization: string,
    description: string,
    website: string,
    sponsorLevel: string,
    sponsorImgUrl: string,
};

// EMPLOYMENT
export type Employment = {
    id: string,
    position: string,
    description: string,
    requirements: string,
    contract: string,
    isFeatured: boolean,
    dateCreated: Date,
};

// PROGRAM
export type Program = {
    id: string,
    name: string,
    category: string,
    description: string,
    length: number,
    ages: string,
    programImgUrl: string,
};

// GROUP
export type Group = {
    id: string,
    program: string,
    day: string,
    startTime: string,
    endTime: string,
    startDate: Date,
    endDate: Date,
    active: boolean,
};

// COACHGROUPLINE
export type CoachGroupLine = {
    id: string,
    coachId: string,
    groupId: string,
};

// GALLERY
export type Gallery = {
    id: string,
    name: string,
    description: string,
    date: Date,
    mediaType: string,
    mediaUrl: string,
    videoThumbnail: string,
};

// RESOURCES
export type Resource = {
    id: string,
    name: string,
    date: Date,
    resourceUrl: string,
};

// TRYOUTS
export type Tryout = {
    id: string,
    athleteName: string,
    athleteDOB: Date,
    athleteAbout: string,
    experienceProgram: string,
    experienceLevel: string,
    experienceYears: number,
    currentClub: string,
    currentCoach: string,
    currentHours: number,
    tryoutPreferences: string,
    tryoutLevel: string,
    contactName: string,
    contactEmail: string,
    contactPhone: string,
    contactRelationship: string,
    readStatus: boolean,
    createdAt: Date,
    updatedAt: Date,
};