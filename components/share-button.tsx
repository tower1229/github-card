"use client";

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
import { useState, useEffect } from "react";
import { ShareContextData } from "@/app/generate/page";
import { useSession } from "next-auth/react";

export function ShareButton({
  setIsDownloading,
  shareContext,
}: {
  setIsDownloading: (isDownloading: boolean) => void;
  shareContext?: ShareContextData;
}) {
  const [isGeneratingLink, setIsGeneratingLink] = useState(
    shareContext?.isGenerating || false
  );
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
      const fullUrl = `${shareContext.shareUrl}`;
      navigator.clipboard.writeText(fullUrl);
      toast.success("Share link copied to clipboard");
      return;
    }

    // If already generating, don't start again
    if (shareContext?.isGenerating || isGeneratingLink) {
      toast("Link is being generated, please wait...");
      return;
    }
  };

  useEffect(() => {
    setIsGeneratingLink(shareContext?.isGenerating || false);
  }, [shareContext?.isGenerating]);

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
