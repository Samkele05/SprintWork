/**
 * Advanced Job Matching Service
 * Implements sophisticated algorithms for matching job seekers with opportunities
 */

interface UserProfile {
  id: string;
  skills: string[];
  experience_years: number;
  preferred_locations: string[];
  salary_expectation: number;
  job_titles: string[];
  industries: string[];
}

interface JobOpportunity {
  id: string;
  title: string;
  description: string;
  required_skills: string[];
  preferred_skills: string[];
  experience_required: number;
  location: string;
  salary_min: number;
  salary_max: number;
  industry: string;
}

interface MatchResult {
  job_id: string;
  match_score: number; // 0-100
  breakdown: {
    skill_match: number;
    experience_match: number;
    location_match: number;
    salary_match: number;
    industry_match: number;
  };
  reasoning: string;
}

/**
 * Weighted job matching algorithm
 * Formula: S = w1*S_skills + w2*S_experience + w3*S_location + w4*S_salary + w5*S_industry
 * Weights: skills(0.35), experience(0.25), location(0.15), salary(0.15), industry(0.10)
 */
export const advancedJobMatchingService = {
  /**
   * Calculate overall match score between user and job
   */
  calculateMatchScore(
    userProfile: UserProfile,
    job: JobOpportunity
  ): MatchResult {
    // Calculate individual component scores
    const skillScore = calculateSkillMatch(userProfile.skills, job);
    const experienceScore = calculateExperienceMatch(
      userProfile.experience_years,
      job.experience_required
    );
    const locationScore = calculateLocationMatch(
      userProfile.preferred_locations,
      job.location
    );
    const salaryScore = calculateSalaryMatch(
      userProfile.salary_expectation,
      job.salary_min,
      job.salary_max
    );
    const industryScore = calculateIndustryMatch(
      userProfile.industries,
      job.industry
    );

    // Apply weights
    const weights = {
      skill: 0.35,
      experience: 0.25,
      location: 0.15,
      salary: 0.15,
      industry: 0.1,
    };

    const overallScore = Math.round(
      skillScore * weights.skill +
        experienceScore * weights.experience +
        locationScore * weights.location +
        salaryScore * weights.salary +
        industryScore * weights.industry
    );

    // Generate reasoning
    const reasoning = generateMatchReasoning(
      userProfile,
      job,
      skillScore,
      experienceScore,
      locationScore,
      salaryScore,
      industryScore
    );

    return {
      job_id: job.id,
      match_score: Math.min(100, Math.max(0, overallScore)),
      breakdown: {
        skill_match: skillScore,
        experience_match: experienceScore,
        location_match: locationScore,
        salary_match: salaryScore,
        industry_match: industryScore,
      },
      reasoning,
    };
  },

  /**
   * Find top N matching jobs for a user
   */
  findTopMatches(
    userProfile: UserProfile,
    jobs: JobOpportunity[],
    topN: number = 10
  ): MatchResult[] {
    const matches = jobs.map((job) => this.calculateMatchScore(userProfile, job));

    return matches.sort((a, b) => b.match_score - a.match_score).slice(0, topN);
  },

  /**
   * Identify skill gaps for a specific job
   */
  identifySkillGaps(userProfile: UserProfile, job: JobOpportunity): string[] {
    const userSkillsLower = userProfile.skills.map((s) => s.toLowerCase());
    const requiredSkillsLower = job.required_skills.map((s) => s.toLowerCase());

    return requiredSkillsLower.filter(
      (skill) => !userSkillsLower.includes(skill)
    );
  },

  /**
   * Get learning recommendations for skill gaps
   */
  getLearningRecommendations(
    skillGaps: string[]
  ): { skill: string; resources: string[] }[] {
    const recommendations: { skill: string; resources: string[] }[] = [];

    const skillResources: { [key: string]: string[] } = {
      python: [
        "Python for Everybody (Coursera)",
        "Real Python",
        "Codecademy Python Course",
      ],
      javascript: [
        "JavaScript.info",
        "Codecademy JavaScript",
        "freeCodeCamp JavaScript",
      ],
      typescript: [
        "TypeScript Official Docs",
        "TypeScript Deep Dive",
        "Udemy TypeScript Course",
      ],
      react: [
        "React Official Docs",
        "Scrimba React Course",
        "Egghead.io React",
      ],
      "system design": [
        "System Design Primer",
        "Grokking the System Design Interview",
        "ByteByteGo",
      ],
      sql: [
        "SQLZoo",
        "Mode Analytics SQL Tutorial",
        "Codecademy SQL",
      ],
      aws: [
        "AWS Free Tier",
        "A Cloud Guru",
        "Linux Academy AWS",
      ],
      docker: [
        "Docker Official Docs",
        "Play with Docker",
        "Udemy Docker Course",
      ],
      kubernetes: [
        "Kubernetes Official Docs",
        "Katacoda Kubernetes",
        "Linux Academy Kubernetes",
      ],
      "machine learning": [
        "Fast.ai",
        "Andrew Ng's ML Course",
        "Kaggle Learn",
      ],
    };

    for (const gap of skillGaps) {
      const gapLower = gap.toLowerCase();
      const resources = skillResources[gapLower] || [
        `Udemy ${gap} Course`,
        `Coursera ${gap}`,
        `YouTube ${gap} Tutorial`,
      ];
      recommendations.push({ skill: gap, resources });
    }

    return recommendations;
  },
};

/**
 * Calculate skill match score (0-100)
 * Uses Jaccard similarity: |intersection| / |union|
 */
function calculateSkillMatch(
  userSkills: string[],
  job: JobOpportunity
): number {
  const userSkillsSet = new Set(userSkills.map((s) => s.toLowerCase()));
  const requiredSkillsSet = new Set(
    job.required_skills.map((s) => s.toLowerCase())
  );
  const preferredSkillsSet = new Set(
    job.preferred_skills.map((s) => s.toLowerCase())
  );

  // Calculate intersection with required skills
  const requiredIntersection = Array.from(requiredSkillsSet).filter((skill) =>
    userSkillsSet.has(skill)
  ).length;

  // Calculate intersection with preferred skills
  const preferredIntersection = Array.from(preferredSkillsSet).filter((skill) =>
    userSkillsSet.has(skill)
  ).length;

  // Weighted score: required skills are more important
  const requiredScore =
    requiredSkillsSet.size > 0
      ? (requiredIntersection / requiredSkillsSet.size) * 100
      : 50;
  const preferredScore =
    preferredSkillsSet.size > 0
      ? (preferredIntersection / preferredSkillsSet.size) * 100
      : 0;

  return Math.round(requiredScore * 0.7 + preferredScore * 0.3);
}

/**
 * Calculate experience match score (0-100)
 * Penalizes if user is underqualified, rewards if well-matched
 */
function calculateExperienceMatch(
  userExperience: number,
  requiredExperience: number
): number {
  if (userExperience >= requiredExperience) {
    // User meets or exceeds requirements
    const surplus = Math.min(userExperience - requiredExperience, 5); // Cap surplus at 5 years
    return Math.min(100, 80 + surplus * 4);
  } else {
    // User is underqualified
    const deficit = requiredExperience - userExperience;
    return Math.max(0, 80 - deficit * 15);
  }
}

/**
 * Calculate location match score (0-100)
 * Considers remote work and relocation willingness
 */
function calculateLocationMatch(
  preferredLocations: string[],
  jobLocation: string
): number {
  if (
    preferredLocations.includes("Remote") ||
    preferredLocations.includes("Anywhere")
  ) {
    return 100;
  }

  if (preferredLocations.includes(jobLocation)) {
    return 100;
  }

  // Partial match for same country/region
  const userCountries = preferredLocations.map((loc) => loc.split(",")[1]?.trim() || loc);
  const jobCountry = jobLocation.split(",")[1]?.trim() || jobLocation;

  if (userCountries.includes(jobCountry)) {
    return 70;
  }

  return 30; // Different location, but user might be willing to relocate
}

/**
 * Calculate salary match score (0-100)
 * Considers if job salary aligns with user expectations
 */
function calculateSalaryMatch(
  userExpectation: number,
  jobMin: number,
  jobMax: number
): number {
  if (userExpectation <= jobMax && userExpectation >= jobMin) {
    return 100; // Perfect match
  }

  if (userExpectation > jobMax) {
    const excess = userExpectation - jobMax;
    return Math.max(0, 100 - (excess / jobMax) * 50);
  }

  if (userExpectation < jobMin) {
    const deficit = jobMin - userExpectation;
    return Math.max(50, 100 - (deficit / jobMin) * 30);
  }

  return 50;
}

/**
 * Calculate industry match score (0-100)
 * Considers if job industry aligns with user's background
 */
function calculateIndustryMatch(
  userIndustries: string[],
  jobIndustry: string
): number {
  if (userIndustries.includes(jobIndustry)) {
    return 100;
  }

  // Define related industries
  const relatedIndustries: { [key: string]: string[] } = {
    technology: ["software", "it", "tech", "engineering", "startup"],
    finance: ["banking", "fintech", "investment", "accounting"],
    healthcare: ["pharma", "biotech", "medical", "wellness"],
    retail: ["ecommerce", "logistics", "supply chain"],
    marketing: ["advertising", "pr", "communications", "media"],
  };

  const userIndustriesLower = userIndustries.map((i) => i.toLowerCase());
  const jobIndustryLower = jobIndustry.toLowerCase();

  for (const [category, related] of Object.entries(relatedIndustries)) {
    if (
      userIndustriesLower.includes(category) &&
      related.includes(jobIndustryLower)
    ) {
      return 70;
    }
  }

  return 40; // Different industry, but transferable skills possible
}

/**
 * Generate human-readable reasoning for match score
 */
function generateMatchReasoning(
  userProfile: UserProfile,
  job: JobOpportunity,
  skillScore: number,
  experienceScore: number,
  locationScore: number,
  salaryScore: number,
  industryScore: number
): string {
  const reasons: string[] = [];

  if (skillScore >= 80) {
    reasons.push("Excellent skill match");
  } else if (skillScore >= 60) {
    reasons.push("Good skill match");
  } else {
    reasons.push("Some skill gaps to address");
  }

  if (experienceScore >= 80) {
    reasons.push("Experience level aligns well");
  } else if (experienceScore >= 60) {
    reasons.push("Experience is acceptable");
  } else {
    reasons.push("You may be underqualified");
  }

  if (locationScore === 100) {
    reasons.push("Location is ideal");
  } else if (locationScore >= 70) {
    reasons.push("Location is acceptable");
  } else {
    reasons.push("Location may be a challenge");
  }

  if (salaryScore >= 80) {
    reasons.push("Salary aligns with expectations");
  } else if (salaryScore >= 60) {
    reasons.push("Salary is within acceptable range");
  } else {
    reasons.push("Salary may be below expectations");
  }

  return reasons.join(". ") + ".";
}
