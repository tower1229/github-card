"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/auth/navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
          <p className="text-[#c9d1d9] mb-8">
            The page you are looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex justify-center">
            <Link href="/">
              <Button className="bg-[#fa7b19] hover:bg-[#e76b0a]">
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
