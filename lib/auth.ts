"use client";
// This file is for client-side authentication helpers only
// No direct database access should happen here

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

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
  try {
    console.log("withAuth: Starting authentication check");

    // Debugging information about the request
    console.log("withAuth: Request method:", req.method);
    console.log("withAuth: Request URL:", req.url);

    let session;
    try {
      session = await getServerSession(authOptions);
      console.log("withAuth: Session retrieved:", !!session);

      if (session?.user) {
        console.log("withAuth: User in session:", {
          hasId: !!session.user.id,
          hasName: !!session.user.name,
          hasEmail: !!session.user.email,
        });
      } else {
        console.log("withAuth: No user in session");
      }
    } catch (sessionError) {
      console.error("withAuth: Error retrieving session:", sessionError);
      return NextResponse.json(
        {
          error: "Authentication error",
          message: "Failed to retrieve session",
        },
        { status: 500 }
      );
    }

    if (!session?.user?.id) {
      console.log("API 鉴权失败: 缺少用户 ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      console.log(
        "withAuth: Proceeding to handler with userId:",
        session.user.id
      );
      return await handler(req, session.user.id);
    } catch (handlerError) {
      console.error("withAuth: Error in handler execution:", handlerError);
      return NextResponse.json(
        {
          error: "Request handler error",
          message: String(handlerError),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    // Catch-all for any other errors in the auth middleware
    console.error("withAuth: Unexpected error in auth middleware:", error);
    return NextResponse.json(
      {
        error: "Server error",
        message: "An unexpected error occurred in the authentication process",
      },
      { status: 500 }
    );
  }
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
