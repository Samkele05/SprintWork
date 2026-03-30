import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { jobSeekerProfiles, recruiterProfiles, users } from "../drizzle/schema";

/**
 * Profile Management - Real database operations
 */

export async function updateUserProfile(userId: number, updates: { name?: string; email?: string; profilePictureUrl?: string }): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const updateData: Record<string, any> = {};
  if (updates.name) updateData.name = updates.name;
  if (updates.email) updateData.email = updates.email;

  if (Object.keys(updateData).length > 0) {
    await db.update(users).set(updateData).where(eq(users.id, userId));
  }
}

export async function getJobSeekerProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(jobSeekerProfiles).where(eq(jobSeekerProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertJobSeekerProfile(data: {
  userId: number;
  headline?: string;
  currentRole?: string;
  yearsExperience?: number;
  desiredRoles?: string[];
  desiredLocations?: string[];
  salaryExpectation?: number;
  workPreference?: string;
  availability?: string;
  openToOpportunities?: boolean;
}): Promise<any> {
  const db = await getDb();
  if (!db) return null;

  const existing = await getJobSeekerProfile(data.userId);

  const profileData = {
    userId: data.userId,
    headline: data.headline || existing?.headline,
    currentRole: data.currentRole || existing?.currentRole,
    yearsExperience: data.yearsExperience ?? existing?.yearsExperience,
    desiredRoles: data.desiredRoles ? JSON.stringify(data.desiredRoles) : existing?.desiredRoles,
    desiredLocations: data.desiredLocations ? JSON.stringify(data.desiredLocations) : existing?.desiredLocations,
    salaryExpectation: data.salaryExpectation ?? existing?.salaryExpectation,
    workPreference: data.workPreference || existing?.workPreference,
    availability: data.availability || existing?.availability,
    openToOpportunities: data.openToOpportunities ?? existing?.openToOpportunities,
  };

  if (existing) {
    await db.update(jobSeekerProfiles).set(profileData as any).where(eq(jobSeekerProfiles.userId, data.userId));
  } else {
    await db.insert(jobSeekerProfiles).values(profileData as any);
  }

  return profileData;
}

export async function getRecruiterProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(recruiterProfiles).where(eq(recruiterProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertRecruiterProfile(data: {
  userId: number;
  companyName: string;
  companyWebsite?: string;
  industry?: string;
  companySize?: string;
  jobTitle?: string;
  department?: string;
  companyLogoUrl?: string;
}): Promise<any> {
  const db = await getDb();
  if (!db) return null;

  const existing = await getRecruiterProfile(data.userId);

  const profileData = {
    userId: data.userId,
    companyName: data.companyName,
    companyWebsite: data.companyWebsite || existing?.companyWebsite,
    industry: data.industry || existing?.industry,
    companySize: data.companySize || existing?.companySize,
    jobTitle: data.jobTitle || existing?.jobTitle,
    department: data.department || existing?.department,
    companyLogoUrl: data.companyLogoUrl || existing?.companyLogoUrl,
  };

  if (existing) {
    await db.update(recruiterProfiles).set(profileData as any).where(eq(recruiterProfiles.userId, data.userId));
  } else {
    await db.insert(recruiterProfiles).values(profileData as any);
  }

  return profileData;
}
