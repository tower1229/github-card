"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GithubButton } from "@/components/auth/github-button";
import { Navbar } from "@/components/auth/navbar";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Something went wrong!</h2>
          <p className="text-[#c9d1d9] mb-8">
            We encountered an error while processing your request. Please try
            again.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => reset()}
              className="bg-[#fa7b19] hover:bg-[#e76b0a]"
            >
              Try again
            </Button>
            <Link href="/">
              <Button variant="outline">Go home</Button>
            </Link>
          </div>
          <div className="mt-8">
            <p className="text-[#8b949e] mb-4">
              Not signed in? Sign in to continue:
            </p>
            <div className="flex justify-center">
              <GithubButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
