import { invokeLLM } from "../_core/llm";

/**
 * Enhanced CV Tailoring Service
 * Tailors resumes to specific jobs using comprehensive user data
 */

interface UserProfile {
  name: string;
  email: string;
  bio?: string;
  skills: string[];
  experience: string;
  education: string;
  externalProfiles?: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
  };
}

interface JobDescription {
  title: string;
  company: string;
  description: string;
  requirements?: string | null;
  salary?: string | null;
  location?: string | null;
  jobType?: string | null;
  [key: string]: any;
}

interface TailoredCV {
  originalContent: string;
  tailoredContent: string;
  matchScore: number;
  highlights: string[];
  recommendations: string[];
  atsOptimized: boolean;
}

/**
 * Analyze job description and extract key requirements
 */
export async function analyzeJobDescription(job: JobDescription): Promise<{
  requiredSkills: string[];
  preferredSkills: string[];
  keyResponsibilities: string[];
  experienceLevel: string;
  keywords: string[];
}> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are an expert recruiter. Analyze the job description and extract key requirements, skills, and qualifications. Return response as JSON.",
        },
        {
          role: "user",
          content: `Job Title: ${job.title}\nCompany: ${job.company}\nDescription: ${job.description}\nRequirements: ${job.requirements}\n\nExtract: requiredSkills (array), preferredSkills (array), keyResponsibilities (array), experienceLevel (string), keywords (array)`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "job_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              requiredSkills: {
                type: "array",
                items: { type: "string" },
              },
              preferredSkills: {
                type: "array",
                items: { type: "string" },
              },
              keyResponsibilities: {
                type: "array",
                items: { type: "string" },
              },
              experienceLevel: {
                type: "string",
              },
              keywords: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: ["requiredSkills", "preferredSkills", "keyResponsibilities", "experienceLevel", "keywords"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message.content;
    let contentStr = "";
    if (typeof content === "string") {
      contentStr = content;
    } else if (Array.isArray(content)) {
      contentStr = content.map((c: any) => c.text || "").join("");
    }

    if (contentStr) {
      const parsed = JSON.parse(contentStr);
      return parsed;
    }

    return {
      requiredSkills: [],
      preferredSkills: [],
      keyResponsibilities: [],
      experienceLevel: "mid-level",
      keywords: [],
    };
  } catch (error) {
    console.error("Failed to analyze job description:", error);
    return {
      requiredSkills: [],
      preferredSkills: [],
      keyResponsibilities: [],
      experienceLevel: "mid-level",
      keywords: [],
    };
  }
}

/**
 * Calculate match score between user profile and job requirements
 */
export async function calculateMatchScore(
  userProfile: UserProfile,
  jobAnalysis: {
    requiredSkills: string[];
    preferredSkills: string[];
    keyResponsibilities: string[];
    experienceLevel: string;
  }
): Promise<number> {
  try {
    const userSkillsLower = userProfile.skills.map((s) => s.toLowerCase());
    const requiredSkillsLower = jobAnalysis.requiredSkills.map((s) => s.toLowerCase());
    const preferredSkillsLower = jobAnalysis.preferredSkills.map((s) => s.toLowerCase());

    const requiredMatches = requiredSkillsLower.filter((skill) => userSkillsLower.some((us) => us.includes(skill) || skill.includes(us))).length;
    const preferredMatches = preferredSkillsLower.filter((skill) => userSkillsLower.some((us) => us.includes(skill) || skill.includes(us))).length;

    const requiredScore = (requiredMatches / Math.max(requiredSkillsLower.length, 1)) * 60;
    const preferredScore = (preferredMatches / Math.max(preferredSkillsLower.length, 1)) * 20;
    const experienceScore = 20; // Assume user has relevant experience

    return Math.round(requiredScore + preferredScore + experienceScore);
  } catch (error) {
    console.error("Failed to calculate match score:", error);
    return 0;
  }
}

/**
 * Generate tailored CV optimized for ATS and specific job
 */
export async function generateTailoredCV(
  userProfile: UserProfile,
  job: JobDescription,
  jobAnalysis: {
    requiredSkills: string[];
    preferredSkills: string[];
    keyResponsibilities: string[];
    experienceLevel: string;
    keywords: string[];
  }
): Promise<TailoredCV> {
  try {
    const matchScore = await calculateMatchScore(userProfile, jobAnalysis);

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an expert resume writer specializing in ATS optimization. Tailor the resume to match the job requirements while maintaining authenticity. Include relevant keywords naturally. Format for ATS compatibility (no graphics, simple formatting).`,
        },
        {
          role: "user",
          content: `User Profile:
Name: ${userProfile.name}
Email: ${userProfile.email}
Bio: ${userProfile.bio || "N/A"}
Skills: ${userProfile.skills.join(", ")}
Experience: ${userProfile.experience}
Education: ${userProfile.education}

Target Job:
Title: ${job.title}
Company: ${job.company}
Required Skills: ${jobAnalysis.requiredSkills.join(", ")}
Preferred Skills: ${jobAnalysis.preferredSkills.join(", ")}
Key Responsibilities: ${jobAnalysis.keyResponsibilities.join(", ")}
Keywords: ${jobAnalysis.keywords.join(", ")}

Generate a tailored resume that:
1. Highlights skills matching the job requirements
2. Emphasizes relevant experience
3. Includes job keywords naturally
4. Is ATS-optimized
5. Is compelling and professional`,
        },
      ],
    });

    const content = response.choices[0]?.message.content;
    let tailoredContent = "";
    if (typeof content === "string") {
      tailoredContent = content;
    } else if (Array.isArray(content)) {
      tailoredContent = content.map((c: any) => c.text || "").join("");
    }

    // Extract highlights (skills that match)
    const userSkillsLower = userProfile.skills.map((s) => s.toLowerCase());
    const highlights = jobAnalysis.requiredSkills.filter((skill) => userSkillsLower.some((us) => us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us)));

    // Generate recommendations
    const recommendations: string[] = [];
    const missingSkills = jobAnalysis.requiredSkills.filter(
      (skill) => !userSkillsLower.some((us) => us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us))
    );
    if (missingSkills.length > 0) {
      recommendations.push(`Consider developing these skills: ${missingSkills.slice(0, 3).join(", ")}`);
    }
    recommendations.push("Quantify achievements with metrics and results");
    recommendations.push("Use action verbs and industry-specific terminology");

    return {
      originalContent: `${userProfile.name}\n${userProfile.email}\n\nBio: ${userProfile.bio}\n\nSkills: ${userProfile.skills.join(", ")}\n\nExperience:\n${userProfile.experience}\n\nEducation:\n${userProfile.education}`,
      tailoredContent,
      matchScore,
      highlights,
      recommendations,
      atsOptimized: true,
    };
  } catch (error) {
    console.error("Failed to generate tailored CV:", error);
    return {
      originalContent: "",
      tailoredContent: "",
      matchScore: 0,
      highlights: [],
      recommendations: ["Failed to generate tailored CV"],
      atsOptimized: false,
    };
  }
}

/**
 * Generate skill gap analysis and recommendations
 */
export async function generateSkillGapAnalysis(
  userSkills: string[],
  requiredSkills: string[],
  preferredSkills: string[]
): Promise<{
  gaps: string[];
  recommendations: Array<{
    skill: string;
    priority: "high" | "medium" | "low";
    resources: string[];
  }>;
}> {
  let gaps: string[] = [];
  try {
    const userSkillsLower = userSkills.map((s) => s.toLowerCase());
    gaps = requiredSkills.filter((skill) => !userSkillsLower.some((us) => us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us)));

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a career development advisor. For each skill gap, suggest learning resources and estimate time to proficiency. Return as JSON array with skill, priority, and resources.",
        },
        {
          role: "user",
          content: `Skill Gaps: ${gaps.join(", ")}\n\nFor each gap, provide: skill (string), priority (high/medium/low), resources (array of learning resources)`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "skill_gap_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    skill: { type: "string" },
                    priority: { type: "string", enum: ["high", "medium", "low"] },
                    resources: { type: "array", items: { type: "string" } },
                  },
                  required: ["skill", "priority", "resources"],
                  additionalProperties: false,
                },
              },
            },
            required: ["recommendations"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message.content;
    let contentStr = "";
    if (typeof content === "string") {
      contentStr = content;
    } else if (Array.isArray(content)) {
      contentStr = content.map((c: any) => c.text || "").join("");
    }

    if (contentStr) {
      const parsed = JSON.parse(contentStr);
      return {
        gaps,
        recommendations: parsed.recommendations || [],
      };
    }

    const gapsList = gaps || [];
    return {
      gaps: gapsList,
      recommendations: gapsList.map((gap) => ({
        skill: gap,
        priority: "high" as const,
        resources: ["Udemy", "Coursera", "LinkedIn Learning"],
      })),
    };
  } catch (error) {
    console.error("Failed to generate skill gap analysis:", error);
    const gapsList = gaps || [];
    return {
      gaps: gapsList,
      recommendations: [],
    };
  }
}
