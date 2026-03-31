import { invokeLLM } from "../_core/llm";

interface InterviewQuestion {
  id: string;
  type: "behavioral" | "technical" | "case_study" | "general";
  question: string;
  context?: string;
  expectedKeywords?: string[];
  difficulty: "easy" | "medium" | "hard";
}

interface InterviewResponse {
  question_id: string;
  user_response: string;
  audio_transcript?: string;
}

interface InterviewScore {
  overall_score: number; // 0-100
  breakdown: {
    content_score: number; // 40%
    structure_score: number; // 30%
    communication_score: number; // 20%
    confidence_score: number; // 10%
  };
  star_analysis?: {
    has_situation: boolean;
    has_task: boolean;
    has_action: boolean;
    has_result: boolean;
    star_score: number;
  };
  strengths: string[];
  improvements: string[];
  detailed_feedback: string;
}

/**
 * Advanced Mock Interview Service
 * Provides comprehensive interview preparation with STAR method support and detailed scoring
 */
export const advancedInterviewService = {
  /**
   * Generate interview questions based on job role and difficulty
   */
  async generateInterviewQuestions(
    jobTitle: string,
    jobDescription: string,
    interviewType:
      | "behavioral"
      | "technical"
      | "case_study"
      | "mixed" = "mixed",
    difficulty: "easy" | "medium" | "hard" = "medium",
    count: number = 5
  ): Promise<InterviewQuestion[]> {
    const prompt = `Generate ${count} ${difficulty} ${interviewType} interview questions for a ${jobTitle} position.

Job Description: ${jobDescription}

For behavioral questions, focus on the STAR method (Situation, Task, Action, Result).
For technical questions, include relevant technologies and problem-solving scenarios.
For case study questions, include realistic business problems.

Return a JSON array with objects containing:
- id: unique identifier
- type: "behavioral", "technical", "case_study", or "general"
- question: the interview question
- context: optional context for the question
- expectedKeywords: array of keywords expected in a good answer
- difficulty: "easy", "medium", or "hard"

Return ONLY valid JSON, no markdown or explanations.`;

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        maxTokens: 2000,
        responseFormat: { type: "json_object" }, // Request JSON object for questions
      });

      const content = response.choices[0]?.message?.content;
      const text = typeof content === "string" ? content : "[]";
      // Ensure the content is parsed as an array, even if it's a single object
      try {
        const parsed = JSON.parse(text);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (parseError) {
        console.error(
          "Failed to parse LLM response as JSON array:",
          parseError
        );
        return [];
      }
    } catch (error) {
      console.error("Error generating interview questions:", error);
    }

    return [];
  },

  /**
   * Evaluate interview response with comprehensive scoring
   */
  async evaluateInterviewResponse(
    question: InterviewQuestion,
    userResponse: string
  ): Promise<InterviewScore> {
    // Analyze STAR method adherence for behavioral questions
    let starAnalysis = undefined;
    if (question.type === "behavioral") {
      starAnalysis = analyzeSTARMethod(userResponse);
    }

    // Get detailed feedback from LLM
    const feedback = await generateDetailedFeedback(
      question,
      userResponse,
      starAnalysis
    );

    // Calculate individual scores
    const contentScore = calculateContentScore(
      userResponse,
      question,
      starAnalysis
    );
    const structureScore = calculateStructureScore(userResponse, question.type);
    const communicationScore = calculateCommunicationScore(userResponse);
    const confidenceScore = calculateConfidenceScore(userResponse);

    // Calculate overall score (weighted)
    const overallScore = Math.round(
      contentScore * 0.4 +
        structureScore * 0.3 +
        communicationScore * 0.2 +
        confidenceScore * 0.1
    );

    // Extract strengths and improvements
    const { strengths, improvements } = extractFeedbackPoints(feedback);

    return {
      overall_score: Math.min(100, Math.max(0, overallScore)),
      breakdown: {
        content_score: contentScore,
        structure_score: structureScore,
        communication_score: communicationScore,
        confidence_score: confidenceScore,
      },
      star_analysis: starAnalysis,
      strengths,
      improvements,
      detailed_feedback: feedback,
    };
  },

  /**
   * Generate personalized interview tips based on performance
   */
  async generateInterviewTips(
    jobTitle: string,
    weakAreas: string[]
  ): Promise<string[]> {
    const prompt = `Generate 5 specific, actionable interview tips for a ${jobTitle} candidate who needs improvement in: ${weakAreas.join(", ")}

Tips should be:
1. Specific and actionable
2. Relevant to the job role
3. Focused on the weak areas mentioned

Return as a JSON array of strings, with no markdown or explanations.`;

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        maxTokens: 800,
        responseFormat: { type: "json_object" }, // Request JSON object for tips
      });

      const content = response.choices[0]?.message?.content;
      const text = typeof content === "string" ? content : "[]";
      try {
        const parsed = JSON.parse(text);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (parseError) {
        console.error(
          "Failed to parse LLM response as JSON array:",
          parseError
        );
        return [];
      }
    } catch (error) {
      console.error("Error generating interview tips:", error);
    }

    return [];
  },

  /**
   * Calculate interview readiness score (0-100)
   * Based on multiple practice sessions
   */
  calculateReadinessScore(sessionScores: number[]): number {
    if (sessionScores.length === 0) return 0;

    const average =
      sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length;
    const consistency =
      sessionScores.length > 1
        ? 100 - (Math.max(...sessionScores) - Math.min(...sessionScores)) * 2
        : 50;

    return Math.round((average + consistency) / 2);
  },
};

/**
 * Analyze if response follows STAR method
 */
function analyzeSTARMethod(response: string): {
  has_situation: boolean;
  has_task: boolean;
  has_action: boolean;
  has_result: boolean;
  star_score: number;
} {
  const responseLower = response.toLowerCase();

  // Check for STAR components
  const hasSituation =
    /situation|context|background|was working|team|project/i.test(response);
  const hasTask =
    /task|challenge|problem|goal|objective|needed to|required/i.test(response);
  const hasAction =
    /action|did|implemented|created|developed|built|took|decided/i.test(
      response
    );
  const hasResult =
    /result|outcome|achieved|improved|increased|decreased|learned|success/i.test(
      response
    );

  const starComponents = [hasSituation, hasTask, hasAction, hasResult].filter(
    Boolean
  ).length;
  const starScore = (starComponents / 4) * 100;

  return {
    has_situation: hasSituation,
    has_task: hasTask,
    has_action: hasAction,
    has_result: hasResult,
    star_score: Math.round(starScore),
  };
}

/**
 * Calculate content score (0-100)
 * Evaluates relevance, depth, and keyword coverage
 */
function calculateContentScore(
  response: string,
  question: InterviewQuestion,
  starAnalysis?: {
    has_situation: boolean;
    has_task: boolean;
    has_action: boolean;
    has_result: boolean;
    star_score: number;
  }
): number {
  let score = 50; // Base score

  // Check response length (should be 2-5 minutes of speech, ~300-800 words)
  const wordCount = response.split(/\s+/).length;
  if (wordCount >= 300 && wordCount <= 800) {
    score += 15;
  } else if (wordCount >= 200 && wordCount <= 1000) {
    score += 10;
  } else if (wordCount < 100) {
    score -= 10;
  }

  // Check for expected keywords
  if (question.expectedKeywords && question.expectedKeywords.length > 0) {
    const keywordMatches = question.expectedKeywords.filter(keyword =>
      response.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    const keywordScore =
      (keywordMatches / question.expectedKeywords.length) * 20;
    score += keywordScore;
  } else {
    score += 10;
  }

  // For behavioral questions, add STAR score
  if (question.type === "behavioral" && starAnalysis) {
    score += starAnalysis.star_score * 0.15;
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Calculate structure score (0-100)
 * Evaluates organization and clarity
 */
function calculateStructureScore(
  response: string,
  questionType: string
): number {
  let score = 50;

  // Check for clear opening
  const hasOpening = /^(well|so|let me|i'd like to|first)/i.test(response);
  if (hasOpening) score += 10;

  // Check for transitions
  const transitionCount = (
    response.match(/then|next|after that|subsequently/gi) || []
  ).length;
  if (transitionCount >= 2) score += 15;
  else if (transitionCount >= 1) score += 8;

  // Check for clear conclusion
  const hasConclusion =
    /conclusion|summary|learned|takeaway|result|ultimately/i.test(response);
  if (hasConclusion) score += 10;

  // Check for logical flow
  const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length >= 5) score += 10;

  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Calculate communication score (0-100)
 * Evaluates clarity, grammar, and professionalism
 */
function calculateCommunicationScore(response: string): number {
  let score = 60;

  // Check for filler words (negative)
  const fillerWords = (
    response.match(/um|uh|like|you know|basically|actually/gi) || []
  ).length;
  if (fillerWords === 0) score += 15;
  else if (fillerWords <= 3) score += 10;
  else if (fillerWords <= 6) score += 5;
  else score -= 10;

  // Check for professional language
  const professionalTerms = (
    response.match(
      /achieved|implemented|developed|managed|led|collaborated/gi
    ) || []
  ).length;
  if (professionalTerms >= 3) score += 10;
  else if (professionalTerms >= 1) score += 5;

  // Check for sentence variety
  const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgLength = response.length / Math.max(sentences.length, 1);
  if (avgLength >= 15 && avgLength <= 30) score += 10;

  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Calculate confidence score (0-100)
 * Evaluates decisiveness and conviction
 */
function calculateConfidenceScore(response: string): number {
  let score = 60;

  // Check for uncertain language (negative)
  const uncertainPhrases = (
    response.match(/i think|maybe|i guess|sort of|kind of|perhaps/gi) || []
  ).length;
  if (uncertainPhrases === 0) score += 20;
  else if (uncertainPhrases <= 2) score += 10;
  else if (uncertainPhrases <= 4) score += 5;

  // Check for assertive language (positive)
  const assertivePhrases = (
    response.match(/i successfully|i ensured|i determined|i decided/gi) || []
  ).length;
  if (assertivePhrases >= 2) score += 15;
  else if (assertivePhrases >= 1) score += 8;

  // Check for ownership language
  const ownershipPhrases = (
    response.match(/i led|i managed|i owned|i drove/gi) || []
  ).length;
  if (ownershipPhrases >= 2) score += 10;

  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Generate detailed feedback using LLM
 */
async function generateDetailedFeedback(
  question: InterviewQuestion,
  userResponse: string,
  starAnalysis?: {
    has_situation: boolean;
    has_task: boolean;
    has_action: boolean;
    has_result: boolean;
    star_score: number;
  }
): Promise<string> {
  let prompt = `Provide detailed, constructive feedback on this interview response.

Question (${question.type}): ${question.question}

Response: ${userResponse}

Feedback should include:
1. What was done well
2. Areas for improvement
3. Specific suggestions for next time
4. Overall assessment

Keep feedback concise (2-3 paragraphs).`;

  if (question.type === "behavioral" && starAnalysis) {
    prompt += `

STAR Method Analysis:
- Situation: ${starAnalysis.has_situation ? "✓" : "✗"}
- Task: ${starAnalysis.has_task ? "✓" : "✗"}
- Action: ${starAnalysis.has_action ? "✓" : "✗"}
- Result: ${starAnalysis.has_result ? "✓" : "✗"}

Please comment on how well the response follows the STAR method.`;
  }

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      maxTokens: 800,
      responseFormat: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    const text = typeof content === "string" ? content : "{}";
    try {
      const parsed = JSON.parse(text);
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        "feedback" in parsed
      ) {
        return parsed.feedback as string;
      } else if (typeof parsed === "string") {
        return parsed;
      }
    } catch (parseError) {
      console.error("Failed to parse LLM response as JSON:", parseError);
    }
    return "Unable to generate feedback: LLM response not in expected format.";
  } catch (error) {
    console.error("Error generating feedback:", error);
    return "Unable to generate feedback at this time.";
  }
}

/**
 * Extract strengths and improvements from feedback text
 */
function extractFeedbackPoints(feedback: string): {
  strengths: string[];
  improvements: string[];
} {
  const strengths: string[] = [];
  const improvements: string[] = [];

  // Extract strengths
  const strengthsMatch = feedback.match(
    /(?:well|good|strong|excellent|effectively|successfully)[^.!?]*[.!?]/gi
  );
  if (strengthsMatch) {
    strengthsMatch.slice(0, 3).forEach(s => {
      strengths.push(s.replace(/[.!?]$/, "").trim());
    });
  }

  // Extract improvements
  const improvementsMatch = feedback.match(
    /(?:improve|consider|could|should|might|try)[^.!?]*[.!?]/gi
  );
  if (improvementsMatch) {
    improvementsMatch.slice(0, 3).forEach(s => {
      improvements.push(s.replace(/[.!?]$/, "").trim());
    });
  }

  return { strengths, improvements };
}
