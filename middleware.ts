import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 检查是否访问 /generate 路径
  const isProtectedPath = pathname.startsWith("/generate");

  // 如果不是被保护的路径，直接通过
  if (!isProtectedPath) {
    return NextResponse.next();
  }

  // 获取会话令牌
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // 如果用户未登录且试图访问 /generate，重定向到首页
  if (!token && isProtectedPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/generate", "/generate/:path*"],
};
