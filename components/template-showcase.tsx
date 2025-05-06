"use client";

import { BlurFade } from "./blur-fade";
import { Button } from "./ui/button";
import Image from "next/image";
import PreviewLinktree from "@/public/preview/linktree.png";
import PreviewContribute from "@/public/preview/contribute.png";
import PreviewFlomo from "@/public/preview/flomo.png";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function TemplateShowcase() {
  const router = useRouter();
  const [loadingTemplates, setLoadingTemplates] = useState<
    Record<string, boolean>
  >({});

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

  const handleTemplateClick = (templateValue: string) => {
    if (loadingTemplates[templateValue]) return;

    setLoadingTemplates((prev) => ({ ...prev, [templateValue]: true }));
    router.push(`/generate?template=${templateValue}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
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
                  <Button
                    className="bg-orange-600 hover:bg-orange-700 transition-all"
                    onClick={() => handleTemplateClick(template.value)}
                    disabled={loadingTemplates[template.value]}
                  >
                    {loadingTemplates[template.value] ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Use Template"
                    )}
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
