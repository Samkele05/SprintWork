import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "./_core/trpc";

/**
 * Role-based authorization procedures
 */

export const jobSeekerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== "user") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This action is only available for job seekers",
    });
  }
  return next({ ctx });
});

export const recruiterProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This action is only available for recruiters",
    });
  }
  return next({ ctx });
});

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return next({ ctx });
});
