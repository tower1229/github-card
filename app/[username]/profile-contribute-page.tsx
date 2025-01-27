"use client";
import { BlurFade } from "@/components/blur-fade";
import { Footer } from "@/components/footer";
import { useEffect, useState } from "react";
import { ShareButton } from "@/components/share-button";
import { ProfileContribute } from "@/components/profile-contribute";
import { ProfileTotal } from "@/components/profile-total";
import { BingImg } from "@/components/bing-img";

import { GitHubData } from "@/lib/types";

export function ProfileContributePage({ username }: { username: string }) {
  const [userData, setUserData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/github/user/${username}`);
        const result = await response.json();
        if (result.success) {
          setUserData(result.data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  const [isDownloading, setIsDownloading] = useState(false);

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-600 via-orange-800 to-gray-900 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  if (!userData)
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-600 via-orange-800 to-gray-900 text-white flex items-center justify-center">
        User not found
      </div>
    );

  return (
    <div className="relative min-h-screen  text-white px-4 py-4 sm:py-8 bg-gradient-to-b from-orange-600 via-orange-800 to-gray-900">
      <BingImg className="absolute left-0 top-0 w-full h-full object-cover" />

      <div
        className={`relative z-10 w-content max-w-[100%] mx-auto ${
          isDownloading ? "bg-gray-900/70" : "bg-gray-900/20"
        } backdrop-blur-lg rounded-lg p-4 pt-8`}
      >
        {/* Settings button */}
        <BlurFade delay={100}>
          <div className="relative h-10 overflow-hidden flex justify-end">
            {!isDownloading && (
              <ShareButton setIsDownloading={setIsDownloading} />
            )}
          </div>
        </BlurFade>

        <BlurFade delay={200}>
          <ProfileTotal userData={userData} />
        </BlurFade>
        <ProfileContribute username={username} />
        {/* Footer */}
        {
          <BlurFade delay={1300}>
            <Footer showQrcode={isDownloading} />
          </BlurFade>
        }
      </div>
    </div>
  );
}
