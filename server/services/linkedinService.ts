import axios from "axios";
import { invokeLLM } from "../_core/llm";

/**
 * LinkedIn Integration Service
 * Handles OAuth authorization, profile scraping, and data extraction
 */

interface LinkedInProfile {
  firstName: string;
  lastName: string;
  headline: string;
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
  }>;
  skills: string[];
  endorsements: Record<string, number>;
  profileUrl: string;
}

/**
 * Generate LinkedIn OAuth authorization URL
 */
export async function getLinkedInAuthUrl(redirectUri: string): Promise<string> {
  const clientId = process.env.LINKEDIN_CLIENT_ID || "YOUR_CLIENT_ID";
  const scope = "r_liteprofile r_emailaddress";
  const state = Math.random().toString(36).substring(7);

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;

  return authUrl;
}

/**
 * Exchange authorization code for access token
 */
export async function getLinkedInAccessToken(code: string, redirectUri: string): Promise<string> {
  try {
    const clientId = process.env.LINKEDIN_CLIENT_ID || "YOUR_CLIENT_ID";
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET || "YOUR_CLIENT_SECRET";

    const response = await axios.post("https://www.linkedin.com/oauth/v2/accessToken", null, {
      params: {
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error("Failed to get LinkedIn access token:", error);
    throw new Error("LinkedIn authentication failed");
  }
}

/**
 * Fetch LinkedIn profile data using access token
 */
export async function fetchLinkedInProfile(accessToken: string): Promise<LinkedInProfile> {
  try {
    // Fetch basic profile info
    const profileResponse = await axios.get("https://api.linkedin.com/v2/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    // Fetch email
    const emailResponse = await axios.get("https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    // Fetch experience
    const experienceResponse = await axios.get(
      "https://api.linkedin.com/v2/positions?q=member&projection=(elements*(title,company,startDate,endDate,description))",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Fetch education
    const educationResponse = await axios.get(
      "https://api.linkedin.com/v2/educations?q=member&projection=(elements*(schoolName,degree,fieldOfStudy,startDate,endDate))",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Fetch skills
    const skillsResponse = await axios.get("https://api.linkedin.com/v2/skills?q=member", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const profile: LinkedInProfile = {
      firstName: profileResponse.data.localizedFirstName || "",
      lastName: profileResponse.data.localizedLastName || "",
      headline: profileResponse.data.localizedHeadline || "",
      summary: "",
      experience: experienceResponse.data.elements?.map((exp: any) => ({
        title: exp.title || "",
        company: exp.company?.localizedName || "",
        startDate: exp.startDate ? `${exp.startDate.year}-${exp.startDate.month}` : "",
        endDate: exp.endDate ? `${exp.endDate.year}-${exp.endDate.month}` : "",
        description: exp.description || "",
      })) || [],
      education: educationResponse.data.elements?.map((edu: any) => ({
        school: edu.schoolName?.localizedName || "",
        degree: edu.degree?.localizedName || "",
        fieldOfStudy: edu.fieldOfStudy?.localizedName || "",
        startDate: edu.startDate ? `${edu.startDate.year}` : "",
        endDate: edu.endDate ? `${edu.endDate.year}` : "",
      })) || [],
      skills: skillsResponse.data.elements?.map((skill: any) => skill.name?.localizedName || "") || [],
      endorsements: {},
      profileUrl: `https://www.linkedin.com/in/${profileResponse.data.id}`,
    };

    return profile;
  } catch (error) {
    console.error("Failed to fetch LinkedIn profile:", error);
    throw new Error("Failed to fetch LinkedIn profile data");
  }
}

/**
 * Extract and normalize LinkedIn profile data for SprintWork
 */
export async function normalizeLinkedInProfile(profile: LinkedInProfile): Promise<{
  bio: string;
  skills: string[];
  experience: string;
  education: string;
  summary: string;
}> {
  const skillsList = profile.skills.slice(0, 10);

  const experienceText = profile.experience
    .map((exp) => `${exp.title} at ${exp.company} (${exp.startDate} - ${exp.endDate || "Present"})`)
    .join("\n");

  const educationText = profile.education
    .map((edu) => `${edu.degree} in ${edu.fieldOfStudy} from ${edu.school} (${edu.startDate}-${edu.endDate})`)
    .join("\n");

  return {
    bio: profile.headline,
    skills: skillsList,
    experience: experienceText,
    education: educationText,
    summary: profile.summary || profile.headline,
  };
}

/**
 * Generate comprehensive profile summary using LLM
 */
export async function generateProfileSummary(linkedInData: {
  bio: string;
  skills: string[];
  experience: string;
  education: string;
  summary: string;
}): Promise<string> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a professional career coach. Create a compelling professional summary based on the provided LinkedIn data. Make it concise (2-3 sentences) and highlight key strengths.",
        },
        {
          role: "user",
          content: `LinkedIn Profile Data:\nBio: ${linkedInData.bio}\nSkills: ${linkedInData.skills.join(", ")}\nExperience: ${linkedInData.experience}\nEducation: ${linkedInData.education}`,
        },
      ],
    });

    const content = response.choices[0]?.message.content;
    if (typeof content === "string") {
      return content;
    } else if (Array.isArray(content)) {
      return content.map((c: any) => c.text || "").join("") || linkedInData.summary;
    }
    return linkedInData.summary;
  } catch (error) {
    console.error("Failed to generate profile summary:", error);
    return linkedInData.summary;
  }
}

/**
 * Extract skills from LinkedIn and cross-reference with job market
 */
export async function analyzeLinkedInSkills(skills: string[]): Promise<{
  currentSkills: string[];
  trendingSkills: string[];
  skillGaps: string[];
}> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a job market analyst. Analyze the provided skills and identify trending skills in the tech industry, and suggest skill gaps the person should develop.",
        },
        {
          role: "user",
          content: `Current Skills: ${skills.join(", ")}\n\nProvide response in JSON format with keys: trendingSkills (array), skillGaps (array)`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "skill_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              trendingSkills: {
                type: "array",
                items: { type: "string" },
                description: "Trending skills in the industry",
              },
              skillGaps: {
                type: "array",
                items: { type: "string" },
                description: "Skills to develop",
              },
            },
            required: ["trendingSkills", "skillGaps"],
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
      try {
        const parsed = JSON.parse(contentStr);
        return {
          currentSkills: skills,
          trendingSkills: parsed.trendingSkills || [],
          skillGaps: parsed.skillGaps || [],
        };
      } catch (parseError) {
        console.error("Failed to parse skill analysis", parseError);
      }
    }

    return {
      currentSkills: skills,
      trendingSkills: [],
      skillGaps: [],
    };
  } catch (error) {
    console.error("Failed to analyze LinkedIn skills:", error);
    return {
      currentSkills: skills,
      trendingSkills: [],
      skillGaps: [],
    };
  }
}
