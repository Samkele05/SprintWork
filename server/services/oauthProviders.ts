import axios from "axios";

/**
 * OAuth Providers Integration Service
 * Handles Google, GitHub, and LinkedIn OAuth authentication and profile data extraction
 */

export interface OAuthProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  profileUrl?: string;
  provider: "google" | "github" | "linkedin";
}

/**
 * Google OAuth Profile Extraction
 */
export async function getGoogleProfile(
  accessToken: string
): Promise<OAuthProfile> {
  try {
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return {
      id: response.data.id,
      email: response.data.email,
      name: response.data.name || "",
      avatar: response.data.picture,
      provider: "google",
    };
  } catch (error) {
    console.error("Failed to get Google profile:", error);
    throw new Error("Failed to fetch Google profile");
  }
}

/**
 * GitHub OAuth Profile Extraction
 */
export async function getGitHubProfile(
  accessToken: string
): Promise<OAuthProfile> {
  try {
    // Get user info
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // Get user repos to extract skills
    const reposResponse = await axios.get(
      "https://api.github.com/user/repos?per_page=50",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    // Extract languages from repos
    const languages = new Set<string>();
    for (const repo of reposResponse.data) {
      if (repo.language) {
        languages.add(repo.language);
      }
    }

    return {
      id: userResponse.data.id.toString(),
      email: userResponse.data.email || "",
      name: userResponse.data.name || userResponse.data.login,
      avatar: userResponse.data.avatar_url,
      bio: userResponse.data.bio,
      location: userResponse.data.location,
      skills: Array.from(languages),
      profileUrl: userResponse.data.html_url,
      provider: "github",
    };
  } catch (error) {
    console.error("Failed to get GitHub profile:", error);
    throw new Error("Failed to fetch GitHub profile");
  }
}

/**
 * LinkedIn OAuth Profile Extraction
 */
export async function getLinkedInProfile(
  accessToken: string
): Promise<OAuthProfile> {
  try {
    // Get profile info
    const profileResponse = await axios.get("https://api.linkedin.com/v2/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    // Get email
    const emailResponse = await axios.get(
      "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const email =
      emailResponse.data.elements?.[0]?.["handle~"]?.emailAddress || "";

    // Get profile picture
    const pictureResponse = await axios.get(
      "https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage))",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const firstName = profileResponse.data.localizedFirstName || "";
    const lastName = profileResponse.data.localizedLastName || "";

    return {
      id: profileResponse.data.id,
      email,
      name: `${firstName} ${lastName}`.trim(),
      avatar: pictureResponse.data.profilePicture?.displayImage,
      provider: "linkedin",
      profileUrl: `https://www.linkedin.com/in/${profileResponse.data.id}`,
    };
  } catch (error) {
    console.error("Failed to get LinkedIn profile:", error);
    throw new Error("Failed to fetch LinkedIn profile");
  }
}

/**
 * Generate OAuth authorization URLs
 */
export function getGoogleAuthUrl(redirectUri: string, state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";
  const scope = "openid email profile";

  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}`;
}

export function getGitHubAuthUrl(redirectUri: string, state: string): string {
  const clientId = process.env.GITHUB_CLIENT_ID || "YOUR_GITHUB_CLIENT_ID";
  const scope = "user:email read:user";

  return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;
}

export function getLinkedInAuthUrl(redirectUri: string, state: string): string {
  const clientId = process.env.LINKEDIN_CLIENT_ID || "YOUR_LINKEDIN_CLIENT_ID";
  const scope = "openid profile email";

  return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;
}

/**
 * Exchange authorization codes for access tokens
 */
export async function exchangeGoogleCode(
  code: string,
  redirectUri: string
): Promise<string> {
  try {
    const response = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });

    return response.data.access_token;
  } catch (error) {
    console.error("Failed to exchange Google code:", error);
    throw new Error("Google authentication failed");
  }
}

export async function exchangeGitHubCode(code: string): Promise<string> {
  try {
    const response = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    return response.data.access_token;
  } catch (error) {
    console.error("Failed to exchange GitHub code:", error);
    throw new Error("GitHub authentication failed");
  }
}

export async function exchangeLinkedInCode(
  code: string,
  redirectUri: string
): Promise<string> {
  try {
    const response = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      null,
      {
        params: {
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: process.env.LINKEDIN_CLIENT_ID,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error("Failed to exchange LinkedIn code:", error);
    throw new Error("LinkedIn authentication failed");
  }
}
