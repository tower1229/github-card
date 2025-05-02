"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

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
