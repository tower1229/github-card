/* eslint-disable @next/next/no-img-element */
"use client";
import { BlurFade } from "@/components/blur-fade";
import { Footer } from "@/components/footer";
import { useEffect, useState } from "react";
import { ShareButton } from "@/components/share-button";
import { ProfileContribute } from "@/components/profile-contribute";
import { BingImg } from "@/components/bing-img";
import NumberTicker from "@/components/ui/number-ticker";
import AnimatedGradientText from "@/components/ui/animated-gradient-text";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { GitHubData } from "@/lib/types";
import { ShareContextData } from "@/app/generate/page";

interface ProfileFlomoPageProps {
  username: string;
  hideMenu?: boolean;
  sharedData?: GitHubData;
  onDownloadStateChange?: (downloading: boolean) => void;
  shareContext?: ShareContextData;
  onUserDataLoaded?: (data: GitHubData) => void;
}

export function ProfileFlomoPage({
  username,
  hideMenu = false,
  sharedData,
  onDownloadStateChange,
  shareContext,
  onUserDataLoaded,
}: ProfileFlomoPageProps) {
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
                  templateType={"flomo"}
                  shareContext={shareContext}
                />
              )}
            </div>
          </BlurFade>
        )}
        {/* header */}
        <BlurFade delay={200}>
          <div className="flex gap-2 items-center py-4 mb-8">
            <a
              href={`https://github.com/${userData.login}`}
              target="_blank"
              className="w-10 h-10 rounded-lg relative overflow-hidden"
            >
              <img
                src={userData.avatar_url}
                alt="Profile"
                className="object-cover w-full h-full"
              />
            </a>
            <h1 className="text-xl font-semibold flex-1 ">
              {userData.name || userData.login}
            </h1>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-white text-xl font-bold"
            >
              {new Date().toISOString().slice(0, 7)}
            </motion.span>
          </div>
        </BlurFade>

        <ProfileContribute username={username} />

        <div
          className="grid grid-cols-2 gap-4 my-10 py-4 relative border-t border-b border-t-gray-300/30 border-b-gray-800/60
        before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px] before:bg-gray-800/60 
        after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-gray-300/30"
        >
          {[
            {
              label: "Public Repos",
              value: userData.public_repos,
            },
            {
              label: "Followers",
              value: userData.followers,
            },
            {
              label: "Total Stars",
              value: userData.total_stars,
            },
            {
              label: "Total Commits",
              value: userData.commits,
            },
            {
              label: "Contribution Grade",
              value: userData.contribution_grade,
            },
          ].map((item) => (
            <div key={item.label} className="pl-2">
              {typeof item.value === "number" ? (
                <NumberTicker
                  value={item.value}
                  className="text-white text-2xl font-bold"
                />
              ) : (
                <AnimatedGradientText className="bg-black w-10 h-10 mb-2 float-left">
                  <span
                    className={cn(
                      ` animate-gradient text-xl font-bold bg-linear-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`
                    )}
                  >
                    {item.value}
                  </span>
                </AnimatedGradientText>
              )}
              <div className="text-sm font-normal flex-1 text-left text-gray-300 clear-both">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {
          <BlurFade delay={1300}>
            <Footer showQrcode showStyle={2} shareContext={shareContext} />
          </BlurFade>
        }
      </div>
    </div>
  );
}
