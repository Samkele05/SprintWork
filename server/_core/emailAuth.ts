import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";

/**
 * Generate a unique openId for email-registered users.
 * Uses a deterministic prefix + random suffix so it never collides with
 * Manus OAuth openIds (which are UUIDs from the platform).
 */
function generateLocalOpenId(email: string): string {
  const sanitized = email.replace(/[^a-z0-9]/gi, "").toLowerCase().slice(0, 20);
  const rand = Math.random().toString(36).slice(2, 10);
  return `local_${sanitized}_${rand}`;
}

export function registerEmailAuthRoutes(app: Express) {
  /**
   * POST /api/auth/signup
   * Body: { email, password, name? }
   */
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    const { email, password, name } = req.body as {
      email?: string;
      password?: string;
      name?: string;
    };

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }

    const emailLower = email.trim().toLowerCase();

    try {
      const db = await getDb();
      if (!db) {
        res.status(503).json({ error: "Database unavailable" });
        return;
      }

      // Check if email already exists
      const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, emailLower))
        .limit(1);

      if (existing.length > 0) {
        res.status(409).json({ error: "An account with this email already exists. Please sign in." });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const openId = generateLocalOpenId(emailLower);

      await db.insert(users).values({
        openId,
        email: emailLower,
        name: name?.trim() || null,
        loginMethod: "email",
        userType: "job_seeker", // default; changed during onboarding
        passwordHash,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(openId, {
        name: name?.trim() || emailLower,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({ success: true, message: "Account created successfully" });
    } catch (error) {
      console.error("[EmailAuth] Signup failed:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  /**
   * POST /api/auth/login
   * Body: { email, password }
   */
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const emailLower = email.trim().toLowerCase();

    try {
      const db = await getDb();
      if (!db) {
        res.status(503).json({ error: "Database unavailable" });
        return;
      }

      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, emailLower))
        .limit(1);

      const user = result[0];

      if (!user) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      if (!user.passwordHash) {
        // Account exists but was created via OAuth — no password set
        res.status(401).json({
          error: "This account uses a different sign-in method. Please use the original provider.",
        });
        return;
      }

      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      // Update lastSignedIn
      await db
        .update(users)
        .set({ lastSignedIn: new Date() })
        .where(eq(users.id, user.id));

      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || emailLower,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({ success: true, message: "Signed in successfully" });
    } catch (error) {
      console.error("[EmailAuth] Login failed:", error);
      res.status(500).json({ error: "Failed to sign in" });
    }
  });
}
