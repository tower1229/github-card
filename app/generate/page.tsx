"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense, useState, useCallback, useRef } from "react";
import { ProfileContributePage } from "@/components/cards/profile-contribute-page";
import { ProfileLinktreePage } from "@/components/cards/profile-linktree-page";
import { ProfileFlomoPage } from "@/components/cards/profile-flomo-page";
import { Navbar } from "@/components/auth/navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GitHubData } from "@/lib/types";
import Loading from "@/components/loading";
import { authFetch } from "@/lib/auth";
import LoadingSharedCard from "@/components/loading";

// Warn if environment variables are being accessed from client
if (typeof window !== "undefined" && process.env.DATABASE_URL) {
  console.warn(
    "Warning: Environment variables like DATABASE_URL should not be accessed from client components"
  );
}

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
  // 使用 ref 来跟踪 API 请求的状态
  const apiRequestStatus = useRef({
    isGeneratingLink: false,
    hasGeneratedLink: false,
  });

  // 记忆化回调函数，防止重渲染导致的无限请求循环
  const handleDownloadStateChange = useCallback((downloading: boolean) => {
    setIsDownloading(downloading);
  }, []);

  // 处理加载用户数据 - 使用 useCallback 来记忆化函数，防止无限重渲染
  const handleUserDataLoaded = useCallback((data: GitHubData) => {
    setUserData(data);
  }, []);

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
    // 如果已经在生成链接或已经生成过，则跳过
    if (
      apiRequestStatus.current.isGeneratingLink ||
      apiRequestStatus.current.hasGeneratedLink
    ) {
      return;
    }

    // 如果用户数据已加载，生成分享链接
    if (userData) {
      const generateShareLink = async () => {
        try {
          // 标记请求状态为正在进行
          apiRequestStatus.current.isGeneratingLink = true;
          setShareContext((prev) => ({ ...prev, isGenerating: true }));

          const response = await authFetch("/api/share-links", {
            method: "POST",
            body: JSON.stringify({
              templateType: templateType,
            }),
          });

          if (!response.ok) {
            let errorMessage = "Failed to create share link";
            try {
              const errorData = await response.json();
              console.error("Failed to create share link:", errorData);
              errorMessage = errorData.error || errorMessage;
            } catch (jsonError) {
              // If JSON parsing fails, use the response status text
              console.error("Error parsing error response:", jsonError);
              errorMessage = `Server error (${response.status}): ${response.statusText}`;
            }
            throw new Error(errorMessage);
          }

          const data = await response.json();
          setShareContext({
            shareUrl: data.shareUrl,
            isGenerating: false,
          });

          // 标记已完成生成分享链接
          apiRequestStatus.current.hasGeneratedLink = true;
        } catch (error) {
          console.error("Error generating share link:", error);
          setShareContext((prev) => ({ ...prev, isGenerating: false }));
        } finally {
          // 无论成功还是失败，都标记请求已结束
          apiRequestStatus.current.isGeneratingLink = false;
        }
      };

      generateShareLink();
    }
  }, [userData, templateType, session]);

  useEffect(() => {
    // 如果用户未登录，则重定向到首页
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // 显示加载状态
  if (status === "loading") {
    return <Loading />;
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
    <Suspense fallback={<LoadingSharedCard />}>
      <GenerateContent />
    </Suspense>
  );
}
