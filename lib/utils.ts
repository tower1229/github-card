import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ContentWidth } from "./constant";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// save canvas to image (at half size)
export function downloadImage(canvas: HTMLCanvasElement) {
  // Create a temporary canvas for scaling
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  // Add 40px to the width to account for the border
  const ImageWidth = ContentWidth + 40;
  const isWide =
    canvas.width / window.devicePixelRatio / window.devicePixelRatio >
    ImageWidth;
  // Set dimensions based on whether the image is wide
  tempCanvas.width = isWide
    ? ImageWidth * window.devicePixelRatio
    : canvas.width / window.devicePixelRatio;
  tempCanvas.height = canvas.height / window.devicePixelRatio;

  console.log("canvas info:", canvas.width, canvas.height, isWide);

  // Draw scaled image
  if (tempCtx) {
    if (isWide) {
      // For wide images, center the content horizontally
      const sourceX =
        (canvas.width -
          ImageWidth * window.devicePixelRatio * window.devicePixelRatio) /
        2;
      tempCtx.drawImage(
        canvas,
        sourceX,
        0,
        ImageWidth * window.devicePixelRatio * window.devicePixelRatio,
        canvas.height,
        0,
        0,
        ImageWidth * window.devicePixelRatio,
        tempCanvas.height
      );
    } else {
      // For normal width images, scale normally
      tempCtx.drawImage(
        canvas,
        0,
        0,
        canvas.width,
        canvas.height,
        0,
        0,
        tempCanvas.width,
        tempCanvas.height
      );
    }

    // Convert scaled canvas to data URL
    const url = tempCanvas.toDataURL("image/png");

    // Create and trigger download link
    const link = document.createElement("a");
    link.href = url;
    link.download = `github-card-${new Date().getTime()}.png`;
    link.click();
  }
}
