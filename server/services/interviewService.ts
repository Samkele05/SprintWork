import { invokeLLM } from "../_core/llm";

/**
 * Interview Service - Handles mock interview logic, question generation, and scoring
 * Based on research-backed curriculum: STAR method for behavioral, DSA for technical, case studies for analytical
 */

export interface InterviewQuestion {
  id: string;
  type: "behavioral" | "technical" | "case_study" | "general";
  difficulty: "easy" | "medium" | "hard";
  question: string;
  expectedKeywords?: string[];
  scoringGuidance?: string;
}

export interface InterviewAnswer {
  questionId: string;
  question: string;
  answer: string;
  interviewType: string;
  timestamp: number;
}

export interface InterviewScore {
  score: number; // 0-100
  contentScore: number; // 40%
  structureScore: number; // 30%
  communicationScore: number; // 20%
  confidenceScore: number; // 10%
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface InterviewSession {
  id: string;
  type: "behavioral" | "technical" | "case_study" | "general";
  difficulty: "easy" | "medium" | "hard";
  startTime: number;
  endTime?: number;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  scores: InterviewScore[];
  overallScore?: number;
}

/**
 * Behavioral Interview Curriculum - STAR Method
 * Topics: Conflict Resolution, Leadership, Adaptability, Teamwork
 */
const BEHAVIORAL_TOPICS = [
  "conflict_resolution",
  "leadership",
  "adaptability",
  "teamwork",
  "time_management",
  "customer_service",
  "failure_recovery",
];

/**
 * Technical Interview Curriculum - DSA & System Design
 * Topics: Data Structures, Algorithms, System Design
 */
const TECHNICAL_TOPICS = [
  "arrays_and_strings",
  "linked_lists",
  "trees_and_graphs",
  "sorting_and_searching",
  "dynamic_programming",
  "system_design",
  "database_design",
];

/**
 * Case Study Interview Curriculum
 * Topics: Market Entry, Profitability, Product Design
 */
const CASE_STUDY_TOPICS = [
  "market_entry",
  "profitability",
  "product_design",
  "user_acquisition",
  "business_strategy",
];

/**
 * Generate a behavioral interview question using STAR method
 */
export async function generateBehavioralQuestion(
  difficulty: "easy" | "medium" | "hard",
  topic?: string
): Promise<InterviewQuestion> {
  const selectedTopic = topic || BEHAVIORAL_TOPICS[Math.floor(Math.random() * BEHAVIORAL_TOPICS.length)];

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an expert behavioral interview coach. Generate a ${difficulty} level behavioral interview question focused on the STAR method (Situation, Task, Action, Result).
        
The question should:
1. Be open-ended and require a specific example
2. Assess soft skills like leadership, teamwork, conflict resolution, or adaptability
3. Be answerable using the STAR framework
4. Be realistic and relevant to professional environments

Topic: ${selectedTopic}

Return a JSON object with:
- question: The interview question (string)
- expectedKeywords: Array of keywords/concepts the answer should include
- scoringGuidance: Brief guidance on what makes a good answer`,
      },
      {
        role: "user",
        content: `Generate a ${difficulty} level behavioral interview question about ${selectedTopic}.`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "behavioral_question",
        strict: true,
        schema: {
          type: "object",
          properties: {
            question: { type: "string" },
            expectedKeywords: {
              type: "array",
              items: { type: "string" },
            },
            scoringGuidance: { type: "string" },
          },
          required: ["question", "expectedKeywords", "scoringGuidance"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = response.choices[0]?.message?.content;
    const contentStr = typeof content === "string" ? content : "{}";
    const parsed = JSON.parse(contentStr);

    return {
      id: `behavioral_${Date.now()}`,
      type: "behavioral",
      difficulty,
      question: parsed.question || "Tell me about a time you had to work with a difficult team member.",
      expectedKeywords: parsed.expectedKeywords || ["situation", "task", "action", "result"],
      scoringGuidance: parsed.scoringGuidance || "Look for clear STAR method usage.",
    };
  } catch (error) {
    console.error("Failed to generate behavioral question:", error);
    return {
      id: `behavioral_${Date.now()}`,
      type: "behavioral",
      difficulty,
      question: "Tell me about a time you had to overcome a significant challenge at work.",
      expectedKeywords: ["situation", "task", "action", "result", "outcome"],
      scoringGuidance: "Evaluate clarity of STAR method usage and relevance of example.",
    };
  }
}

/**
 * Generate a technical interview question
 */
export async function generateTechnicalQuestion(
  difficulty: "easy" | "medium" | "hard",
  topic?: string
): Promise<InterviewQuestion> {
  const selectedTopic = topic || TECHNICAL_TOPICS[Math.floor(Math.random() * TECHNICAL_TOPICS.length)];

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an expert technical interview coach. Generate a ${difficulty} level technical interview question focused on ${selectedTopic}.

The question should:
1. Be clear and specific
2. Assess problem-solving and coding ability
3. Allow for discussion of time/space complexity
4. Be realistic for the difficulty level

Return a JSON object with:
- question: The interview question (string)
- expectedKeywords: Array of keywords/concepts the answer should include (e.g., "binary search", "O(n log n)")
- scoringGuidance: Brief guidance on what makes a good answer`,
      },
      {
        role: "user",
        content: `Generate a ${difficulty} level technical interview question about ${selectedTopic}.`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "technical_question",
        strict: true,
        schema: {
          type: "object",
          properties: {
            question: { type: "string" },
            expectedKeywords: {
              type: "array",
              items: { type: "string" },
            },
            scoringGuidance: { type: "string" },
          },
          required: ["question", "expectedKeywords", "scoringGuidance"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = response.choices[0]?.message?.content;
    const contentStr = typeof content === "string" ? content : "{}";
    const parsed = JSON.parse(contentStr);

    return {
      id: `technical_${Date.now()}`,
      type: "technical",
      difficulty,
      question: parsed.question || "Implement a function to reverse a linked list.",
      expectedKeywords: parsed.expectedKeywords || ["linked list", "pointer", "iteration", "O(n)"],
      scoringGuidance: parsed.scoringGuidance || "Evaluate correctness, efficiency, and explanation.",
    };
  } catch (error) {
    console.error("Failed to generate technical question:", error);
    return {
      id: `technical_${Date.now()}`,
      type: "technical",
      difficulty,
      question: "How would you design a cache system with LRU eviction?",
      expectedKeywords: ["cache", "LRU", "hash map", "doubly linked list", "O(1)"],
      scoringGuidance: "Evaluate system design thinking and algorithmic knowledge.",
    };
  }
}

/**
 * Generate a case study interview question
 */
export async function generateCaseStudyQuestion(
  difficulty: "easy" | "medium" | "hard",
  topic?: string
): Promise<InterviewQuestion> {
  const selectedTopic = topic || CASE_STUDY_TOPICS[Math.floor(Math.random() * CASE_STUDY_TOPICS.length)];

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an expert case study interview coach. Generate a ${difficulty} level case study question focused on ${selectedTopic}.

The question should:
1. Present a realistic business scenario
2. Require analytical thinking and problem-solving
3. Allow for multiple valid approaches
4. Be appropriate for the difficulty level

Return a JSON object with:
- question: The case study question (string)
- expectedKeywords: Array of keywords/concepts the answer should include
- scoringGuidance: Brief guidance on what makes a good answer`,
      },
      {
        role: "user",
        content: `Generate a ${difficulty} level case study question about ${selectedTopic}.`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "case_study_question",
        strict: true,
        schema: {
          type: "object",
          properties: {
            question: { type: "string" },
            expectedKeywords: {
              type: "array",
              items: { type: "string" },
            },
            scoringGuidance: { type: "string" },
          },
          required: ["question", "expectedKeywords", "scoringGuidance"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = response.choices[0]?.message?.content;
    const contentStr = typeof content === "string" ? content : "{}";
    const parsed = JSON.parse(contentStr);

    return {
      id: `case_study_${Date.now()}`,
      type: "case_study",
      difficulty,
      question: parsed.question || "How would you increase revenue for a struggling e-commerce platform?",
      expectedKeywords: parsed.expectedKeywords || ["revenue", "cost", "strategy", "market", "data"],
      scoringGuidance: parsed.scoringGuidance || "Evaluate analytical thinking and business acumen.",
    };
  } catch (error) {
    console.error("Failed to generate case study question:", error);
    return {
      id: `case_study_${Date.now()}`,
      type: "case_study",
      difficulty,
      question: "How would you estimate the market size for a new product?",
      expectedKeywords: ["market size", "TAM", "SAM", "SOM", "bottom-up", "top-down"],
      scoringGuidance: "Evaluate estimation techniques and business logic.",
    };
  }
}

/**
 * Score an interview answer using the defined rubric
 * Rubric: Content (40%), Structure (30%), Communication (20%), Confidence (10%)
 */
export async function scoreInterviewAnswer(
  question: InterviewQuestion,
  answer: string,
  interviewType: string
): Promise<InterviewScore> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an expert interview evaluator. Evaluate a candidate's answer to an interview question using the following rubric:

**Scoring Rubric (Total: 100 points)**
- **Content (40 points)**: Accuracy, relevance, depth, and completeness of the answer.
- **Structure (30 points)**: For behavioral: Use of STAR method (Situation, Task, Action, Result). For technical: Logical approach and problem-solving flow. For case study: Clear analysis and reasoning.
- **Communication (20 points)**: Clarity of explanation, professional tone, and articulation.
- **Confidence (10 points)**: Perceived confidence, decisiveness, and comfort with the topic.

Return a JSON object with:
- contentScore: 0-40
- structureScore: 0-30
- communicationScore: 0-20
- confidenceScore: 0-10
- feedback: Overall feedback (string)
- strengths: Array of strengths demonstrated
- improvements: Array of areas for improvement`,
      },
      {
        role: "user",
        content: `Question Type: ${interviewType}
Question: ${question.question}
Candidate Answer: ${answer}

Expected Keywords/Concepts: ${question.expectedKeywords?.join(", ") || "N/A"}
Scoring Guidance: ${question.scoringGuidance || "N/A"}

Evaluate this answer using the rubric above.`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "interview_score",
        strict: true,
        schema: {
          type: "object",
          properties: {
            contentScore: { type: "number" },
            structureScore: { type: "number" },
            communicationScore: { type: "number" },
            confidenceScore: { type: "number" },
            feedback: { type: "string" },
            strengths: {
              type: "array",
              items: { type: "string" },
            },
            improvements: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: [
            "contentScore",
            "structureScore",
            "communicationScore",
            "confidenceScore",
            "feedback",
            "strengths",
            "improvements",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = response.choices[0]?.message?.content;
    const contentStr = typeof content === "string" ? content : "{}";
    const parsed = JSON.parse(contentStr);

    const totalScore =
      (parsed.contentScore || 0) +
      (parsed.structureScore || 0) +
      (parsed.communicationScore || 0) +
      (parsed.confidenceScore || 0);

    return {
      score: Math.round(totalScore),
      contentScore: parsed.contentScore || 0,
      structureScore: parsed.structureScore || 0,
      communicationScore: parsed.communicationScore || 0,
      confidenceScore: parsed.confidenceScore || 0,
      feedback: parsed.feedback || "Good answer.",
      strengths: parsed.strengths || [],
      improvements: parsed.improvements || [],
    };
  } catch (error) {
    console.error("Failed to score interview answer:", error);
    return {
      score: 0,
      contentScore: 0,
      structureScore: 0,
      communicationScore: 0,
      confidenceScore: 0,
      feedback: "Unable to evaluate answer due to processing error.",
      strengths: [],
      improvements: [],
    };
  }
}

/**
 * Generate comprehensive interview feedback for a complete session
 */
export async function generateSessionFeedback(session: InterviewSession): Promise<{
  overallScore: number;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  nextSteps: string[];
}> {
  const averageScore = session.scores.length > 0 ? Math.round(session.scores.reduce((sum, s) => sum + s.score, 0) / session.scores.length) : 0;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an expert career coach and interview specialist. Analyze a complete interview session and provide comprehensive feedback.

Return a JSON object with:
- strengths: Array of key strengths demonstrated across the interview
- improvements: Array of areas for improvement
- recommendations: Array of specific recommendations for better performance
- nextSteps: Array of next steps for interview preparation`,
      },
      {
        role: "user",
        content: `Interview Session Summary:
Type: ${session.type}
Difficulty: ${session.difficulty}
Number of Questions: ${session.questions.length}
Average Score: ${averageScore}/100

Question Scores:
${session.scores.map((s, i) => `Q${i + 1}: ${s.score}/100 - ${s.feedback}`).join("\n")}

Provide comprehensive feedback on this interview performance.`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "session_feedback",
        strict: true,
        schema: {
          type: "object",
          properties: {
            strengths: {
              type: "array",
              items: { type: "string" },
            },
            improvements: {
              type: "array",
              items: { type: "string" },
            },
            recommendations: {
              type: "array",
              items: { type: "string" },
            },
            nextSteps: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["strengths", "improvements", "recommendations", "nextSteps"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = response.choices[0]?.message?.content;
    const contentStr = typeof content === "string" ? content : "{}";
    const parsed = JSON.parse(contentStr);

    return {
      overallScore: averageScore,
      strengths: parsed.strengths || [],
      improvements: parsed.improvements || [],
      recommendations: parsed.recommendations || [],
      nextSteps: parsed.nextSteps || [],
    };
  } catch (error) {
    console.error("Failed to generate session feedback:", error);
    return {
      overallScore: averageScore,
      strengths: [],
      improvements: [],
      recommendations: [],
      nextSteps: ["Continue practicing with mock interviews"],
    };
  }
}
