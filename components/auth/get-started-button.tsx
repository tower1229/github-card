"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export function GetStartedButton() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  const handleGetStarted = () => {
    if (!session) {
      signIn("github", { callbackUrl: "/#templates" });
    }
    // 如果已登录，Link 组件会处理导航到 #templates
  };

  return (
    <>
      {session ? (
        <Link href="#templates">
          <Button className="px-8 py-3 bg-[#fa7b19] hover:bg-[#e76b0a] text-white rounded-lg font-medium transition transform hover:scale-105">
            Choose Template
          </Button>
        </Link>
      ) : (
        <Button
          onClick={handleGetStarted}
          disabled={isLoading}
          className="px-8 py-3 bg-[#fa7b19] hover:bg-[#e76b0a] text-white rounded-lg font-medium transition transform hover:scale-105"
        >
          {isLoading ? "Loading..." : "Get Started"}
        </Button>
      )}
    </>
  );
}
