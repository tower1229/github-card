"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

// Define a more specific type for the card data
interface GitHubCardData {
  username: string;
  stats?: {
    followers?: number;
    following?: number;
    repositories?: number;
    stars?: number;
  };
  contributions?: {
    total?: number;
    lastYear?: number;
  };
  languages?: Record<string, number>;
  repositories?: Array<{
    name: string;
    description?: string;
    stars?: number;
    forks?: number;
  }>;
  [key: string]: unknown; // Using unknown instead of any
}

interface ShareLinkData {
  cardData: GitHubCardData;
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

  // Format the expiration date
  const formatExpirationDate = () => {
    if (!expirationDate) return "";

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(expirationDate);
  };

  // Check if link is expired
  const isExpired = expirationDate ? new Date() > expirationDate : false;

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h1 className="text-2xl font-bold text-center mb-4">
            Loading shared GitHub card...
          </h1>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || isExpired) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h1 className="text-2xl font-bold text-center mb-4">
            No Data Available
          </h1>
          <p className="text-center mb-6">
            The shared GitHub card data could not be found.
          </p>
          <div className="flex justify-center">
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-center mb-4">
          Shared GitHub Card
        </h1>

        {/* Display the GitHub card using data.cardData */}
        <div className="mb-6">
          {/* Here you would implement the GitHub card component using data.cardData */}
          <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-auto">
            {JSON.stringify(data.cardData, null, 2)}
          </pre>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          This shared link will expire on {formatExpirationDate()}
        </div>

        <div className="flex justify-center">
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Your Own Card
          </Link>
        </div>
      </div>
    </div>
  );
}
