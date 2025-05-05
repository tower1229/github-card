"use client";

import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/logo.png";
import { GithubButton } from "./github-button";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Trophy } from "lucide-react";

interface NavbarProps {
  showLinks?: boolean;
}

export function Navbar({ showLinks = false }: NavbarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isGeneratePage =
    pathname === "/generate" || pathname.startsWith("/generate?");

  return (
    <nav className="sticky top-0 w-full bg-[#0d1117]/95 backdrop-blur-sm z-50 border-b border-[#21262d]">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-xl font-bold flex items-center gap-2">
            <Image
              src={Logo}
              alt="Logo"
              width={30}
              height={30}
              className="object-cover rounded-full"
            />
            GitHub Card
          </Link>
          {showLinks && (
            <div className="hidden md:flex space-x-6">
              <Link
                href="/#templates"
                className="text-[#c9d1d9] hover:text-white transition"
              >
                Templates
              </Link>
              <Link
                href="/#examples"
                className="text-[#c9d1d9] hover:text-white transition"
              >
                Examples
              </Link>
              <Link
                href="/leaderboard"
                className="text-[#c9d1d9] hover:text-white transition flex items-center gap-1"
                aria-label="Leaderboard"
              >
                <Trophy size={16} className="text-yellow-400" />
                <span>Leaderboard</span>
              </Link>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {session && isGeneratePage && (
            <Link
              href="/#templates"
              className="text-[#c9d1d9] hover:text-white transition"
            >
              Back
            </Link>
          )}
          <GithubButton />
        </div>
      </div>
    </nav>
  );
}
