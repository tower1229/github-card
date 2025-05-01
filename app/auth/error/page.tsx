"use client";

import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const errorDescription = getErrorMessage(error);

  const handleSignIn = () => {
    signIn("github", { callbackUrl: `${window.location.origin}/#templates` });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md dark:bg-slate-900">
        <h1 className="mb-4 text-2xl font-bold text-center text-gray-800 dark:text-white">
          认证错误
        </h1>

        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-slate-800 dark:text-red-400">
          <p className="font-medium">登录过程中出现问题</p>
          <p className="mt-2">{errorDescription}</p>
        </div>

        <div className="flex flex-col space-y-4">
          <Button
            onClick={handleSignIn}
            className="flex items-center justify-center w-full px-4 py-2 space-x-2 bg-[#fa7b19] hover:bg-[#e76b0a] transition transform hover:scale-105"
          >
            <Github className="w-5 h-5" />
            <span>重试 GitHub 登录</span>
          </Button>

          <Link href="/" passHref>
            <Button variant="outline" className="w-full">
              返回首页
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function getErrorMessage(error: string | null): string {
  switch (error) {
    case "Callback":
      return "GitHub 登录回调处理失败。请确保您的 GitHub 应用程序配置正确，并且回调 URL 已在 GitHub 开发者设置中正确配置。";
    case "AccessDenied":
      return "您的登录请求被拒绝。您可能拒绝了授权请求或没有足够的权限。";
    case "OAuthSignin":
      return "GitHub OAuth 登录过程初始化失败。";
    case "OAuthCallback":
      return "GitHub OAuth 回调处理失败。";
    case "OAuthCreateAccount":
      return "无法使用 GitHub 账户创建用户账号。";
    case "EmailCreateAccount":
      return "无法使用电子邮件创建用户账号。";
    case "Verification":
      return "验证电子邮件链接已过期或已被使用。";
    case "Default":
    default:
      return "登录过程中出现未知错误。请重试或联系支持团队。";
  }
}
