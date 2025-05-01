"use client";

import { BlurFade } from "./blur-fade";
import { Paintbrush, Eye, Share2 } from "lucide-react";

export function Features() {
  const features = [
    {
      icon: Paintbrush,
      title: "Beautiful Templates",
      description:
        "Choose from a variety of professionally designed templates and customize them to match your style.",
    },
    {
      icon: Eye,
      title: "Real-time Preview",
      description:
        "See your changes instantly with our live preview feature. What you see is what you get.",
    },
    {
      icon: Share2,
      title: "Share and Export",
      description:
        "Share your card link with one click or export high-quality images to showcase your profile easily.",
    },
  ];

  return (
    <section id="features" className="py-20 bg-[#0d1117]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Core Features
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <BlurFade key={index} delay={200 * (index + 1)}>
              <div className="bg-[#161b22] p-6 rounded-lg border border-[#30363d]">
                <div className="w-12 h-12 bg-[#fa7b19] rounded-lg flex items-center justify-center mb-4">
                  {<feature.icon className="w-6 h-6" />}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-[#8b949e]">{feature.description}</p>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
