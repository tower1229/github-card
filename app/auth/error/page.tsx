"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GithubButton } from "@/components/auth/github-button";
import { Navbar } from "@/components/auth/navbar";
import LoadingSharedCard from "@/components/loading";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (error) {
      console.error("Authentication error:", error);
    }
  }, [error]);

  // Map error codes to user-friendly messages
  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case "Configuration":
        return "There is a problem with the server configuration.";
      case "AccessDenied":
        return "You do not have permission to sign in.";
      case "Verification":
        return "The verification link was invalid or has expired.";
      case "OAuthSignin":
        return "Error in the OAuth sign-in process.";
      case "OAuthCallback":
        return "Error in the OAuth callback process.";
      case "OAuthCreateAccount":
        return "Could not create user account with the OAuth provider.";
      case "EmailCreateAccount":
        return "Could not create user account with email.";
      case "Callback":
        return "Error occurred in the authentication process callback.";
      case "OAuthAccountNotLinked":
        return "To confirm your identity, sign in with the same account you used originally.";
      case "SessionRequired":
        return "Authentication session is required to access this page.";
      default:
        return "An unexpected error occurred during authentication.";
    }
  };

  return (
    <div className="max-w-md mx-auto text-center">
      <h2 className="text-3xl font-bold mb-4">Authentication Error</h2>
      <p className="text-[#c9d1d9] mb-8">{getErrorMessage(error)}</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href="/">
          <Button className="bg-[#fa7b19] hover:bg-[#e76b0a]">Go home</Button>
        </Link>
      </div>
      <div className="mt-8">
        <p className="text-[#8b949e] mb-4">Try signing in again:</p>
        <div className="flex justify-center">
          <GithubButton />
        </div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <Suspense fallback={<LoadingSharedCard />}>
          <ErrorContent />
        </Suspense>
      </div>
    </div>
  );
}
