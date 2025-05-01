import { NextResponse } from "next/server";

export async function middleware() {
  // 用户可以直接在主页上操作
  return NextResponse.next();
}
