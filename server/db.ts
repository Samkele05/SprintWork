import { eq, and, desc, asc, gte, lte, like, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  jobSeekerProfiles,
  recruiterProfiles,
  resumes,
  skills,
  externalProfiles,
  jobs,
  applications,
  savedSearches,
  jobMatches,
  mockInterviews,
  connections,
  messages,
  courses,
  userCourseProgress,
  postedJobs,
  tailoredResumes,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId || !user.email || !user.userType) {
    throw new Error("User openId, email, and userType are required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
      email: user.email,
      userType: user.userType,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Job Seeker Profile queries
export async function getJobSeekerProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(jobSeekerProfiles)
    .where(eq(jobSeekerProfiles.userId, userId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertJobSeekerProfile(data: any) {
  const db = await getDb();
  if (!db) return undefined;
  await db
    .insert(jobSeekerProfiles)
    .values(data)
    .onDuplicateKeyUpdate({ set: data });
  return getJobSeekerProfile(data.userId);
}

// Recruiter Profile queries
export async function getRecruiterProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(recruiterProfiles)
    .where(eq(recruiterProfiles.userId, userId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertRecruiterProfile(data: any) {
  const db = await getDb();
  if (!db) return undefined;
  await db
    .insert(recruiterProfiles)
    .values(data)
    .onDuplicateKeyUpdate({ set: data });
  return getRecruiterProfile(data.userId);
}

// Resume queries
export async function getUserResumes(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const results = await db
    .select()
    .from(resumes)
    .where(eq(resumes.userId, userId))
    .orderBy(desc(resumes.createdAt));

  return results.map(resume => ({
    ...resume,
    content:
      typeof resume.content === "string"
        ? JSON.parse(resume.content)
        : resume.content,
  }));
}

export async function createResume(data: any) {
  const db = await getDb();
  if (!db) return undefined;

  // Serialize content to JSON string if it's an object
  const serializedData = {
    ...data,
    content:
      typeof data.content === "string"
        ? data.content
        : JSON.stringify(data.content),
  };

  const result = await db.insert(resumes).values(serializedData as any);
  return result;
}

export async function getResumeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(resumes)
    .where(eq(resumes.id, id))
    .limit(1);
  if (result.length === 0) return undefined;

  const resume = result[0];
  return {
    ...resume,
    content:
      typeof resume.content === "string"
        ? JSON.parse(resume.content)
        : resume.content,
  };
}

// Skills queries
export async function getUserSkills(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(skills)
    .where(eq(skills.userId, userId))
    .orderBy(desc(skills.endorsements));
}

export async function addSkill(data: any) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(skills).values(data);
  return result;
}

// External Profiles queries
export async function getUserExternalProfiles(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(externalProfiles)
    .where(eq(externalProfiles.userId, userId));
}

export async function addExternalProfile(data: any) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(externalProfiles).values(data);
  return result;
}

// Job queries
export async function searchJobs(filters: any, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  const conditions: any[] = [eq(jobs.isActive, true)];

  if (filters.title) {
    conditions.push(like(jobs.title, `%${filters.title}%`));
  }
  if (filters.company) {
    conditions.push(like(jobs.company, `%${filters.company}%`));
  }
  if (filters.location) {
    conditions.push(like(jobs.location, `%${filters.location}%`));
  }
  if (filters.jobType) {
    conditions.push(eq(jobs.jobType, filters.jobType));
  }

  return await db
    .select()
    .from(jobs)
    .where(and(...conditions))
    .orderBy(desc(jobs.postedDate))
    .limit(limit)
    .offset(offset);
}

export async function getJobById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createJob(data: any) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(jobs).values(data);
  return result;
}

// Application queries
export async function getUserApplications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(applications)
    .where(eq(applications.userId, userId))
    .orderBy(desc(applications.appliedDate));
}

export async function getApplicationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(applications)
    .where(eq(applications.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createApplication(data: any) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(applications).values(data);
  return result;
}

export async function updateApplicationStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) return undefined;
  return await db
    .update(applications)
    .set({ status: status as any })
    .where(eq(applications.id, id));
}

// Saved Searches queries
export async function getUserSavedSearches(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(savedSearches)
    .where(eq(savedSearches.userId, userId));
}

export async function createSavedSearch(data: any) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(savedSearches).values(data);
  return result;
}

// Job Matches queries
export async function getUserJobMatches(userId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(jobMatches)
    .where(and(eq(jobMatches.userId, userId), eq(jobMatches.dismissed, false)))
    .orderBy(desc(jobMatches.matchScore))
    .limit(limit);
}

export async function createJobMatch(data: any) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(jobMatches).values(data);
  return result;
}

// Mock Interview queries
export async function getUserMockInterviews(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(mockInterviews)
    .where(eq(mockInterviews.userId, userId))
    .orderBy(desc(mockInterviews.createdAt));
}

export async function createMockInterview(data: any) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(mockInterviews).values(data);
  return result;
}

export async function getMockInterviewById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(mockInterviews)
    .where(eq(mockInterviews.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateMockInterview(id: number, data: any) {
  const db = await getDb();
  if (!db) return undefined;
  return await db
    .update(mockInterviews)
    .set(data)
    .where(eq(mockInterviews.id, id));
}

// Connections queries
export async function getUserConnections(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(connections)
    .where(
      and(
        eq(connections.status, "accepted"),
        or(eq(connections.userId1, userId), eq(connections.userId2, userId))
      )
    );
}

export async function createConnection(data: any) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(connections).values(data);
  return result;
}

// Messages queries
export async function getUserMessages(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(messages)
    .where(or(eq(messages.senderId, userId), eq(messages.recipientId, userId)))
    .orderBy(desc(messages.createdAt))
    .limit(limit);
}

export async function createMessage(data: any) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(messages).values(data);
  return result;
}

// Courses queries
export async function getAllCourses() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(courses).where(eq(courses.isActive, true));
}

export async function getUserCourseProgress(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(userCourseProgress)
    .where(eq(userCourseProgress.userId, userId));
}

export async function enrollInCourse(data: any) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(userCourseProgress).values(data);
  return result;
}

// Posted Jobs queries (Recruiter)
export async function getRecruiterPostedJobs(recruiterId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(postedJobs)
    .where(eq(postedJobs.recruiterId, recruiterId))
    .orderBy(desc(postedJobs.createdAt));
}

export async function createPostedJob(data: any) {
  const db = await getDb();
  if (!db) return undefined;

  // Create posted job record
  const postedJobResult = await db.insert(postedJobs).values({
    ...data,
    status: "published",
  });

  // Also create entry in main jobs table for search
  const jobId =
    "internal_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  await db.insert(jobs).values({
    title: data.title,
    description: data.description,
    requirements: data.requirements || "",
    company: data.company || "Unknown Company",
    location: data.location || "",
    salary: data.salary || "",
    jobType: data.jobType || "full_time",
    isActive: true,
    postedDate: new Date(),
    source: "other",
    sourceJobId: jobId,
  });

  return postedJobResult;
}

// Tailored Resumes
export async function createTailoredResume(data: any) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(tailoredResumes).values(data);
  return result;
}

export async function getTailoredResumeForJob(userId: number, jobId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(tailoredResumes)
    .where(
      and(eq(tailoredResumes.userId, userId), eq(tailoredResumes.jobId, jobId))
    )
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Helper for OR conditions
function or(...conditions: any[]) {
  return conditions.reduce((acc, cond) => (acc ? { or: [acc, cond] } : cond));
}

// Delete skill
export async function deleteSkill(skillId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  return await db
    .delete(skills)
    .where(and(eq(skills.id, skillId), eq(skills.userId, userId)));
}

// Delete external profile
export async function deleteExternalProfile(profileId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  return await db
    .delete(externalProfiles)
    .where(
      and(
        eq(externalProfiles.id, profileId),
        eq(externalProfiles.userId, userId)
      )
    );
}
