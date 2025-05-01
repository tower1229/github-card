"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { ProfileContributePage } from "@/app/[username]/profile-contribute-page";
import { ProfileLinktreePage } from "@/app/[username]/profile-linktree-page";
import { Navbar } from "@/components/auth/navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// 分离逻辑到一个使用 useSearchParams 的组件
function GenerateContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const template = searchParams.get("template") || "contribute";

  useEffect(() => {
    // 如果用户未登录，则重定向到首页
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // 显示加载状态
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  // 用户未登录，显示错误信息
  if (!session) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Login Required</h2>
            <p className="text-[#c9d1d9] mb-8">
              You need to sign in with GitHub to access this page.
            </p>
            <Link href="/">
              <Button className="bg-[#fa7b19] hover:bg-[#e76b0a]">
                Go Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 用户名必须存在
  const username = session.user?.username;
  if (!username) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">User Profile Error</h2>
            <p className="text-[#c9d1d9] mb-8">
              Unable to retrieve your GitHub username. Please try signing in
              again.
            </p>
            <Link href="/">
              <Button className="bg-[#fa7b19] hover:bg-[#e76b0a]">
                Go Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 根据模板类型选择相应的组件
  const templates = {
    contribute: ProfileContributePage,
    linktree: ProfileLinktreePage,
  };

  // 检查模板是否有效
  const templateType = template as keyof typeof templates;
  const Component = templates[templateType] || templates.contribute;

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />

      <Component username={username} />
    </div>
  );
}

// 主组件使用 Suspense 包装用到 useSearchParams 的组件
export default function GeneratePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center">
          <div className="animate-pulse text-xl">Loading...</div>
        </div>
      }
    >
      <GenerateContent />
    </Suspense>
  );
}
