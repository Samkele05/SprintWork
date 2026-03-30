/**
 * Machine Learning Service - Job matching and recommendations
 * Uses similarity algorithms and skill-based matching
 */

export interface JobMatchResult {
  jobId: number;
  matchScore: number;
  matchReason: string;
  skillsMatched: string[];
  skillsGap: string[];
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) return 100;

  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 100;

  const editDistance = getEditDistance(longer, shorter);
  return ((longer.length - editDistance) / longer.length) * 100;
}

/**
 * Calculate edit distance (Levenshtein distance)
 */
function getEditDistance(s1: string, s2: string): number {
  const costs: number[] = [];

  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }

  return costs[s2.length];
}

/**
 * Calculate skill match score
 */
export function calculateSkillMatchScore(userSkills: string[], jobRequiredSkills: string[]): { matchScore: number; matched: string[]; gap: string[] } {
  const userSkillsLower = userSkills.map((s) => s.toLowerCase());
  const matched: string[] = [];
  const gap: string[] = [];

  for (const requiredSkill of jobRequiredSkills) {
    const requiredLower = requiredSkill.toLowerCase();
    let found = false;

    for (const userSkill of userSkillsLower) {
      const similarity = calculateStringSimilarity(userSkill, requiredLower);
      if (similarity > 70) {
        matched.push(requiredSkill);
        found = true;
        break;
      }
    }

    if (!found) {
      gap.push(requiredSkill);
    }
  }

  const matchScore = jobRequiredSkills.length > 0 ? (matched.length / jobRequiredSkills.length) * 100 : 0;

  return { matchScore, matched, gap };
}

/**
 * Extract skills from job description using keyword matching
 */
export function extractSkillsFromJobDescription(description: string, requirements: string): string[] {
  const commonSkills = [
    "JavaScript",
    "Python",
    "React",
    "Node.js",
    "SQL",
    "MongoDB",
    "AWS",
    "Docker",
    "Kubernetes",
    "Java",
    "C++",
    "Go",
    "Rust",
    "TypeScript",
    "Vue.js",
    "Angular",
    "Express",
    "Django",
    "FastAPI",
    "PostgreSQL",
    "MySQL",
    "Redis",
    "Elasticsearch",
    "GraphQL",
    "REST API",
    "Microservices",
    "CI/CD",
    "Git",
    "Linux",
    "Machine Learning",
    "Deep Learning",
    "TensorFlow",
    "PyTorch",
    "Data Science",
    "Analytics",
    "Tableau",
    "Power BI",
    "Excel",
    "Agile",
    "Scrum",
    "Leadership",
    "Communication",
    "Problem Solving",
  ];

  const fullText = `${description} ${requirements}`.toLowerCase();
  const foundSkills: Set<string> = new Set();

  for (const skill of commonSkills) {
    if (fullText.includes(skill.toLowerCase())) {
      foundSkills.add(skill);
    }
  }

  return Array.from(foundSkills);
}

/**
 * Calculate location match score
 */
export function calculateLocationMatchScore(userLocations: string[], jobLocation: string): number {
  if (!jobLocation) return 100; // Remote-friendly

  const jobLocationLower = jobLocation.toLowerCase();

  for (const userLocation of userLocations) {
    const userLocationLower = userLocation.toLowerCase();

    if (userLocationLower === jobLocationLower) return 100;
    if (userLocationLower.includes("remote") || jobLocationLower.includes("remote")) return 90;

    // Check if in same state/country
    const userParts = userLocationLower.split(",");
    const jobParts = jobLocationLower.split(",");

    if (userParts.length > 0 && jobParts.length > 0) {
      if (userParts[userParts.length - 1].trim() === jobParts[jobParts.length - 1].trim()) {
        return 70; // Same country/state
      }
    }
  }

  return 30; // Different location
}

/**
 * Calculate salary match score
 */
export function calculateSalaryMatchScore(userExpectation: number | null, jobSalaryRange: string): number {
  if (!userExpectation || !jobSalaryRange) return 50;

  // Parse salary range (e.g., "$100,000 - $150,000")
  const salaryMatch = jobSalaryRange.match(/\$?([\d,]+)\s*-\s*\$?([\d,]+)/);

  if (!salaryMatch) return 50;

  const minSalary = parseInt(salaryMatch[1].replace(/,/g, ""));
  const maxSalary = parseInt(salaryMatch[2].replace(/,/g, ""));

  if (userExpectation >= minSalary && userExpectation <= maxSalary) {
    return 100;
  } else if (userExpectation < minSalary) {
    return Math.max(0, 100 - (minSalary - userExpectation) / 1000);
  } else {
    return Math.max(0, 100 - (userExpectation - maxSalary) / 1000);
  }
}

/**
 * Calculate experience level match
 */
export function calculateExperienceMatchScore(userYearsExperience: number, jobRequirements: string): number {
  // Extract required years from job requirements
  const yearsMatch = jobRequirements.match(/(\d+)\+?\s*years?/i);

  if (!yearsMatch) return 50;

  const requiredYears = parseInt(yearsMatch[1]);

  if (userYearsExperience >= requiredYears) {
    return 100;
  } else {
    return (userYearsExperience / requiredYears) * 100;
  }
}

/**
 * Comprehensive job matching algorithm
 */
export function matchJobToProfile(userProfile: any, userSkills: string[], job: any): JobMatchResult {
  // Extract skills from job
  const jobSkills = extractSkillsFromJobDescription(job.description || "", job.requirements || "");

  // Calculate individual scores
  const skillScore = calculateSkillMatchScore(userSkills, jobSkills);
  const locationScore = calculateLocationMatchScore(userProfile.desiredLocations || [], job.location || "");
  const salaryScore = calculateSalaryMatchScore(userProfile.salaryExpectation, job.salary || "");
  const experienceScore = calculateExperienceMatchScore(userProfile.yearsExperience || 0, job.requirements || "");

  // Weighted average (skills: 40%, location: 20%, salary: 20%, experience: 20%)
  const overallScore = skillScore.matchScore * 0.4 + locationScore * 0.2 + salaryScore * 0.2 + experienceScore * 0.2;

  // Generate match reason
  let matchReason = "Good match based on ";
  const reasons: string[] = [];

  if (skillScore.matchScore > 70) reasons.push("strong skill alignment");
  if (locationScore > 70) reasons.push("location preference");
  if (salaryScore > 70) reasons.push("salary expectations");
  if (experienceScore > 70) reasons.push("experience level");

  matchReason += reasons.join(", ") || "overall profile";

  return {
    jobId: job.id,
    matchScore: Math.round(overallScore),
    matchReason,
    skillsMatched: skillScore.matched,
    skillsGap: skillScore.gap,
  };
}

/**
 * Batch job matching for a user against multiple jobs
 */
export function matchUserToJobs(userProfile: any, userSkills: string[], jobs: any[]): JobMatchResult[] {
  return jobs
    .map((job) => matchJobToProfile(userProfile, userSkills, job))
    .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Personalized job recommendations based on user profile
 */
export function generatePersonalizedRecommendations(userProfile: any, userSkills: string[], allJobs: any[], topN: number = 10): JobMatchResult[] {
  const matches = matchUserToJobs(userProfile, userSkills, allJobs);
  return matches.filter((m) => m.matchScore >= 50).slice(0, topN);
}

/**
 * Trending skills analysis
 */
export function analyzeTrendingSkills(allJobs: any[]): { skill: string; frequency: number; trend: "rising" | "stable" | "declining" }[] {
  const skillFrequency: Record<string, number> = {};

  for (const job of allJobs) {
    const skills = extractSkillsFromJobDescription(job.description || "", job.requirements || "");
    for (const skill of skills) {
      skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
    }
  }

  return Object.entries(skillFrequency)
    .map(([skill, frequency]) => ({
      skill,
      frequency,
      trend: (frequency > allJobs.length * 0.3 ? "rising" : frequency > allJobs.length * 0.1 ? "stable" : "declining") as "rising" | "stable" | "declining",
    }))
    .sort((a, b) => b.frequency - a.frequency);
}
