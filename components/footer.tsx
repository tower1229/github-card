"use client";
import { GithubLogo } from "@phosphor-icons/react/dist/ssr";
import Qrcode from "qrcode";
import { cn } from "@/lib/utils";
import AnimatedGradientText from "@/components/ui/animated-gradient-text";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/logo.png";
import { BlurFade } from "./blur-fade";

export interface FooterProps {
  showQrcode?: boolean;
}

export function Footer({ showQrcode = false }: FooterProps) {
  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "Templates", href: "#templates" },
        { name: "Examples", href: "#examples" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "#" },
        { name: "GitHub", href: "https://github.com/tower1229/github-card" },
        { name: "Support", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About", href: "#" },
        { name: "Privacy", href: "#" },
        { name: "Terms", href: "#" },
      ],
    },
  ];

  useEffect(() => {
    if (showQrcode) {
      Qrcode.toCanvas(document.getElementById("canvas"), window.location.href, {
        margin: 2,
        width: 100,
      });
    }
  }, [showQrcode]);

  if (showQrcode) {
    return (
      <div className="z-10 flex min-h-40 flex-col items-center justify-center gap-4 p-4 mt-10">
        <canvas id="canvas"></canvas>
        <Link href="/">
          <AnimatedGradientText className="bg-black/40">
            <GithubLogo size={20} />
            <hr className="mx-2 h-4 w-px shrink-0 bg-gray-300" />{" "}
            <span
              className={cn(
                `inline animate-gradient bg-linear-to-r from-[#fa7b19] via-[#f0883e] to-[#fa7b19] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`
              )}
            >
              Github Card
            </span>
          </AnimatedGradientText>
        </Link>
      </div>
    );
  }

  return (
    <footer className="bg-[#161b22] border-t border-[#30363d]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <BlurFade delay={100}>
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Image
                  src={Logo}
                  alt="Logo"
                  width={30}
                  height={30}
                  className="object-cover rounded-full"
                />
                <span className="font-bold text-xl">GitHub Card</span>
              </Link>
              <p className="text-[#8b949e] mb-4">
                Create beautiful cards showcasing your GitHub stats and
                contributions.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://github.com/tower1229/github-card"
                  className="text-[#8b949e] hover:text-white"
                >
                  <GithubLogo size={20} />
                </a>
              </div>
            </div>
          </BlurFade>

          {footerLinks.map((section, index) => (
            <BlurFade key={index} delay={150 * (index + 1)}>
              <div>
                <h3 className="font-semibold mb-4 text-white">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.href}
                        className="text-[#8b949e] hover:text-white transition"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </BlurFade>
          ))}
        </div>

        <BlurFade delay={500}>
          <div className="border-t border-[#30363d] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-[#8b949e] text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} GitHub Card. All rights
              reserved.
            </p>
            <div className="flex items-center text-[#8b949e] text-sm">
              <AnimatedGradientText className="bg-black/40">
                <span
                  className={cn(
                    `inline animate-gradient bg-linear-to-r from-[#fa7b19] via-[#f0883e] to-[#fa7b19] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`
                  )}
                >
                  Made with ❤️ for the GitHub community
                </span>
              </AnimatedGradientText>
            </div>
          </div>
        </BlurFade>
      </div>
    </footer>
  );
}
