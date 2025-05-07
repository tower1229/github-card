import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/components/auth/auth-provider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://github-card.refined-x.com"
  ),
  title: {
    default: "Github Card",
    template: "%s | Github Card",
  },
  description:
    "Create beautiful cards showcasing your GitHub stats and contributions.",
  keywords: ["Github Card", "Github Stats", "Github Contributions"],
  icons: {
    icon: "/favicon/favicon.ico",
    apple: "/favicon/apple-touch-icon.png",
  },
  openGraph: {
    title: "Github Card",
    description:
      "Create beautiful cards showcasing your GitHub stats and contributions.",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Github Card",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/og.png`,
        width: 1400,
        height: 735,
        alt: "Github Card Preview",
      },
    ],
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Github Card",
    description:
      "Create beautiful cards showcasing your GitHub stats and contributions.",
    creator: "@tower1229",
    site: "@tower1229",
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/og.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
