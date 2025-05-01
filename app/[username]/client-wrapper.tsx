"use client";

import { ReactNode } from "react";
import { Navbar } from "@/components/auth/navbar";
import { useAuthStatus } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ClientWrapperProps {
  children: ReactNode;
  username: string;
}

export function ClientWrapper({ children, username }: ClientWrapperProps) {
  const { isAuthenticated, username: authUsername } = useAuthStatus();
  const isOwnProfile = isAuthenticated && authUsername === username;

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />

      {isOwnProfile && (
        <div className="border-b border-[#21262d] bg-[#161b22]">
          <div className="container mx-auto px-4 py-2 flex justify-end">
            <Link href="/#templates">
              <Button variant="outline" size="sm">
                Change Template
              </Button>
            </Link>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
