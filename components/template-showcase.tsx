"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BlurFade } from "./blur-fade";
import { Button } from "./ui/button";
import Image from "next/image";
import PreviewLinktree from "@/public/preview/linktree.png";
import PreviewContribute from "@/public/preview/contribute.png";

export function TemplateShowcase() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleTemplateAction = (templateValue: string) => {
    if (session?.user?.username) {
      router.push(`/${session.user.username}?template=${templateValue}`);
    } else {
      // TODO: preview template
    }
  };

  const templates = [
    {
      name: "Linktree",
      description: "A beautiful card showcasing your social links",
      image: PreviewLinktree,
      tag: "Popular",
      value: "linktree",
    },
    {
      name: "Contribution",
      description: "Highlight your GitHub contributions and stats",
      image: PreviewContribute,
      tag: "New",
      value: "contribute",
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      {templates.map((template, index) => (
        <BlurFade key={index} delay={200 * (index + 1)}>
          <div className="bg-gray-900 rounded-lg overflow-hidden relative group">
            {template.tag && (
              <div className="absolute top-4 right-4 bg-orange-600 text-white text-sm px-3 py-1 rounded-full z-10">
                {template.tag}
              </div>
            )}
            <div className="relative h-60 overflow-hidden">
              <Image
                src={template.image}
                alt={template.name}
                className="w-full transform group-hover:scale-105 transition-transform duration-300"
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
              <p className="text-gray-400 mb-4">{template.description}</p>
              <div className="flex space-x-3">
                <Button
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={() => handleTemplateAction(template.value)}
                >
                  Use Template
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleTemplateAction(template.value)}
                >
                  Preview
                </Button>
              </div>
            </div>
          </div>
        </BlurFade>
      ))}
    </div>
  );
}
