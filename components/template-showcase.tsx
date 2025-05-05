"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BlurFade } from "./blur-fade";
import { Button } from "./ui/button";
import Image from "next/image";
import PreviewLinktree from "@/public/preview/linktree.png";
import PreviewContribute from "@/public/preview/contribute.png";
import PreviewFlomo from "@/public/preview/flomo.png";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function TemplateShowcase() {
  const { data: session } = useSession();
  const router = useRouter();
  const [buttonLoading, setButtonLoading] = useState(false);

  const handleTemplateAction = (templateValue: string) => {
    if (session) {
      setButtonLoading(true);
      router.push(`/generate?template=${templateValue}`);
    } else {
      // 如果未登录，触发登录流程
      signIn("github", { callbackUrl: "/#templates" });
    }
  };

  const templates = [
    {
      name: "Linktree",
      description: "A beautiful card showcasing your social links",
      image: PreviewLinktree,
      value: "linktree",
    },
    {
      name: "Contribution",
      description: "Highlight your GitHub contributions and stats",
      image: PreviewContribute,
      value: "contribute",
    },
    {
      name: "Flomo",
      description: "A beautiful card showcasing your social links",
      image: PreviewFlomo,
      tag: "New",
      value: "flomo",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[10px] max-w-7xl mx-auto">
      {templates.map((template, index) => (
        <BlurFade key={index} delay={200 * (index + 1)}>
          <div className="bg-gray-900 rounded-lg overflow-hidden relative group">
            {template.tag && (
              <div className="absolute top-2 right-4 bg-orange-600 text-white text-sm px-3 py-1 rounded-full z-10">
                {template.tag}
              </div>
            )}
            <div className="relative w-full pb-[100%] sm:pb-[177.77%] bg-white/90 overflow-hidden">
              <Image
                src={template.image}
                alt={template.name}
                fill
                className="absolute inset-0 w-full object-contain transform group-hover:scale-125 transition-transform duration-300"
              />
              {/* text */}
              <div className="absolute bottom-0 sm:-bottom-[200px] left-0 right-0 p-6 bg-black/80 group-hover:bottom-0 transition-bottom duration-300">
                <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
                <p className="text-gray-300 mb-4">{template.description}</p>
                <div className="flex space-x-3">
                  {session ? (
                    <Link
                      href={`/generate?template=${template.value}`}
                      prefetch
                    >
                      <Button className="bg-orange-600 hover:bg-orange-700">
                        Use Template
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      className="bg-orange-600 hover:bg-orange-700"
                      onClick={() => handleTemplateAction(template.value)}
                    >
                      {buttonLoading && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      Use Template
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => handleTemplateAction(template.value)}
                  >
                    {buttonLoading && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    Preview
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </BlurFade>
      ))}
    </div>
  );
}
