"use client";

import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

interface GithubButtonProps {
  className?: string;
}

export function GithubButton({ className = "" }: GithubButtonProps) {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  const handleSignIn = () => {
    signIn("github", { callbackUrl: "/#templates" });
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <>
      {session ? (
        <Button
          onClick={handleSignOut}
          className={`flex items-center px-4 py-2 bg-[#21262d] hover:bg-[#30363d] transition transform hover:scale-105 ${className}`}
        >
          {session.user?.image ? (
            <div className="relative w-6 h-6 mr-2 rounded-full overflow-hidden">
              <Image
                src={session.user.image}
                alt={session.user?.name || "User"}
                fill
                className="rounded-full"
              />
            </div>
          ) : (
            <Github className="w-5 h-5 mr-2" />
          )}
          Sign Out
        </Button>
      ) : (
        <Button
          onClick={handleSignIn}
          disabled={isLoading}
          className={`flex items-center px-4 py-2 bg-[#fa7b19] hover:bg-[#e76b0a] transition transform hover:scale-105 ${className}`}
        >
          <Github className="w-5 h-5 mr-2" />
          {isLoading ? "Loading..." : "Sign in with GitHub"}
        </Button>
      )}
    </>
  );
}
