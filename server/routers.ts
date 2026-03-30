import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // User Profile Management
  profile: router({
    getMe: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      return user;
    }),

    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().optional(),
          bio: z.string().optional(),
          location: z.string().optional(),
          profilePictureUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Update user profile - would need to add update function to db.ts
        return { success: true };
      }),

    switchUserType: protectedProcedure
      .input(z.enum(["job_seeker", "recruiter"]))
      .mutation(async ({ ctx, input }) => {
        // Switch between job seeker and recruiter
        return { success: true };
      }),
  }),

  // Job Seeker Profile
  jobSeekerProfile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await db.getJobSeekerProfile(ctx.user.id);
    }),

    update: protectedProcedure
      .input(
        z.object({
          headline: z.string().optional(),
          currentRole: z.string().optional(),
          yearsExperience: z.number().optional(),
          desiredRoles: z.array(z.string()).optional(),
          desiredLocations: z.array(z.string()).optional(),
          salaryExpectation: z.number().optional(),
          workPreference: z.enum(["remote", "hybrid", "onsite"]).optional(),
          availability: z.string().optional(),
          openToOpportunities: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await db.upsertJobSeekerProfile({
          userId: ctx.user.id,
          ...input,
        });
      }),
  }),

  // Recruiter Profile
  recruiterProfile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await db.getRecruiterProfile(ctx.user.id);
    }),

    update: protectedProcedure
      .input(
        z.object({
          companyName: z.string(),
          companyWebsite: z.string().optional(),
          industry: z.string().optional(),
          companySize: z.string().optional(),
          jobTitle: z.string().optional(),
          department: z.string().optional(),
          companyLogoUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await db.upsertRecruiterProfile({
          userId: ctx.user.id,
          ...input,
        });
      }),
  }),

  // Skills Management
  skills: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserSkills(ctx.user.id);
    }),

    add: protectedProcedure
      .input(
        z.object({
          skillName: z.string(),
          proficiencyLevel: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
          yearsOfExperience: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await db.addSkill({
          userId: ctx.user.id,
          ...input,
        });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await db.deleteSkill(input.id, ctx.user.id);
      }),
  }),

  // External Profiles
  externalProfiles: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserExternalProfiles(ctx.user.id);
    }),

    add: protectedProcedure
      .input(
        z.object({
          platform: z.enum(["github", "linkedin", "portfolio", "personal_website"]),
          profileUrl: z.string().url(),
          username: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await db.addExternalProfile({
          userId: ctx.user.id,
          ...input,
        });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await db.deleteExternalProfile(input.id, ctx.user.id);
      }),
  }),

  // Resumes
  resumes: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserResumes(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          content: z.any(), // JSON structure
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await db.createResume({
          userId: ctx.user.id,
          ...input,
        });
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getResumeById(input.id);
      }),
  }),

  // AI CV Tailoring
  cvTailoring: router({
    tailorForJob: protectedProcedure
      .input(
        z.object({
          jobId: z.number(),
          resumeId: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Get job and resume details
        const job = await db.getJobById(input.jobId);
        const resume = await db.getResumeById(input.resumeId);

        if (!job || !resume) {
          throw new Error("Job or resume not found");
        }

        // Use LLM to tailor resume
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are an expert resume writer. Tailor the provided resume to match the job description. Optimize for ATS (Applicant Tracking System) and highlight relevant skills and experience. Return the tailored resume in JSON format.",
            },
            {
              role: "user",
              content: `Job Description:\n${job.description}\n\nJob Requirements:\n${job.requirements}\n\nOriginal Resume:\n${JSON.stringify(resume.content)}\n\nPlease tailor this resume to match the job posting.`,
            },
          ],
        });

        const tailoredContent = response.choices[0]?.message?.content || "";

        // Calculate match score (0-100)
        const matchScore = Math.min(100, Math.random() * 100); // Placeholder

        // Save tailored resume
        await db.createTailoredResume({
          userId: ctx.user.id,
          baseResumeId: input.resumeId,
          jobId: input.jobId,
          tailoredContent,
          matchScore,
        });

        return { success: true, matchScore };
      }),

    getTailored: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getTailoredResumeForJob(ctx.user.id, input.jobId);
      }),
  }),

  // Job Search
  jobs: router({
    search: publicProcedure
      .input(
        z.object({
          title: z.string().optional(),
          company: z.string().optional(),
          location: z.string().optional(),
          jobType: z.string().optional(),
          limit: z.number().default(20),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        return await db.searchJobs(input, input.limit, input.offset);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getJobById(input.id);
      }),
  }),

  // Applications
  applications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserApplications(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          jobId: z.number(),
          resumeId: z.number().optional(),
          tailoredResumeId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await db.createApplication({
          userId: ctx.user.id,
          ...input,
          status: "submitted",
        });
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          applicationId: z.number(),
          status: z.enum([
            "draft",
            "submitted",
            "viewed",
            "shortlisted",
            "interview_scheduled",
            "rejected",
            "offer_received",
            "accepted",
            "withdrawn",
          ]),
        })
      )
      .mutation(async ({ input }) => {
        return await db.updateApplicationStatus(input.applicationId, input.status);
      }),
  }),

  // Job Recommendations
  recommendations: router({
    getMatches: protectedProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ ctx, input }) => {
        return await db.getUserJobMatches(ctx.user.id, input.limit);
      }),

    generateMatches: protectedProcedure.mutation(async ({ ctx }) => {
      // ML algorithm to generate job matches
      // This would integrate with a real ML model
      return { success: true, matchesGenerated: 0 };
    }),

    dismissMatch: protectedProcedure
      .input(z.object({ matchId: z.number() }))
      .mutation(async ({ input }) => {
        return { success: true };
      }),
  }),

  // Mock Interviews
  mockInterviews: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserMockInterviews(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          jobId: z.number().optional(),
          interviewType: z.enum(["behavioral", "technical", "case_study", "general"]),
          difficulty: z.enum(["easy", "medium", "hard"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await db.createMockInterview({
          userId: ctx.user.id,
          ...input,
          status: "scheduled",
        });
      }),

    startInterview: protectedProcedure
      .input(z.object({ interviewId: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateMockInterview(input.interviewId, {
          status: "in_progress",
          startedAt: new Date(),
        });
        return { success: true };
      }),

    submitAnswer: protectedProcedure
      .input(
        z.object({
          interviewId: z.number(),
          question: z.string(),
          answer: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        // Store answer and generate AI feedback
        return { success: true, feedback: "Good answer!" };
      }),

    completeInterview: protectedProcedure
      .input(
        z.object({
          interviewId: z.number(),
          transcript: z.any(),
        })
      )
      .mutation(async ({ input }) => {
        // Use LLM to generate feedback and score
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are an expert interview coach. Analyze the interview transcript and provide constructive feedback, a score (0-100), and recommendations for improvement.",
            },
            {
              role: "user",
              content: `Interview Transcript:\n${JSON.stringify(input.transcript)}`,
            },
          ],
        });

        const feedback = response.choices[0]?.message?.content || "";

        await db.updateMockInterview(input.interviewId, {
          status: "completed",
          completedAt: new Date(),
          feedback,
          transcript: JSON.stringify(input.transcript),
          score: 75, // Placeholder
        });

        return { success: true, feedback };
      }),
  }),

  // Saved Searches
  savedSearches: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserSavedSearches(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          filters: z.any(),
          alertEnabled: z.boolean().optional(),
          alertFrequency: z.enum(["daily", "weekly", "immediate"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await db.createSavedSearch({
          userId: ctx.user.id,
          ...input,
        });
      }),
  }),

  // Networking
  connections: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserConnections(ctx.user.id);
    }),

    sendRequest: protectedProcedure
      .input(
        z.object({
          recipientId: z.number(),
          message: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await db.createConnection({
          userId1: ctx.user.id,
          userId2: input.recipientId,
          initiatedBy: ctx.user.id,
          message: input.message,
          status: "pending",
        });
      }),
  }),

  // Messaging
  messages: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserMessages(ctx.user.id);
    }),

    send: protectedProcedure
      .input(
        z.object({
          recipientId: z.number(),
          content: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await db.createMessage({
          senderId: ctx.user.id,
          recipientId: input.recipientId,
          content: input.content,
        });
      }),
  }),

  // Courses & Skill Development
  courses: router({
    list: publicProcedure.query(async () => {
      return await db.getAllCourses();
    }),

    getProgress: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserCourseProgress(ctx.user.id);
    }),

    enroll: protectedProcedure
      .input(z.object({ courseId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await db.enrollInCourse({
          userId: ctx.user.id,
          courseId: input.courseId,
          status: "enrolled",
        });
      }),
  }),

  // Recruiter: Posted Jobs
  recruiterJobs: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getRecruiterPostedJobs(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string(),
          requirements: z.string().optional(),
          salary: z.string().optional(),
          jobType: z.enum(["full_time", "part_time", "contract"]),
          location: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await db.createPostedJob({
          recruiterId: ctx.user.id,
          ...input,
          status: "draft",
        });
      }),
  }),
});

export type AppRouter = typeof appRouter;
