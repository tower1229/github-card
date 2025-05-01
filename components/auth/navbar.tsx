"use client";

import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/logo.png";
import { GithubButton } from "./github-button";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

interface NavbarProps {
  showLinks?: boolean;
}

export function Navbar({ showLinks = false }: NavbarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isHomePage = pathname === "/";
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
              <a
                href="#templates"
                className="text-[#c9d1d9] hover:text-white transition"
              >
                Templates
              </a>
              <a
                href="#examples"
                className="text-[#c9d1d9] hover:text-white transition"
              >
                Examples
              </a>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {session && !isHomePage && !isGeneratePage && (
            <Link
              href="/generate?template=contribute"
              className="text-[#c9d1d9] hover:text-white transition"
            >
              Generate Card
            </Link>
          )}
          {session && !isHomePage && (
            <Link
              href="/#templates"
              className="text-[#c9d1d9] hover:text-white transition"
            >
              Change Template
            </Link>
          )}
          <GithubButton />
        </div>
      </div>
    </nav>
  );
}
