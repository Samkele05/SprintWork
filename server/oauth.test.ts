import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import {
  getGoogleProfile,
  getGitHubProfile,
  getLinkedInProfile,
  getGoogleAuthUrl,
  getGitHubAuthUrl,
  getLinkedInAuthUrl,
} from "./services/oauthProviders";

vi.mock("axios");
const mockedAxios = vi.mocked(axios);

describe("OAuth Providers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Google OAuth", () => {
    it("should extract Google profile data", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          id: "google-123",
          email: "user@gmail.com",
          name: "John Doe",
          picture: "https://example.com/photo.jpg",
        },
      });

      const profile = await getGoogleProfile("access-token");

      expect(profile).toEqual({
        id: "google-123",
        email: "user@gmail.com",
        name: "John Doe",
        avatar: "https://example.com/photo.jpg",
        provider: "google",
      });
    });

    it("should generate Google auth URL", () => {
      const url = getGoogleAuthUrl("http://localhost:3000/callback", "state123");

      expect(url).toContain("accounts.google.com");
      expect(url).toContain("client_id=");
      expect(url).toContain("state=state123");
    });
  });

  describe("GitHub OAuth", () => {
    it("should extract GitHub profile with languages", async () => {
      mockedAxios.get
        .mockResolvedValueOnce({
          data: {
            id: 12345,
            email: "user@github.com",
            name: "Jane Developer",
            login: "janedev",
            avatar_url: "https://avatars.githubusercontent.com/u/12345",
            bio: "Full stack developer",
            location: "San Francisco",
            html_url: "https://github.com/janedev",
          },
        })
        .mockResolvedValueOnce({
          data: [
            { language: "TypeScript" },
            { language: "JavaScript" },
            { language: "Python" },
            { language: null },
          ],
        });

      const profile = await getGitHubProfile("access-token");

      expect(profile.id).toBe("12345");
      expect(profile.email).toBe("user@github.com");
      expect(profile.name).toBe("Jane Developer");
      expect(profile.skills).toContain("TypeScript");
      expect(profile.provider).toBe("github");
    });

    it("should generate GitHub auth URL", () => {
      const url = getGitHubAuthUrl("http://localhost:3000/callback", "state456");

      expect(url).toContain("github.com/login/oauth/authorize");
      expect(url).toContain("client_id=");
      expect(url).toContain("state=state456");
    });
  });

  describe("LinkedIn OAuth", () => {
    it("should extract LinkedIn profile data", async () => {
      mockedAxios.get
        .mockResolvedValueOnce({
          data: {
            id: "linkedin-123",
            localizedFirstName: "Alice",
            localizedLastName: "Smith",
          },
        })
        .mockResolvedValueOnce({
          data: {
            elements: [
              {
                "handle~": {
                  emailAddress: "alice@linkedin.com",
                },
              },
            ],
          },
        })
        .mockResolvedValueOnce({
          data: {
            id: "linkedin-123",
            localizedFirstName: "Alice",
            localizedLastName: "Smith",
            profilePicture: {
              displayImage: "https://example.com/profile.jpg",
            },
          },
        });

      const profile = await getLinkedInProfile("access-token");

      expect(profile.id).toBe("linkedin-123");
      expect(profile.name).toBe("Alice Smith");
      expect(profile.email).toBe("alice@linkedin.com");
      expect(profile.provider).toBe("linkedin");
    });

    it("should generate LinkedIn auth URL", () => {
      const url = getLinkedInAuthUrl("http://localhost:3000/callback", "state789");

      expect(url).toContain("linkedin.com/oauth/v2/authorization");
      expect(url).toContain("client_id=");
      expect(url).toContain("state=state789");
    });
  });

  describe("Error Handling", () => {
    it("should handle Google API errors", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("API Error"));

      await expect(getGoogleProfile("invalid-token")).rejects.toThrow(
        "Failed to fetch Google profile"
      );
    });

    it("should handle GitHub API errors", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("API Error"));

      await expect(getGitHubProfile("invalid-token")).rejects.toThrow(
        "Failed to fetch GitHub profile"
      );
    });

    it("should handle LinkedIn API errors", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("API Error"));

      await expect(getLinkedInProfile("invalid-token")).rejects.toThrow(
        "Failed to fetch LinkedIn profile"
      );
    });
  });
});
