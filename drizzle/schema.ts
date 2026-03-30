import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
  longtext,
  datetime,
  index,
  unique,
  foreignKey,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow with role-based access control.
 */
export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    email: varchar("email", { length: 320 }).notNull().unique(),
    name: text("name"),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
    userType: mysqlEnum("userType", ["job_seeker", "recruiter"]).notNull(),
    profileCompleted: boolean("profileCompleted").default(false),
    profilePictureUrl: text("profilePictureUrl"),
    bio: text("bio"),
    location: varchar("location", { length: 255 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
    passwordHash: varchar("passwordHash", { length: 255 }),
  },
  (table) => ({
    emailIdx: index("email_idx").on(table.email),
    userTypeIdx: index("userType_idx").on(table.userType),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Job Seeker Profile - Extended profile for job seekers
 */
export const jobSeekerProfiles = mysqlTable(
  "jobSeekerProfiles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    headline: varchar("headline", { length: 255 }),
    currentRole: varchar("currentRole", { length: 255 }),
    yearsExperience: int("yearsExperience"),
    desiredRoles: json("desiredRoles"), // Array of role titles
    desiredLocations: json("desiredLocations"), // Array of locations
    salaryExpectation: decimal("salaryExpectation", { precision: 10, scale: 2 }),
    workPreference: mysqlEnum("workPreference", ["remote", "hybrid", "onsite"]),
    availability: varchar("availability", { length: 50 }), // e.g., "2 weeks notice"
    openToOpportunities: boolean("openToOpportunities").default(true),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("jobSeeker_userId_idx").on(table.userId),
    userIdUnique: unique("jobSeeker_userId_unique").on(table.userId),
  })
);

export type JobSeekerProfile = typeof jobSeekerProfiles.$inferSelect;
export type InsertJobSeekerProfile = typeof jobSeekerProfiles.$inferInsert;

/**
 * Recruiter Profile - Extended profile for recruiters
 */
export const recruiterProfiles = mysqlTable(
  "recruiterProfiles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    companyName: varchar("companyName", { length: 255 }).notNull(),
    companyWebsite: varchar("companyWebsite", { length: 255 }),
    industry: varchar("industry", { length: 255 }),
    companySize: varchar("companySize", { length: 50 }),
    jobTitle: varchar("jobTitle", { length: 255 }),
    department: varchar("department", { length: 255 }),
    companyLogoUrl: text("companyLogoUrl"),
    verificationStatus: mysqlEnum("verificationStatus", ["pending", "verified", "rejected"]).default(
      "pending"
    ),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("recruiter_userId_idx").on(table.userId),
    userIdUnique: unique("recruiter_userId_unique").on(table.userId),
  })
);

export type RecruiterProfile = typeof recruiterProfiles.$inferSelect;
export type InsertRecruiterProfile = typeof recruiterProfiles.$inferInsert;

/**
 * Resumes/CVs - Multiple resumes per user with versions
 */
export const resumes = mysqlTable(
  "resumes",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    content: longtext("content").notNull(), // JSON structure of resume
    isDefault: boolean("isDefault").default(false),
    version: int("version").default(1),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("resume_userId_idx").on(table.userId),
  })
);

export type Resume = typeof resumes.$inferSelect;
export type InsertResume = typeof resumes.$inferInsert;

/**
 * Tailored Resumes - Auto-generated resumes tailored to specific jobs
 */
export const tailoredResumes = mysqlTable(
  "tailoredResumes",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    baseResumeId: int("baseResumeId").notNull(),
    jobId: int("jobId").notNull(),
    tailoredContent: longtext("tailoredContent").notNull(),
    matchScore: decimal("matchScore", { precision: 5, scale: 2 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("tailoredResume_userId_idx").on(table.userId),
    jobIdIdx: index("tailoredResume_jobId_idx").on(table.jobId),
  })
);

export type TailoredResume = typeof tailoredResumes.$inferSelect;
export type InsertTailoredResume = typeof tailoredResumes.$inferInsert;

/**
 * Skills - User skills with proficiency levels
 */
export const skills = mysqlTable(
  "skills",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    skillName: varchar("skillName", { length: 255 }).notNull(),
    proficiencyLevel: mysqlEnum("proficiencyLevel", ["beginner", "intermediate", "advanced", "expert"]),
    yearsOfExperience: int("yearsOfExperience"),
    endorsements: int("endorsements").default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("skill_userId_idx").on(table.userId),
  })
);

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = typeof skills.$inferInsert;

/**
 * External Profiles - GitHub, LinkedIn, portfolio integrations
 */
export const externalProfiles = mysqlTable(
  "externalProfiles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    platform: mysqlEnum("platform", ["github", "linkedin", "portfolio", "personal_website"]).notNull(),
    profileUrl: varchar("profileUrl", { length: 500 }).notNull(),
    username: varchar("username", { length: 255 }),
    verified: boolean("verified").default(false),
    lastSyncedAt: timestamp("lastSyncedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("externalProfile_userId_idx").on(table.userId),
    platformIdx: index("externalProfile_platform_idx").on(table.platform),
  })
);

export type ExternalProfile = typeof externalProfiles.$inferSelect;
export type InsertExternalProfile = typeof externalProfiles.$inferInsert;

/**
 * Jobs - Aggregated job listings from web scraping
 */
export const jobs = mysqlTable(
  "jobs",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    company: varchar("company", { length: 255 }).notNull(),
    location: varchar("location", { length: 255 }),
    description: longtext("description").notNull(),
    requirements: longtext("requirements"),
    salary: varchar("salary", { length: 100 }),
    jobType: mysqlEnum("jobType", ["full_time", "part_time", "contract", "freelance"]),
    source: mysqlEnum("source", ["linkedin", "indeed", "upwork", "other"]).notNull(),
    sourceJobId: varchar("sourceJobId", { length: 255 }).notNull(),
    sourceUrl: varchar("sourceUrl", { length: 500 }),
    postedDate: datetime("postedDate"),
    expiryDate: datetime("expiryDate"),
    companyLogoUrl: text("companyLogoUrl"),
    isActive: boolean("isActive").default(true),
    scrapedAt: timestamp("scrapedAt").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    sourceJobIdIdx: unique("job_sourceJobId_idx").on(table.sourceJobId, table.source),
    companyIdx: index("job_company_idx").on(table.company),
    isActiveIdx: index("job_isActive_idx").on(table.isActive),
  })
);

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;

/**
 * Applications - Job application tracking
 */
export const applications = mysqlTable(
  "applications",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    jobId: int("jobId").notNull(),
    resumeId: int("resumeId"),
    tailoredResumeId: int("tailoredResumeId"),
    status: mysqlEnum("status", [
      "draft",
      "submitted",
      "viewed",
      "shortlisted",
      "interview_scheduled",
      "rejected",
      "offer_received",
      "accepted",
      "withdrawn",
    ]).default("submitted"),
    appliedDate: timestamp("appliedDate").defaultNow().notNull(),
    lastStatusUpdate: timestamp("lastStatusUpdate").defaultNow().onUpdateNow().notNull(),
    notes: text("notes"),
    interviewDate: datetime("interviewDate"),
    interviewType: varchar("interviewType", { length: 100 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("application_userId_idx").on(table.userId),
    jobIdIdx: index("application_jobId_idx").on(table.jobId),
    statusIdx: index("application_status_idx").on(table.status),
  })
);

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

/**
 * Saved Searches - User's saved job search filters
 */
export const savedSearches = mysqlTable(
  "savedSearches",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    filters: json("filters").notNull(), // Search criteria as JSON
    alertEnabled: boolean("alertEnabled").default(true),
    alertFrequency: mysqlEnum("alertFrequency", ["daily", "weekly", "immediate"]).default("daily"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("savedSearch_userId_idx").on(table.userId),
  })
);

export type SavedSearch = typeof savedSearches.$inferSelect;
export type InsertSavedSearch = typeof savedSearches.$inferInsert;

/**
 * Job Matches - ML-generated job recommendations
 */
export const jobMatches = mysqlTable(
  "jobMatches",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    jobId: int("jobId").notNull(),
    matchScore: decimal("matchScore", { precision: 5, scale: 2 }).notNull(),
    matchReason: text("matchReason"),
    skillsMatched: json("skillsMatched"),
    skillsGap: json("skillsGap"),
    recommendedAt: timestamp("recommendedAt").defaultNow().notNull(),
    dismissed: boolean("dismissed").default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("jobMatch_userId_idx").on(table.userId),
    jobIdIdx: index("jobMatch_jobId_idx").on(table.jobId),
    matchScoreIdx: index("jobMatch_matchScore_idx").on(table.matchScore),
  })
);

export type JobMatch = typeof jobMatches.$inferSelect;
export type InsertJobMatch = typeof jobMatches.$inferInsert;

/**
 * Mock Interviews - AI-powered interview sessions
 */
export const mockInterviews = mysqlTable(
  "mockInterviews",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    jobId: int("jobId"),
    interviewType: mysqlEnum("interviewType", ["behavioral", "technical", "case_study", "general"]).notNull(),
    difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("medium"),
    status: mysqlEnum("status", ["scheduled", "in_progress", "completed", "cancelled"]).default("scheduled"),
    startedAt: datetime("startedAt"),
    completedAt: datetime("completedAt"),
    duration: int("duration"), // in seconds
    score: decimal("score", { precision: 5, scale: 2 }),
    feedback: longtext("feedback"),
    transcript: longtext("transcript"), // JSON of Q&A exchanges
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("mockInterview_userId_idx").on(table.userId),
    statusIdx: index("mockInterview_status_idx").on(table.status),
  })
);

export type MockInterview = typeof mockInterviews.$inferSelect;
export type InsertMockInterview = typeof mockInterviews.$inferInsert;

/**
 * Connections - Networking between job seekers and recruiters
 */
export const connections = mysqlTable(
  "connections",
  {
    id: int("id").autoincrement().primaryKey(),
    userId1: int("userId1").notNull(),
    userId2: int("userId2").notNull(),
    status: mysqlEnum("status", ["pending", "accepted", "blocked"]).default("pending"),
    initiatedBy: int("initiatedBy").notNull(),
    message: text("message"),
    connectedAt: datetime("connectedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    user1Idx: index("connection_userId1_idx").on(table.userId1),
    user2Idx: index("connection_userId2_idx").on(table.userId2),
  })
);

export type Connection = typeof connections.$inferSelect;
export type InsertConnection = typeof connections.$inferInsert;

/**
 * Messages - Direct messaging between users
 */
export const messages = mysqlTable(
  "messages",
  {
    id: int("id").autoincrement().primaryKey(),
    senderId: int("senderId").notNull(),
    recipientId: int("recipientId").notNull(),
    content: text("content").notNull(),
    isRead: boolean("isRead").default(false),
    readAt: datetime("readAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    senderIdx: index("message_senderId_idx").on(table.senderId),
    recipientIdx: index("message_recipientId_idx").on(table.recipientId),
  })
);

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Courses - Career development and skill training programs
 */
export const courses = mysqlTable(
  "courses",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: longtext("description"),
    category: varchar("category", { length: 100 }),
    level: mysqlEnum("level", ["beginner", "intermediate", "advanced"]).default("beginner"),
    duration: int("duration"), // in hours
    instructor: varchar("instructor", { length: 255 }),
    imageUrl: text("imageUrl"),
    isActive: boolean("isActive").default(true),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  }
);

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

/**
 * User Course Progress - Track user progress in courses
 */
export const userCourseProgress = mysqlTable(
  "userCourseProgress",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    courseId: int("courseId").notNull(),
    status: mysqlEnum("status", ["enrolled", "in_progress", "completed"]).default("enrolled"),
    progress: int("progress").default(0), // percentage 0-100
    completedAt: datetime("completedAt"),
    certificateUrl: text("certificateUrl"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("userCourseProgress_userId_idx").on(table.userId),
    courseIdIdx: index("userCourseProgress_courseId_idx").on(table.courseId),
  })
);

export type UserCourseProgress = typeof userCourseProgress.$inferSelect;
export type InsertUserCourseProgress = typeof userCourseProgress.$inferInsert;

/**
 * Posted Jobs - Jobs posted by recruiters
 */
export const postedJobs = mysqlTable(
  "postedJobs",
  {
    id: int("id").autoincrement().primaryKey(),
    recruiterId: int("recruiterId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: longtext("description").notNull(),
    requirements: longtext("requirements"),
    salary: varchar("salary", { length: 100 }),
    jobType: mysqlEnum("jobType", ["full_time", "part_time", "contract"]),
    location: varchar("location", { length: 255 }),
    status: mysqlEnum("status", ["draft", "published", "closed", "filled"]).default("draft"),
    applicantCount: int("applicantCount").default(0),
    publishedAt: datetime("publishedAt"),
    closedAt: datetime("closedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    recruiterIdIdx: index("postedJob_recruiterId_idx").on(table.recruiterId),
    statusIdx: index("postedJob_status_idx").on(table.status),
  })
);

export type PostedJob = typeof postedJobs.$inferSelect;
export type InsertPostedJob = typeof postedJobs.$inferInsert;
