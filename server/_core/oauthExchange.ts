import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

interface OAuthExchangeRequest {
  provider: "google" | "github" | "linkedin";
  code: string;
  redirectUri: string;
}

interface OAuthUserInfo {
  openId: string;
  email: string;
  name?: string;
  platform: string;
}

/**
 * Exchange OAuth authorization code for user info
 * Handles Google, GitHub, and LinkedIn OAuth flows
 */
async function exchangeOAuthCode(
  provider: string,
  code: string,
  redirectUri: string
): Promise<OAuthUserInfo> {
  const clientId = process.env[`VITE_${provider.toUpperCase()}_CLIENT_ID`];
  const clientSecret = process.env[`${provider.toUpperCase()}_CLIENT_SECRET`];

  if (!clientId || !clientSecret) {
    throw new Error(`Missing OAuth credentials for ${provider}`);
  }

  let tokenUrl = "";
  let userInfoUrl = "";
  let tokenPayload: Record<string, string> = {
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  };

  switch (provider) {
    case "google":
      tokenUrl = "https://oauth2.googleapis.com/token";
      userInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo";
      break;
    case "github":
      tokenUrl = "https://github.com/login/oauth/access_token";
      userInfoUrl = "https://api.github.com/user";
      delete tokenPayload.grant_type;
      break;
    case "linkedin":
      tokenUrl = "https://www.linkedin.com/oauth/v2/accessToken";
      userInfoUrl = "https://api.linkedin.com/v2/me";
      break;
    default:
      throw new Error(`Unsupported OAuth provider: ${provider}`);
  }

  // Exchange code for access token
  const tokenResponse = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type":
        provider === "github"
          ? "application/x-www-form-urlencoded"
          : "application/json",
      Accept: "application/json",
    },
    body:
      provider === "github"
        ? new URLSearchParams(tokenPayload).toString()
        : JSON.stringify(tokenPayload),
  });

  if (!tokenResponse.ok) {
    throw new Error(
      `Failed to exchange OAuth code: ${tokenResponse.statusText}`
    );
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    throw new Error("No access token received from OAuth provider");
  }

  // Get user info
  let userInfoHeaders: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };

  if (provider === "github") {
    userInfoHeaders["User-Agent"] = "SprintWork";
  }

  const userInfoResponse = await fetch(userInfoUrl, {
    headers: userInfoHeaders,
  });

  if (!userInfoResponse.ok) {
    throw new Error(
      `Failed to fetch user info: ${userInfoResponse.statusText}`
    );
  }

  const userInfo = await userInfoResponse.json();

  // Extract user info based on provider
  let openId = "";
  let email = "";
  let name = "";

  switch (provider) {
    case "google":
      openId = userInfo.id;
      email = userInfo.email;
      name = userInfo.name;
      break;
    case "github":
      openId = userInfo.id.toString();
      email = userInfo.email || userInfo.login + "@github.local";
      name = userInfo.name || userInfo.login;
      break;
    case "linkedin":
      openId = userInfo.id;
      email = userInfo.email || userInfo.id + "@linkedin.local";
      name = userInfo.localizedFirstName + " " + userInfo.localizedLastName;
      break;
  }

  return {
    openId,
    email,
    name,
    platform: provider,
  };
}

export function registerOAuthExchangeRoutes(app: Express) {
  app.post("/api/oauth/exchange", async (req: Request, res: Response) => {
    try {
      const { provider, code, redirectUri } = req.body as OAuthExchangeRequest;

      if (!provider || !code || !redirectUri) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      // Exchange OAuth code for user info
      const userInfo = await exchangeOAuthCode(provider, code, redirectUri);

      // Upsert user in database
      await db.upsertUser({
        openId: userInfo.openId,
        email: userInfo.email,
        userType: "job_seeker", // Default to job_seeker, can be changed in onboarding
        name: userInfo.name || null,
        loginMethod: userInfo.platform,
        lastSignedIn: new Date(),
      });

      // Get user info from database
      const user = await db.getUserByOpenId(userInfo.openId);

      // Create session token
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      // Set session cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      res.json({
        success: true,
        user: {
          id: user?.id,
          email: user?.email,
          name: user?.name,
          userType: user?.userType,
        },
      });
    } catch (error) {
      console.error("[OAuth Exchange] Error:", error);
      res.status(500).json({
        error: "OAuth exchange failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
}
