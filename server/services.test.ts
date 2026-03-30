import { describe, it, expect } from "vitest";
import {
  calculateSkillMatchScore,
  calculateLocationMatchScore,
  calculateSalaryMatchScore,
  calculateExperienceMatchScore,
  extractSkillsFromJobDescription,
  matchJobToProfile,
} from "./services/mlService";
import { tailorCVForJob, generateJobMatches, generateInterviewQuestion, evaluateInterviewAnswer } from "./services/aiService";

describe("ML Service", () => {
  describe("calculateSkillMatchScore", () => {
    it("should match exact skills", () => {
      const userSkills = ["React", "Node.js", "TypeScript"];
      const jobSkills = ["React", "Node.js"];
      const result = calculateSkillMatchScore(userSkills, jobSkills);

      expect(result.matchScore).toBe(100);
      expect(result.matched).toContain("React");
      expect(result.matched).toContain("Node.js");
    });

    it("should identify skill gaps", () => {
      const userSkills = ["React"];
      const jobSkills = ["React", "Node.js", "Python"];
      const result = calculateSkillMatchScore(userSkills, jobSkills);

      expect(result.gap).toContain("Node.js");
      expect(result.gap).toContain("Python");
      expect(result.matchScore).toBeLessThan(100);
    });

    it("should handle empty skills", () => {
      const result = calculateSkillMatchScore([], []);
      expect(result.matchScore).toBe(0);
    });
  });

  describe("calculateLocationMatchScore", () => {
    it("should give 100 for exact location match", () => {
      const score = calculateLocationMatchScore(["San Francisco, CA"], "San Francisco, CA");
      expect(score).toBe(100);
    });

    it("should give high score for remote jobs", () => {
      const score = calculateLocationMatchScore(["New York, NY"], "Remote");
      expect(score).toBe(90);
    });

    it("should give partial score for same state", () => {
      const score = calculateLocationMatchScore(["Los Angeles, CA"], "San Francisco, CA");
      expect(score).toBe(70);
    });
  });

  describe("calculateSalaryMatchScore", () => {
    it("should give 100 for salary within range", () => {
      const score = calculateSalaryMatchScore(125000, "$100,000 - $150,000");
      expect(score).toBe(100);
    });

    it("should give partial score for salary below range", () => {
      const score = calculateSalaryMatchScore(80000, "$100,000 - $150,000");
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(100);
    });

    it("should handle null values", () => {
      const score = calculateSalaryMatchScore(null, "$100,000 - $150,000");
      expect(score).toBe(50);
    });
  });

  describe("calculateExperienceMatchScore", () => {
    it("should give 100 for sufficient experience", () => {
      const score = calculateExperienceMatchScore(5, "5+ years of experience");
      expect(score).toBe(100);
    });

    it("should give partial score for less experience", () => {
      const score = calculateExperienceMatchScore(3, "5+ years of experience");
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(100);
    });
  });

  describe("extractSkillsFromJobDescription", () => {
    it("should extract common skills", () => {
      const description = "We need a React developer with Node.js and TypeScript experience";
      const skills = extractSkillsFromJobDescription(description, "");

      expect(skills).toContain("React");
      expect(skills).toContain("Node.js");
      expect(skills).toContain("TypeScript");
    });

    it("should be case-insensitive", () => {
      const description = "python and java skills required";
      const skills = extractSkillsFromJobDescription(description, "");

      expect(skills).toContain("Python");
      expect(skills).toContain("Java");
    });
  });

  describe("matchJobToProfile", () => {
    it("should calculate overall match score", () => {
      const userProfile = {
        desiredLocations: ["San Francisco, CA"],
        yearsExperience: 5,
        salaryExpectation: 150000,
      };
      const userSkills = ["React", "Node.js", "TypeScript"];
      const job = {
        id: 1,
        title: "Senior Developer",
        description: "Looking for React and Node.js developer",
        requirements: "5+ years experience, React, Node.js, TypeScript",
        location: "San Francisco, CA",
        salary: "$140,000 - $180,000",
      };

      const result = matchJobToProfile(userProfile, userSkills, job);

      expect(result.matchScore).toBeGreaterThan(0);
      expect(result.matchScore).toBeLessThanOrEqual(100);
      expect(result.skillsMatched.length).toBeGreaterThan(0);
    });
  });
});

describe("AI Service", () => {
  describe("tailorCVForJob", () => {
    it("should return a string response", async () => {
      const jobDescription = "Looking for a senior developer";
      const jobRequirements = "React, Node.js, 5+ years";
      const resumeContent = { summary: "Experienced developer", skills: ["React", "Node.js"] };

      const result = await tailorCVForJob(jobDescription, jobRequirements, resumeContent);

      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    }, { timeout: 15000 });
  });

  describe("generateInterviewQuestion", () => {
    it("should generate a question for behavioral interviews", async () => {
      const question = await generateInterviewQuestion("behavioral", "medium");

      expect(typeof question).toBe("string");
      expect(question.length).toBeGreaterThan(0);
    }, { timeout: 15000 });

    it("should generate a question for technical interviews", async () => {
      const question = await generateInterviewQuestion("technical", "hard");

      expect(typeof question).toBe("string");
      expect(question.length).toBeGreaterThan(0);
    }, { timeout: 20000 });
  });

  describe("evaluateInterviewAnswer", () => {
    it("should return score and feedback", async () => {
      const result = await evaluateInterviewAnswer("Tell me about yourself", "I am a software engineer with 5 years of experience", "behavioral");

      expect(result).toHaveProperty("score");
      expect(result).toHaveProperty("feedback");
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(typeof result.feedback).toBe("string");
    });
  });
});
