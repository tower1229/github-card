"use client";
import { BlurFade } from "@/components/blur-fade";
import { Footer } from "@/components/footer";
import { useEffect, useState } from "react";
import { ShareButton } from "@/components/share-button";
import { ProfileContribute } from "@/components/profile-contribute";
import { ProfileTotal } from "@/components/profile-total";
import { BingImg } from "@/components/bing-img";
import { GitHubData } from "@/lib/types";
import { ShareContextData } from "@/app/generate/page";

interface ProfileContributePageProps {
  username: string;
  hideMenu?: boolean;
  sharedData?: GitHubData;
  onDownloadStateChange?: (downloading: boolean) => void;
  shareContext?: ShareContextData;
  onUserDataLoaded?: (data: GitHubData) => void;
}

export function ProfileContributePage({
  username,
  hideMenu = false,
  sharedData,
  onDownloadStateChange,
  shareContext,
  onUserDataLoaded,
}: ProfileContributePageProps) {
  const [userData, setUserData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(!sharedData);

  useEffect(() => {
    // If sharedData is provided, use it directly
    if (sharedData) {
      setUserData(sharedData);
      setLoading(false);
      return;
    }

    if (!username) return;
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/github/user/${username}`);
        const result = await response.json();
        if (result.success) {
          setUserData(result.data);
          // 通知父组件数据已加载
          onUserDataLoaded?.(result.data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username, sharedData, onUserDataLoaded]);

  const [isDownloading, setIsDownloading] = useState(false);

  // Forward downloading state to parent component if the prop exists
  useEffect(() => {
    onDownloadStateChange?.(isDownloading);
  }, [isDownloading, onDownloadStateChange]);

  if (loading)
    return (
      <div className="min-h-screen bg-linear-to-b from-orange-600 via-orange-800 to-gray-900 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  if (!userData)
    return (
      <div className="min-h-screen bg-linear-to-b from-orange-600 via-orange-800 to-gray-900 text-white flex items-center justify-center">
        User not found
      </div>
    );

  return (
    <div className="relative min-h-screen text-white px-4 py-4 sm:py-8 bg-linear-to-b from-orange-600 via-orange-800 to-gray-900">
      <BingImg className="absolute left-0 top-0 w-full h-full object-cover" />

      <div
        className={`relative z-10 w-content max-w-[100%] mx-auto ${
          isDownloading ? "bg-gray-900/70" : "bg-gray-900/20"
        } backdrop-blur-lg rounded-lg p-4 pt-8`}
      >
        {/* Settings button - only shown if hideMenu is false */}
        {!hideMenu && !isDownloading && (
          <BlurFade delay={100}>
            <div className="relative h-10 overflow-hidden flex justify-end">
              {!isDownloading && (
                <ShareButton
                  setIsDownloading={setIsDownloading}
                  userData={userData!}
                  templateType={"contribute"}
                  shareContext={shareContext}
                />
              )}
            </div>
          </BlurFade>
        )}

        <BlurFade delay={200}>
          <ProfileTotal userData={userData} />
        </BlurFade>

        <ProfileContribute username={username} years={3} />

        {/* Footer */}
        {
          <BlurFade delay={1300}>
            <Footer showQrcode shareContext={shareContext} />
          </BlurFade>
        }
      </div>
    </div>
  );
}
