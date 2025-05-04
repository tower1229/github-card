import {
  DotsThree,
  ImageSquare,
  Link as LinkIcon,
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
import Link from "next/link";
import { useState } from "react";
import { GitHubData } from "@/lib/types";
import { ShareContextData } from "@/app/generate/page";
import { useSession } from "next-auth/react";
import { authFetch } from "@/lib/auth";

export function ShareButton({
  setIsDownloading,
  userData,
  templateType = "contribute",
  shareContext,
}: {
  setIsDownloading: (isDownloading: boolean) => void;
  userData: GitHubData;
  templateType?: string;
  shareContext?: ShareContextData;
}) {
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const { status } = useSession();

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
    // Check if user is authenticated first
    if (status !== "authenticated") {
      toast.error("You need to sign in to generate a share link");
      return;
    }

    // If we already have a share URL, just copy it
    if (shareContext?.shareUrl) {
      const fullUrl = `${window.location.origin}${shareContext.shareUrl}`;
      navigator.clipboard.writeText(fullUrl);
      toast.success("Share link copied to clipboard");
      return;
    }

    // If already generating, don't start again
    if (shareContext?.isGenerating || isGeneratingLink) {
      toast("Link is being generated, please wait...");
      return;
    }

    try {
      setIsGeneratingLink(true);

      // Call API to create share link
      const response = await authFetch("/api/share-links", {
        method: "POST",
        body: JSON.stringify({
          cardData: userData,
          templateType: templateType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create share link");
      }

      // Build complete URL with origin
      const fullUrl = `${window.location.origin}${data.shareUrl}`;

      // Copy generated share link to clipboard
      await navigator.clipboard.writeText(fullUrl);

      toast.success("Share link copied to clipboard");
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

            <DrawerClose asChild>
              <Button
                variant="secondary"
                onClick={generateAndCopyLink}
                className="w-[200px] flex items-center justify-center gap-2 h-10"
              >
                <LinkIcon size={16} />
                {shareContext?.isGenerating || isGeneratingLink
                  ? "Generating..."
                  : "Copy link"}
              </Button>
            </DrawerClose>

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
