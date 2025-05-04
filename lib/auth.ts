"use client";
// This file is for client-side authentication helpers only
// No direct database access should happen here

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export function useRequireAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/");
    }
  }, [session, status, router]);

  return {
    session,
    status,
    isLoading: status === "loading",
    isAuthenticated: !!session,
  };
}

export function useAuthStatus() {
  const { data: session, status } = useSession();
  return {
    session,
    status,
    isLoading: status === "loading",
    isAuthenticated: !!session,
    username: session?.user?.username || null,
  };
}

// API 路由鉴权中间件
export async function withAuth(
  handler: (req: NextRequest, userId: string) => Promise<NextResponse>,
  req: NextRequest
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    console.log("API 鉴权失败: 缺少用户 ID");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return handler(req, session.user.id);
}

// 客户端 fetch 封装
export const authFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const defaultOptions: RequestInit = {
    credentials: "include", // 始终包含认证凭据
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  return fetch(url, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });
};
