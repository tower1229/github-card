"use client";
import { BlurFade } from "@/components/blur-fade";
import { Footer } from "@/components/footer";
import { GitHubData } from "@/lib/types";
import { useState, useEffect } from "react";
import { BingImg } from "@/components/bing-img";
import NumberTicker from "@/components/ui/number-ticker";
import HyperText from "@/components/ui/hyper-text";
import { ProfileTotal } from "@/components/profile-total";
import { ShareButton } from "@/components/share-button";
import { BookBookmark, Users, Star, GitCommit } from "@phosphor-icons/react";
import { ShareContextData } from "@/app/generate/page";
import { getUserGitHubData } from "@/lib/server-github";

interface ProfileLinktreePageProps {
  username: string;
  hideMenu?: boolean;
  sharedData?: GitHubData;
  onDownloadStateChange?: (downloading: boolean) => void;
  shareContext?: ShareContextData;
  onUserDataLoaded?: (data: GitHubData) => void;
}

export function ProfileLinktreePage({
  username,
  hideMenu = false,
  sharedData,
  onDownloadStateChange,
  shareContext,
  onUserDataLoaded,
}: ProfileLinktreePageProps) {
  const [userData, setUserData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(!sharedData);

  useEffect(() => {
    // If sharedData is provided, use it directly
    if (sharedData) {
      setUserData(sharedData);
      setLoading(false);
      // Notify parent component
      if (onUserDataLoaded) {
        onUserDataLoaded(sharedData);
      }
      return;
    }

    if (!username) return;

    const abortController = new AbortController();

    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Use the server action instead of making a direct API call
        const result = await getUserGitHubData(username);

        if (result.success && result.data) {
          setUserData(result.data);
          // Notify parent component
          if (onUserDataLoaded) {
            onUserDataLoaded(result.data);
          }
        } else {
          console.error("Error in server action response:", result);
        }
      } catch (error: unknown) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    // Clean up function
    return () => {
      abortController.abort();
    };
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
    <div className="relative flex flex-col justify-center min-h-screen  text-white px-4 py-4 sm:py-8 bg-linear-to-b from-orange-600 via-orange-800 to-gray-900">
      <BingImg className="absolute left-0 top-0 w-full h-full object-cover" />

      <div className={`relative z-10 w-content max-w-[100%] mx-auto`}>
        {/* Settings button */}
        {!isDownloading && !hideMenu && (
          <BlurFade delay={100}>
            <div className="relative h-10 overflow-hidden flex justify-end">
              {!isDownloading && (
                <ShareButton
                  setIsDownloading={setIsDownloading}
                  userData={userData!}
                  templateType={"linktree"}
                  shareContext={shareContext}
                />
              )}
            </div>
          </BlurFade>
        )}
        {/* Profile section */}
        <BlurFade delay={300}>
          <ProfileTotal userData={userData} />
        </BlurFade>
        {/* Navigation buttons - updated with real data */}
        <div className="space-y-4 max-w-md mx-auto my-10">
          {[
            {
              label: "Public Repos",
              value: userData.public_repos,
              delay: 500,
              icon: BookBookmark,
            },
            {
              label: "Followers",
              value: userData.followers,
              delay: 600,
              icon: Users,
            },
            {
              label: "Total Stars",
              value: userData.total_stars,
              delay: 700,
              icon: Star,
            },
            {
              label: "Total Commits",
              value: userData.commits,
              delay: 800,
              icon: GitCommit,
            },
          ].map((item) => (
            <BlurFade key={item.label} delay={item.delay}>
              <button className="w-full bg-white/90 text-black rounded-full py-4 px-6 gap-3 flex items-center">
                <HyperText className="text-sm font-normal flex-1 text-left ">
                  {item.label}
                </HyperText>
                <span className="text-sm ">
                  {typeof item.value === "number" ? (
                    <NumberTicker value={item.value} />
                  ) : (
                    item.value
                  )}
                </span>
                <item.icon size={22} />
              </button>
            </BlurFade>
          ))}
        </div>
        {/* Footer */}
        <BlurFade delay={1300}>
          <Footer showQrcode shareContext={shareContext} />
        </BlurFade>
      </div>
    </div>
  );
}
