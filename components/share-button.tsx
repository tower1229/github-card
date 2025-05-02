import {
  DotsThree,
  ImageSquare,
  Link as LinkIcon,
  Check,
  House,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "./ui/drawer";
import { toCanvas } from "html-to-image";
import { downloadImage } from "@/lib/utils";
import toast from "react-hot-toast";
import { AnimatedSubscribeButton } from "@/components/ui/animated-subscribe-button";
import Link from "next/link";
import { useState } from "react";
import { GitHubData } from "@/lib/types";

export function ShareButton({
  setIsDownloading,
  userData,
  templateType = "contribute",
}: {
  setIsDownloading: (isDownloading: boolean) => void;
  userData: GitHubData;
  templateType?: string;
}) {
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const saveAsImage = () => {
    setIsDownloading(true);
    setTimeout(() => {
      const node = document.body;
      if (node) {
        toCanvas(node, {
          canvasHeight: node.clientHeight * window.devicePixelRatio,
          canvasWidth: node.clientWidth * window.devicePixelRatio,
        })
          .then(function (canvas: HTMLCanvasElement) {
            downloadImage(canvas);
          })
          .catch(function (error) {
            console.error("Error saving image:", error);
          })
          .finally(() => {
            setIsDownloading(false);
          });
      } else {
        throw new Error("Node not found");
      }
    }, 50);
  };

  const generateAndCopyLink = async () => {
    if (isGeneratingLink) return; // 防止重复点击

    try {
      setIsGeneratingLink(true);

      // 调用API创建分享链接
      const response = await fetch("/api/share-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardData: userData,
          templateType: templateType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create share link");
      }

      const data = await response.json();

      // 复制生成的分享链接到剪贴板
      navigator.clipboard.writeText(data.shareUrl);

      const toastMessage = data.isExisting
        ? "Existing share link copied to clipboard"
        : "Share link copied to clipboard";
      toast.success(toastMessage);
    } catch (error) {
      console.error("Error generating share link:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate share link"
      );
    } finally {
      setIsGeneratingLink(false);
    }
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button
          className="p-2 rounded-full bg-white/40 hover:bg-white/10"
          title="Share"
        >
          <DotsThree size={24} weight="bold" />
        </button>
      </DrawerTrigger>

      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="text-center">Share GitHub Card</DrawerTitle>
          </DrawerHeader>

          <div className="flex flex-col gap-4 p-4 items-center">
            <DrawerClose asChild>
              <Button
                onClick={saveAsImage}
                className="w-[200px] flex items-center justify-center gap-2 h-10"
              >
                <ImageSquare size={20} />
                Save as Image
              </Button>
            </DrawerClose>

            <div onClick={generateAndCopyLink}>
              <AnimatedSubscribeButton
                buttonColor="#171717"
                buttonTextColor="#ffffff"
                subscribeStatus={false}
                initialText={
                  <span className="group inline-flex items-center gap-2 text-sm font-normal">
                    <LinkIcon size={16} />
                    {isGeneratingLink ? "Generating..." : "Copy link"}
                  </span>
                }
                changeText={
                  <span className="group inline-flex items-center gap-2 text-sm font-normal">
                    <Check size={16} />
                    Copied
                  </span>
                }
              />
            </div>

            <DrawerClose asChild>
              <Link href="/">
                <Button
                  variant="outline"
                  className="w-[200px] flex items-center justify-center gap-2 h-10"
                >
                  <House size={20} />
                  Back to Home
                </Button>
              </Link>
            </DrawerClose>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
