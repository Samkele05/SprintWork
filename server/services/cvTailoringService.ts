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
            required: [
              "requiredSkills",
              "preferredSkills",
              "keyResponsibilities",
              "experienceLevel",
              "keywords",
            ],
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
    const userSkillsLower = userProfile.skills.map(s => s.toLowerCase());
    const requiredSkillsLower = jobAnalysis.requiredSkills.map(s =>
      s.toLowerCase()
    );
    const preferredSkillsLower = jobAnalysis.preferredSkills.map(s =>
      s.toLowerCase()
    );

    const requiredMatches = requiredSkillsLower.filter(skill =>
      userSkillsLower.some(us => us.includes(skill) || skill.includes(us))
    ).length;
    const preferredMatches = preferredSkillsLower.filter(skill =>
      userSkillsLower.some(us => us.includes(skill) || skill.includes(us))
    ).length;

    // Weights for each factor
    const W_SKILLS = 0.6; // Skills are most important
    const W_EXPERIENCE = 0.2; // Experience is also significant
    const W_LOCATION = 0.1; // Location match
    const W_SALARY = 0.1; // Salary match

    // 1. Skill Match Score (Jaccard-like similarity)
    const allJobSkills = [...requiredSkillsLower, ...preferredSkillsLower];
    const intersection = userSkillsLower.filter(skill =>
      allJobSkills.includes(skill)
    );
    const union = new Set([...userSkillsLower, ...allJobSkills]);
    const skillMatchScore =
      union.size === 0 ? 0 : intersection.length / union.size;

    // 2. Experience Match Score (Placeholder for now, needs more data)
    // For now, a simple binary check or placeholder
    let experienceMatchScore = 0.5; // Default to medium match
    // In a real scenario, this would compare user's years of experience with job's required experience
    // For example: if (userProfile.yearsExperience >= jobAnalysis.minExperience) experienceMatchScore = 1;

    // 3. Location Match Score (Placeholder for now, needs more data)
    let locationMatchScore = 0.5; // Default to medium match
    // In a real scenario, this would compare user's preferred location with job's location
    // For example: if (userProfile.location === job.location) locationMatchScore = 1;

    // 4. Salary Match Score (Placeholder for now, needs more data)
    let salaryMatchScore = 0.5; // Default to medium match
    // In a real scenario, this would compare user's salary expectations with job's salary range
    // For example: if (userProfile.salaryExpectation >= job.minSalary && userProfile.salaryExpectation <= job.maxSalary) salaryMatchScore = 1;

    const totalScore =
      (W_SKILLS * skillMatchScore +
        W_EXPERIENCE * experienceMatchScore +
        W_LOCATION * locationMatchScore +
        W_SALARY * salaryMatchScore) *
      100;

    return Math.round(totalScore);
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
          content: `You are an expert resume writer specializing in ATS optimization. Your goal is to tailor a user's resume to a specific job description, ensuring it passes Applicant Tracking Systems (ATS) and highlights the most relevant skills and experiences. Maintain authenticity and professional tone. Focus on keyword injection, action verb enhancement, and quantifying achievements. The output should be a plain text, ATS-friendly resume (no graphics, simple formatting).

Here's the user's current profile and the target job description:

User Profile:
Name: ${userProfile.name}
Email: ${userProfile.email}
Bio: ${userProfile.bio || "N/A"}
Skills: ${userProfile.skills.join(", ")}
Experience: ${userProfile.experience}
Education: ${userProfile.education}

Target Job:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description}
Required Skills: ${jobAnalysis.requiredSkills.join(", ")}
Preferred Skills: ${jobAnalysis.preferredSkills.join(", ")}
Key Responsibilities: ${jobAnalysis.keyResponsibilities.join(", ")}
Keywords: ${jobAnalysis.keywords.join(", ")}

Instructions for tailoring:
1. **Keyword Injection:** Naturally integrate as many of the job's required and preferred skills/keywords into the resume as possible, especially in the summary and experience sections.
2. **Action Verb Enhancement:** Replace weak verbs with strong, impactful action verbs (e.g., 'managed' -> 'spearheaded', 'responsible for' -> 'orchestrated').
3. **Quantification:** Where possible, suggest or insert quantifiable achievements (e.g., 'Increased sales by 20%', 'Reduced costs by $50K'). If specific numbers are not available, prompt the user to add them.
4. **ATS Optimization:** Ensure the resume is parseable by ATS, using clear headings and standard formatting. Avoid complex layouts.
5. **Highlight Relevance:** Emphasize experiences and skills most relevant to the job description.

Generate the tailored resume content.`,
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
    const userSkillsLower = userProfile.skills.map(s => s.toLowerCase());
    const highlights = jobAnalysis.requiredSkills.filter(skill =>
      userSkillsLower.some(
        us =>
          us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us)
      )
    );

    // Generate recommendations
    const recommendations: string[] = [];
    const missingSkills = jobAnalysis.requiredSkills.filter(
      skill =>
        !userSkillsLower.some(
          us =>
            us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us)
        )
    );
    if (missingSkills.length > 0) {
      recommendations.push(
        `Consider developing these skills: ${missingSkills.slice(0, 3).join(", ")}`
      );
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
    const userSkillsLower = userSkills.map(s => s.toLowerCase());
    gaps = requiredSkills.filter(
      skill =>
        !userSkillsLower.some(
          us =>
            us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us)
        )
    );

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
                    priority: {
                      type: "string",
                      enum: ["high", "medium", "low"],
                    },
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
      recommendations: gapsList.map(gap => ({
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
