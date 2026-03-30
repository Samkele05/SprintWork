import { invokeLLM } from "../_core/llm";

/**
 * User Engagement & Journey Tracking Service
 * Tracks user activity and generates personalized recommendations
 */

interface UserActivity {
  userId: number;
  profileUpdates: number;
  skillsAdded: number;
  externalProfilesLinked: number;
  jobsApplied: number;
  interviewsCompleted: number;
  interviewsAverage: number;
  coursesEnrolled: number;
  coursesCompleted: number;
  connectionsCreated: number;
  messagesExchanged: number;
  savedSearches: number;
  lastActivityDate: Date;
}

interface EngagementScore {
  overallScore: number; // 0-100
  profileCompletion: number;
  activityLevel: number;
  interviewPerformance: number;
  learningProgress: number;
  networkingScore: number;
  recommendations: string[];
  nextSteps: string[];
}

/**
 * Calculate user engagement score based on activity
 */
export async function calculateEngagementScore(activity: UserActivity): Promise<EngagementScore> {
  // Profile completion score (0-20)
  const profileScore = Math.min(20, (activity.profileUpdates + activity.skillsAdded + activity.externalProfilesLinked) * 2);

  // Activity level score (0-20)
  const activityScore = Math.min(20, (activity.jobsApplied + activity.connectionsCreated + activity.messagesExchanged) * 1.5);

  // Interview performance score (0-20)
  const interviewScore = activity.interviewsCompleted > 0 ? Math.min(20, (activity.interviewsAverage / 10) * 20) : 0;

  // Learning progress score (0-20)
  const learningScore = activity.coursesCompleted > 0 ? Math.min(20, (activity.coursesCompleted / Math.max(activity.coursesEnrolled, 1)) * 20) : 0;

  // Networking score (0-20)
  const networkingScore = Math.min(20, (activity.connectionsCreated + activity.messagesExchanged) * 1.5);

  const overallScore = Math.round(profileScore + activityScore + interviewScore + learningScore + networkingScore);

  const recommendations: string[] = [];
  const nextSteps: string[] = [];

  // Generate recommendations based on activity
  if (activity.profileUpdates < 3) {
    recommendations.push("Complete your profile with more details");
    nextSteps.push("Update profile information and add a professional photo");
  }

  if (activity.skillsAdded < 5) {
    recommendations.push("Add more skills to improve job matching");
    nextSteps.push("Add at least 5 relevant skills to your profile");
  }

  if (activity.externalProfilesLinked === 0) {
    recommendations.push("Link your GitHub and LinkedIn profiles");
    nextSteps.push("Connect your external profiles to showcase your work");
  }

  if (activity.jobsApplied < 5) {
    recommendations.push("Start applying to jobs that match your profile");
    nextSteps.push("Browse and apply to at least 5 relevant job listings");
  }

  if (activity.interviewsCompleted === 0) {
    recommendations.push("Practice with mock interviews to build confidence");
    nextSteps.push("Complete your first mock interview session");
  }

  if (activity.coursesEnrolled === 0) {
    recommendations.push("Enroll in courses to develop new skills");
    nextSteps.push("Browse skill development courses and enroll in one");
  }

  if (activity.connectionsCreated < 3) {
    recommendations.push("Build your professional network");
    nextSteps.push("Connect with recruiters and professionals in your field");
  }

  return {
    overallScore,
    profileCompletion: profileScore,
    activityLevel: activityScore,
    interviewPerformance: interviewScore,
    learningProgress: learningScore,
    networkingScore,
    recommendations,
    nextSteps,
  };
}

/**
 * Generate personalized recommendations based on user data
 */
export async function generatePersonalizedRecommendations(
  userId: number,
  userProfile: {
    name: string;
    skills: string[];
    experience: string;
    interviewScores: number[];
    appliedJobs: Array<{ title: string; company: string }>;
  },
  jobMatches: Array<{
    jobId: number;
    title: string;
    company: string;
    matchScore: number;
  }>
): Promise<{
  topJobs: typeof jobMatches;
  skillsToLearn: string[];
  coursesRecommended: string[];
  networkingTips: string[];
  interviewTips: string[];
}> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a career advisor. Based on user profile and job matches, provide personalized recommendations for skills to learn, courses, networking tips, and interview preparation. Return as JSON.",
        },
        {
          role: "user",
          content: `User: ${userProfile.name}\nSkills: ${userProfile.skills.join(", ")}\nInterview Average: ${userProfile.interviewScores.length > 0 ? (userProfile.interviewScores.reduce((a, b) => a + b) / userProfile.interviewScores.length).toFixed(1) : "N/A"}\nTop Job Matches: ${jobMatches.slice(0, 3).map((j) => j.title).join(", ")}\n\nProvide: skillsToLearn (array), coursesRecommended (array), networkingTips (array), interviewTips (array)`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "recommendations",
          strict: true,
          schema: {
            type: "object",
            properties: {
              skillsToLearn: { type: "array", items: { type: "string" } },
              coursesRecommended: { type: "array", items: { type: "string" } },
              networkingTips: { type: "array", items: { type: "string" } },
              interviewTips: { type: "array", items: { type: "string" } },
            },
            required: ["skillsToLearn", "coursesRecommended", "networkingTips", "interviewTips"],
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
        topJobs: jobMatches.slice(0, 5),
        skillsToLearn: parsed.skillsToLearn || [],
        coursesRecommended: parsed.coursesRecommended || [],
        networkingTips: parsed.networkingTips || [],
        interviewTips: parsed.interviewTips || [],
      };
    }

    return {
      topJobs: jobMatches.slice(0, 5),
      skillsToLearn: [],
      coursesRecommended: [],
      networkingTips: [],
      interviewTips: [],
    };
  } catch (error) {
    console.error("Failed to generate personalized recommendations:", error);
    return {
      topJobs: jobMatches.slice(0, 5),
      skillsToLearn: [],
      coursesRecommended: [],
      networkingTips: [],
      interviewTips: [],
    };
  }
}

/**
 * Analyze user personality and communication style from interview data
 */
export async function analyzePersonality(
  interviewResponses: Array<{
    question: string;
    answer: string;
  }>
): Promise<{
  personality: {
    communicationStyle: string;
    strengths: string[];
    areasForImprovement: string[];
    recommendedRoles: string[];
  };
  cultureFit: Array<{
    company: string;
    fitScore: number;
    reason: string;
  }>;
}> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a personality analyst and career coach. Analyze the interview responses to determine communication style, strengths, areas for improvement, and recommended roles. Also assess cultural fit with different company types. Return as JSON.",
        },
        {
          role: "user",
          content: `Interview Responses:\n${interviewResponses.map((r) => `Q: ${r.question}\nA: ${r.answer}`).join("\n\n")}\n\nProvide: personality (with communicationStyle, strengths, areasForImprovement, recommendedRoles), cultureFit (array with company, fitScore 0-100, reason)`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "personality_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              personality: {
                type: "object",
                properties: {
                  communicationStyle: { type: "string" },
                  strengths: { type: "array", items: { type: "string" } },
                  areasForImprovement: { type: "array", items: { type: "string" } },
                  recommendedRoles: { type: "array", items: { type: "string" } },
                },
                required: ["communicationStyle", "strengths", "areasForImprovement", "recommendedRoles"],
                additionalProperties: false,
              },
              cultureFit: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    company: { type: "string" },
                    fitScore: { type: "number" },
                    reason: { type: "string" },
                  },
                  required: ["company", "fitScore", "reason"],
                  additionalProperties: false,
                },
              },
            },
            required: ["personality", "cultureFit"],
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
      personality: {
        communicationStyle: "Professional",
        strengths: [],
        areasForImprovement: [],
        recommendedRoles: [],
      },
      cultureFit: [],
    };
  } catch (error) {
    console.error("Failed to analyze personality:", error);
    return {
      personality: {
        communicationStyle: "Professional",
        strengths: [],
        areasForImprovement: [],
        recommendedRoles: [],
      },
      cultureFit: [],
    };
  }
}

/**
 * Generate "Dream Job" prediction based on user profile
 */
export async function predictDreamJob(userProfile: {
  skills: string[];
  experience: string;
  education: string;
  interests: string[];
  salary_expectations: number;
  location_preferences: string[];
}): Promise<{
  dreamJobTitle: string;
  dreamCompany: string;
  requiredSkills: string[];
  estimatedTimeline: string;
  actionPlan: string[];
}> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a career strategist. Based on user profile, predict their ideal dream job and create an action plan to achieve it. Return as JSON.",
        },
        {
          role: "user",
          content: `User Profile:\nSkills: ${userProfile.skills.join(", ")}\nExperience: ${userProfile.experience}\nEducation: ${userProfile.education}\nInterests: ${userProfile.interests.join(", ")}\nSalary Expectations: $${userProfile.salary_expectations}\nLocation Preferences: ${userProfile.location_preferences.join(", ")}\n\nProvide: dreamJobTitle, dreamCompany, requiredSkills (array), estimatedTimeline, actionPlan (array of steps)`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "dream_job_prediction",
          strict: true,
          schema: {
            type: "object",
            properties: {
              dreamJobTitle: { type: "string" },
              dreamCompany: { type: "string" },
              requiredSkills: { type: "array", items: { type: "string" } },
              estimatedTimeline: { type: "string" },
              actionPlan: { type: "array", items: { type: "string" } },
            },
            required: ["dreamJobTitle", "dreamCompany", "requiredSkills", "estimatedTimeline", "actionPlan"],
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
      dreamJobTitle: "Senior Role",
      dreamCompany: "Tech Company",
      requiredSkills: [],
      estimatedTimeline: "12-18 months",
      actionPlan: [],
    };
  } catch (error) {
    console.error("Failed to predict dream job:", error);
    return {
      dreamJobTitle: "Senior Role",
      dreamCompany: "Tech Company",
      requiredSkills: [],
      estimatedTimeline: "12-18 months",
      actionPlan: [],
    };
  }
}
