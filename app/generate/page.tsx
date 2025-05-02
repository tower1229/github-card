"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense, useState } from "react";
import { ProfileContributePage } from "@/components/cards/profile-contribute-page";
import { ProfileLinktreePage } from "@/components/cards/profile-linktree-page";
import { ProfileFlomoPage } from "@/components/cards/profile-flomo-page";
import { Navbar } from "@/components/auth/navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GitHubData } from "@/lib/types";

// 创建一个共享上下文
export interface ShareContextData {
  shareUrl: string;
  isGenerating: boolean;
}

// 分离逻辑到一个使用 useSearchParams 的组件
function GenerateContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const template = searchParams.get("template") || "contribute";
  const [isDownloading, setIsDownloading] = useState(false);
  const [userData, setUserData] = useState<GitHubData | null>(null);
  const [shareContext, setShareContext] = useState<ShareContextData>({
    shareUrl: "",
    isGenerating: false,
  });

  // 根据模板类型选择相应的组件
  const templates = {
    contribute: ProfileContributePage,
    linktree: ProfileLinktreePage,
    flomo: ProfileFlomoPage,
  };

  // 检查模板是否有效
  const templateType = template as keyof typeof templates;

  // 用户数据加载完成后生成分享链接
  useEffect(() => {
    if (userData && !shareContext.shareUrl && !shareContext.isGenerating) {
      const generateShareLink = async () => {
        try {
          setShareContext((prev) => ({ ...prev, isGenerating: true }));

          const response = await fetch("/api/share-links", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              cardData: userData,
              templateType: templateType,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to create share link");
          }

          const data = await response.json();
          setShareContext({
            shareUrl: data.shareUrl,
            isGenerating: false,
          });
        } catch (error) {
          console.error("Error generating share link:", error);
          setShareContext((prev) => ({ ...prev, isGenerating: false }));
        }
      };

      generateShareLink();
    }
  }, [
    userData,
    templateType,
    shareContext.shareUrl,
    shareContext.isGenerating,
  ]);

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

  // 获取GitHub登录名 (URL中的用户名)
  const username = session.user?.username;
  // Not using displayName yet, so commenting it out to avoid linter errors
  // const displayName = session.user?.name || username;

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

  const Component = templates[templateType];

  const handleDownloadStateChange = (downloading: boolean) => {
    setIsDownloading(downloading);
  };

  // 处理加载用户数据
  const handleUserDataLoaded = (data: GitHubData) => {
    setUserData(data);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {!isDownloading && <Navbar />}

      <Component
        username={username}
        onDownloadStateChange={handleDownloadStateChange}
        shareContext={shareContext}
        onUserDataLoaded={handleUserDataLoaded}
      />
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
