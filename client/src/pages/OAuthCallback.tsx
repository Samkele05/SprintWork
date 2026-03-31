import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * OAuth Callback Handler
 * Processes OAuth responses from Google, GitHub, and LinkedIn
 */
export default function OAuthCallback() {
  const [location] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("Processing your login...");

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Extract provider from URL path
        const pathMatch = location.match(/\/oauth\/callback\/(\w+)/);
        const provider = pathMatch?.[1] as
          | "google"
          | "github"
          | "linkedin"
          | undefined;

        if (!provider) {
          setError("Invalid callback URL");
          return;
        }

        // Get authorization code and state from URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");

        if (!code) {
          setError("Authorization failed: No code received");
          return;
        }

        // Verify state for CSRF protection
        const storedState = sessionStorage.getItem(`oauth_state_${provider}`);
        if (state !== storedState) {
          setError("Authorization failed: Invalid state");
          return;
        }

        setMessage(`Authenticating with ${provider}...`);

        // Exchange code for token and get profile
        const response = await fetch("/api/oauth/exchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider,
            code,
            redirectUri: `${window.location.origin}/oauth/callback/${provider}`,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(
            errorData.message || `Authentication failed: ${response.statusText}`
          );
          return;
        }

        const data = await response.json();

        setMessage("Setting up your profile...");

        // Redirect to onboarding after successful auth
        setTimeout(() => {
          window.location.href = "/onboarding";
        }, 1000);
      } catch (err) {
        console.error("OAuth callback error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred during authentication"
        );
      }
    };

    processCallback();
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Authentication</CardTitle>
          <CardDescription>Processing your login</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center py-8">
          {error ? (
            <div className="text-center space-y-4">
              <div className="text-red-600 font-semibold">
                Authentication Failed
              </div>
              <p className="text-sm text-gray-600">{error}</p>
              <button
                onClick={() => (window.location.href = "/")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="text-sm text-gray-600">{message}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
