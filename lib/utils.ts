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
  const imageWidth = ContentWidth;
  // Set dimensions to half of original
  tempCanvas.width = imageWidth;
  tempCanvas.height = canvas.height / 2;

  // Draw scaled image
  if (tempCtx) {
    tempCtx.drawImage(
      canvas,
      (canvas.width - imageWidth * 2) / 2,
      0,
      imageWidth * 2,
      canvas.height,
      0,
      0,
      tempCanvas.width,
      tempCanvas.height
    );

    // Convert scaled canvas to data URL
    const url = tempCanvas.toDataURL("image/png");

    // Create and trigger download link
    const link = document.createElement("a");
    link.href = url;
    link.download = "image.png";
    link.click();
  }
}
