import { OpenAI } from "openai";

const client = new OpenAI();

interface CVAnalysisResult {
  atsScore: number;
  keywordMatches: string[];
  missingKeywords: string[];
  suggestions: string[];
  tailoredSections: {
    summary?: string;
    skills?: string[];
    achievements?: string[];
  };
}

interface JobDescription {
  title: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
}

/**
 * Advanced CV Analysis and Tailoring Service
 * Provides comprehensive CV optimization for ATS and recruiter preferences
 */
export const advancedCvService = {
  /**
   * Analyze CV against job description and provide ATS score
   * Algorithm: Keyword extraction + semantic similarity + formatting rules
   */
  async analyzeCVForJob(
    cvContent: string,
    jobDescription: JobDescription
  ): Promise<CVAnalysisResult> {
    // Extract keywords from job description
    const allKeywords = [
      ...jobDescription.requiredSkills,
      ...jobDescription.preferredSkills,
      ...extractKeywordsFromDescription(jobDescription.description),
    ];

    // Find matching keywords in CV
    const cvLower = cvContent.toLowerCase();
    const keywordMatches = allKeywords.filter((keyword) =>
      cvLower.includes(keyword.toLowerCase())
    );

    // Identify missing keywords
    const missingKeywords = allKeywords.filter(
      (keyword) => !cvLower.includes(keyword.toLowerCase())
    );

    // Calculate ATS score (0-100)
    const atsScore = calculateATSScore(
      cvContent,
      keywordMatches,
      allKeywords,
      jobDescription
    );

    // Generate suggestions
    const suggestions = generateATSSuggestions(
      cvContent,
      missingKeywords,
      atsScore
    );

    // Generate tailored sections using LLM
    const tailoredSections = await generateTailoredSections(
      cvContent,
      jobDescription
    );

    return {
      atsScore,
      keywordMatches,
      missingKeywords,
      suggestions,
      tailoredSections,
    };
  },

  /**
   * Generate a tailored CV for a specific job
   * Uses LLM to rewrite sections with job-specific language
   */
  async generateTailoredCV(
    originalCV: string,
    jobDescription: JobDescription
  ): Promise<string> {
    const prompt = `You are an expert career coach. Tailor the following CV to match this job description. 
    
Job Title: ${jobDescription.title}
Job Description: ${jobDescription.description}
Required Skills: ${jobDescription.requiredSkills.join(", ")}

Original CV:
${originalCV}

Please provide a tailored version of the CV that:
1. Incorporates relevant keywords from the job description
2. Reorders bullet points to emphasize most relevant achievements
3. Reframes experiences to align with job requirements
4. Maintains the same structure but enhances impact
5. Uses strong action verbs and quantifiable results

Provide only the tailored CV content, no explanations.`;

    const response = await (client as any).beta.messages.create({
      model: "gpt-4.1-mini",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return (
      response.content[0].type === "text"
        ? response.content[0].text
        : originalCV
    );
  },

  /**
   * Enhance CV bullet points with stronger action verbs and quantification
   */
  async enhanceBulletPoints(bullets: string[]): Promise<string[]> {
    const prompt = `You are an expert resume writer. Enhance these bullet points to be more impactful:

${bullets.map((b, i) => `${i + 1}. ${b}`).join("\n")}

For each bullet point:
1. Use a stronger action verb if possible
2. Add quantifiable metrics or results
3. Emphasize impact and outcomes
4. Keep it concise (under 20 words)

Return only the enhanced bullet points, numbered, with no explanations.`;

    const response = await (client as any).beta.messages.create({
      model: "gpt-4.1-mini",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    return text
      .split("\n")
      .filter((line: string) => line.trim())
      .map((line: string) => line.replace(/^\d+\.\s*/, ""));
  },

  /**
   * Calculate ATS compatibility score (0-100)
   * Considers keyword density, formatting, structure, and content
   */
  calculateATSScore(
    cvContent: string,
    jobDescription: JobDescription
  ): number {
    const keywordMatches = jobDescription.requiredSkills.filter((skill) =>
      cvContent.toLowerCase().includes(skill.toLowerCase())
    );

    const keywordScore =
      (keywordMatches.length / jobDescription.requiredSkills.length) * 40;

    // Check for formatting issues
    let formatScore = 30;
    if (cvContent.includes("\t")) formatScore -= 5; // Tabs can cause issues
    if (cvContent.includes("•") || cvContent.includes("-")) formatScore += 5; // Good bullet formatting
    if (cvContent.length > 5000) formatScore -= 5; // Too long

    // Check for structure
    let structureScore = 30;
    const hasContactInfo =
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(cvContent);
    const hasPhoneNumber = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(cvContent);
    const hasExperienceSection =
      /experience|employment|work history/i.test(cvContent);
    const hasSkillsSection = /skills|competencies/i.test(cvContent);

    if (hasContactInfo) structureScore += 5;
    if (hasPhoneNumber) structureScore += 5;
    if (hasExperienceSection) structureScore += 10;
    if (hasSkillsSection) structureScore += 10;

    return Math.min(100, Math.round(keywordScore + formatScore + structureScore));
  },
};

/**
 * Helper function: Extract keywords from job description
 */
function extractKeywordsFromDescription(description: string): string[] {
  const words = description
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 4);

  // Remove common stop words
  const stopWords = new Set([
    "about",
    "would",
    "should",
    "could",
    "their",
    "which",
    "these",
    "those",
    "where",
    "when",
    "what",
    "with",
    "from",
    "that",
    "this",
    "have",
    "will",
    "your",
    "must",
    "will",
    "able",
    "also",
  ]);

  return words.filter(
    (word) => !stopWords.has(word) && word.length > 4
  );
}

/**
 * Helper function: Calculate ATS score
 */
function calculateATSScore(
  cvContent: string,
  keywordMatches: string[],
  allKeywords: string[],
  jobDescription: JobDescription
): number {
  const cvLower = cvContent.toLowerCase();

  // Keyword matching score (40%)
  const keywordScore =
    (keywordMatches.length / Math.max(allKeywords.length, 1)) * 40;

  // Format score (30%)
  let formatScore = 30;
  if (cvContent.includes("\t")) formatScore -= 5;
  if (cvContent.includes("•") || cvContent.includes("-")) formatScore += 5;
  if (cvContent.length > 5000) formatScore -= 5;

  // Structure score (30%)
  let structureScore = 0;
  if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(cvContent))
    structureScore += 5;
  if (/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(cvContent)) structureScore += 5;
  if (/experience|employment|work history/i.test(cvContent))
    structureScore += 10;
  if (/skills|competencies/i.test(cvContent)) structureScore += 10;

  return Math.min(100, Math.round(keywordScore + formatScore + structureScore));
}

/**
 * Helper function: Generate ATS improvement suggestions
 */
function generateATSSuggestions(
  cvContent: string,
  missingKeywords: string[],
  atsScore: number
): string[] {
  const suggestions: string[] = [];

  if (atsScore < 70) {
    suggestions.push(
      "Your CV has a low ATS score. Consider incorporating more job-specific keywords."
    );
  }

  if (missingKeywords.length > 0) {
    suggestions.push(
      `Add these missing keywords if relevant to your experience: ${missingKeywords.slice(0, 5).join(", ")}`
    );
  }

  if (!cvContent.includes("•") && !cvContent.includes("-")) {
    suggestions.push("Use bullet points for better readability and ATS parsing.");
  }

  if (!/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(cvContent)) {
    suggestions.push("Include your email address at the top of your CV.");
  }

  if (cvContent.length > 5000) {
    suggestions.push(
      "Your CV is quite long. Consider condensing to 1-2 pages for better ATS compatibility."
    );
  }

  return suggestions;
}

/**
 * Helper function: Generate tailored sections using LLM
 */
async function generateTailoredSections(
  cvContent: string,
  jobDescription: JobDescription
): Promise<{ summary?: string; skills?: string[]; achievements?: string[] }> {
  const prompt = `Based on this CV and job description, provide:
1. A professional summary (2-3 sentences) tailored to the job
2. Top 5 relevant skills
3. Top 3 relevant achievements

CV:
${cvContent}

Job Title: ${jobDescription.title}
Job Description: ${jobDescription.description}

Format your response as JSON with keys: summary, skills (array), achievements (array)`;

  try {
    const response = await (client as any).beta.messages.create({
      model: "gpt-4.1-mini",
      max_tokens: 800,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error("Error generating tailored sections:", error);
  }

  return {};
}
