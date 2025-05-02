"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ProfileContributePage } from "@/components/cards/profile-contribute-page";
import { GitHubData } from "@/lib/types";

interface ShareLinkData {
  cardData: GitHubData;
  expiresAt: string;
}

export default function SharedCardPage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ShareLinkData | null>(null);
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);

  useEffect(() => {
    async function fetchShareLink() {
      try {
        setLoading(true);
        const response = await fetch(`/api/share-links/${token}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to load shared card");
        }

        const linkData = await response.json();
        setData(linkData);

        if (linkData.expiresAt) {
          setExpirationDate(new Date(linkData.expiresAt));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchShareLink();
    }
  }, [token]);

  // Check if link is expired
  const isExpired = expirationDate ? new Date() > expirationDate : false;

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#0d1117] text-white">
        <div className="animate-pulse text-xl">
          Loading shared GitHub card...
        </div>
      </div>
    );
  }

  if (error || isExpired) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#0d1117] text-white">
        <div className="w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-4">
            {isExpired ? "This share link has expired" : "Error"}
          </h1>
          <p className="text-center mb-6">
            {isExpired
              ? "The shared GitHub card is no longer available."
              : error || "Failed to load the shared GitHub card."}
          </p>
          <div className="flex justify-center">
            <Link
              href="/"
              className="px-4 py-2 bg-[#fa7b19] hover:bg-[#e76b0a] text-white rounded-md transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.cardData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#0d1117] text-white">
        <div className="w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-4">
            No Data Available
          </h1>
          <p className="text-center mb-6">
            The shared GitHub card data could not be found.
          </p>
          <div className="flex justify-center">
            <Link
              href="/"
              className="px-4 py-2 bg-[#fa7b19] hover:bg-[#e76b0a] text-white rounded-md transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Use the same component as in generate page, but pass hideShareButton prop
  return (
    <div className="min-h-screen bg-[#0d1117]">
      {data.cardData.login && (
        <ProfileContributePage
          username={data.cardData.login}
          hideMenu={true}
          sharedData={data.cardData}
        />
      )}

      <div className="fixed bottom-2 opacity-80 left-0 right-0 flex justify-center z-50">
        <Link
          href="/"
          className="px-3 py-1.5 bg-[#fa7b19] hover:bg-[#e76b0a] text-white text-sm rounded-3xl transition-colors shadow-lg"
        >
          Create Your Own
        </Link>
      </div>
    </div>
  );
}
