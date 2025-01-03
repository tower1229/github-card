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

export function ProfileLinktreePage({ username }: { username: string }) {
  const [userData, setUserData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;

    const abortController = new AbortController();

    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/github/user/${username}`, {
          signal: abortController.signal,
        });
        const result = await response.json();
        if (result.success) {
          setUserData(result.data);
        }
      } catch (error: unknown) {
        // 忽略已中止的请求错误
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    // 清理函数：组件卸载或 username 改变时中止请求
    return () => {
      abortController.abort();
    };
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

      <div className={`relative z-10 w-content max-w-[100%] mx-auto`}>
        {/* Settings button */}
        <BlurFade delay={100}>
          <div className="relative h-10 overflow-hidden flex justify-end">
            {!isDownloading && (
              <ShareButton setIsDownloading={setIsDownloading} />
            )}
          </div>
        </BlurFade>
        {/* Profile section */}
        <BlurFade delay={300}>
          <ProfileTotal userData={userData} />
        </BlurFade>
        {/* Navigation buttons - updated with real data */}
        <div className="space-y-4 max-w-md mx-auto my-10">
          {[
            { label: "Public Repos", value: userData.public_repos, delay: 500 },
            { label: "Followers", value: userData.followers, delay: 600 },
            { label: "Total Stars", value: userData.total_stars, delay: 700 },
            {
              label: "Total Commits",
              value: userData.commits,
              delay: 800,
            },
          ].map((item) => (
            <BlurFade key={item.label} delay={item.delay}>
              <button className="w-full bg-white text-black rounded-full py-4 px-6 flex justify-between items-center hover:bg-gray-100 transition-colors">
                <HyperText className="text-sm">{item.label}</HyperText>
                <span className="text-lg">
                  {typeof item.value === "number" ? (
                    <NumberTicker value={item.value} />
                  ) : (
                    item.value
                  )}
                </span>
              </button>
            </BlurFade>
          ))}
        </div>
        {/* Footer */}
        <BlurFade delay={1300}>
          <Footer showQrcode={isDownloading} />
        </BlurFade>
      </div>
    </div>
  );
}
