import { invokeLLM } from "../_core/llm";

/**
 * AI Service - Handles all LLM-based operations for SprintWork
 */

export async function tailorCVForJob(jobDescription: string, jobRequirements: string, resumeContent: any): Promise<string> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an expert resume writer and ATS (Applicant Tracking System) optimization specialist. 
Your task is to tailor a resume to match a specific job posting. 
Focus on:
1. Highlighting relevant skills and experience
2. Using keywords from the job description
3. Quantifying achievements where possible
4. Maintaining ATS compatibility
Return the tailored resume in JSON format with sections: summary, experience, skills, education.`,
      },
      {
        role: "user",
        content: `Job Description:\n${jobDescription}\n\nJob Requirements:\n${jobRequirements}\n\nOriginal Resume:\n${JSON.stringify(resumeContent)}\n\nPlease tailor this resume to maximize match score with the job posting.`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (typeof content === "string") return content;
  return "";
}

export async function generateJobMatches(userProfile: any, userSkills: any[], jobListings: any[]): Promise<any[]> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an expert job matching algorithm. Analyze the user profile and skills against job listings.
For each job, calculate a match score (0-100) based on:
1. Skill alignment
2. Experience level match
3. Location preference
4. Salary expectations
5. Career progression fit

Return a JSON array with: jobId, matchScore, matchReason, skillsMatched, skillsGap`,
      },
      {
        role: "user",
        content: `User Profile: ${JSON.stringify(userProfile)}\nUser Skills: ${JSON.stringify(userSkills)}\nJob Listings: ${JSON.stringify(jobListings)}\n\nAnalyze and match these jobs to the user profile.`,
      },
    ],
  });

  try {
    const content = response.choices[0]?.message?.content;
    const contentStr = typeof content === "string" ? content : "[]";
    return JSON.parse(contentStr);
  } catch {
    return [];
  }
}

export async function generateInterviewQuestion(interviewType: string, difficulty: string, jobDescription?: string): Promise<string> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an expert interview coach. Generate realistic and challenging interview questions.
For ${interviewType} interviews at ${difficulty} level.
Make questions thoughtful, open-ended, and designed to assess both technical and soft skills.`,
      },
      {
        role: "user",
        content: `Generate a ${difficulty} level ${interviewType} interview question${jobDescription ? ` for this job: ${jobDescription}` : ""}.`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (typeof content === "string") return content;
  return "";
}

export async function evaluateInterviewAnswer(question: string, answer: string, interviewType: string): Promise<{ score: number; feedback: string }> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an expert interview evaluator. Assess the candidate's answer to an interview question.
Score from 0-100 based on:
1. Relevance and clarity
2. Depth of knowledge
3. Communication skills
4. Specific examples/evidence
5. Professionalism

Return JSON with: score (0-100), feedback (constructive comments)`,
      },
      {
        role: "user",
        content: `Interview Type: ${interviewType}\nQuestion: ${question}\nCandidate Answer: ${answer}\n\nPlease evaluate this answer.`,
      },
    ],
  });

  try {
    const content = response.choices[0]?.message?.content;
    const contentStr = typeof content === "string" ? content : '{"score": 0, "feedback": ""}';
    return JSON.parse(contentStr);
  } catch {
    return { score: 0, feedback: "Unable to evaluate answer" };
  }
}

export async function generateInterviewFeedback(transcript: any[]): Promise<{ overallScore: number; strengths: string[]; improvements: string[]; recommendations: string[] }> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an expert career coach and interview specialist. Analyze a complete interview transcript.
Provide comprehensive feedback including:
1. Overall performance score (0-100)
2. Key strengths demonstrated
3. Areas for improvement
4. Specific recommendations for better performance

Return JSON with: overallScore, strengths (array), improvements (array), recommendations (array)`,
      },
      {
        role: "user",
        content: `Interview Transcript:\n${JSON.stringify(transcript)}\n\nProvide detailed feedback on this interview performance.`,
      },
    ],
  });

  try {
    const content = response.choices[0]?.message?.content;
    const contentStr = typeof content === "string" ? content : '{"overallScore": 0, "strengths": [], "improvements": [], "recommendations": []}';
    return JSON.parse(contentStr);
  } catch {
    return { overallScore: 0, strengths: [], improvements: [], recommendations: [] };
  }
}

export async function analyzeSkillGaps(userSkills: any[], jobRequirements: string): Promise<{ requiredSkills: string[]; skillGaps: string[]; developmentPlan: string[] }> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a career development expert. Analyze skill gaps between a candidate and job requirements.
Identify:
1. Required skills for the job
2. Skills the candidate is missing
3. Recommended learning path to close gaps

Return JSON with: requiredSkills (array), skillGaps (array), developmentPlan (array of steps)`,
      },
      {
        role: "user",
        content: `User Skills: ${JSON.stringify(userSkills)}\nJob Requirements: ${jobRequirements}\n\nAnalyze the skill gaps and suggest a development plan.`,
      },
    ],
  });

  try {
    const content = response.choices[0]?.message?.content;
    const contentStr = typeof content === "string" ? content : '{"requiredSkills": [], "skillGaps": [], "developmentPlan": []}';
    return JSON.parse(contentStr);
  } catch {
    return { requiredSkills: [], skillGaps: [], developmentPlan: [] };
  }
}

export async function generateCoverLetter(userProfile: any, jobDescription: string, jobRequirements: string): Promise<string> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an expert cover letter writer. Create a compelling, personalized cover letter that:
1. Addresses the specific job posting
2. Highlights relevant experience
3. Shows genuine interest in the company
4. Demonstrates cultural fit
5. Includes a strong call to action

Write in professional, engaging tone.`,
      },
      {
        role: "user",
        content: `User Profile: ${JSON.stringify(userProfile)}\nJob Description: ${jobDescription}\nJob Requirements: ${jobRequirements}\n\nWrite a compelling cover letter for this position.`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (typeof content === "string") return content;
  return "";
}

export async function generateCareerAdvice(userProfile: any, userSkills: any[], careerGoals: string): Promise<string> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a career coach and mentor. Provide personalized career development advice.
Consider the user's current profile, skills, and goals to suggest:
1. Next career steps
2. Skills to develop
3. Networking opportunities
4. Industry trends to watch
5. Long-term career strategy`,
      },
      {
        role: "user",
        content: `User Profile: ${JSON.stringify(userProfile)}\nCurrent Skills: ${JSON.stringify(userSkills)}\nCareer Goals: ${careerGoals}\n\nProvide personalized career development advice.`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (typeof content === "string") return content;
  return "";
}
