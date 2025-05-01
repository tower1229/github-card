"use client";

import { BlurFade } from "./blur-fade";
import Image from "next/image";

export function SocialProof() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Senior Developer @ Google",
      image: "https://github.com/identicons/user1.png",
      quote:
        "The best tool I've found for creating an impressive GitHub profile. Simple yet powerful!",
    },
    {
      name: "Mark Thompson",
      role: "Tech Lead @ Microsoft",
      image: "https://github.com/identicons/user2.png",
      quote:
        "Transformed my GitHub profile from boring to professional in minutes!",
    },
    {
      name: "Lisa Rodriguez",
      role: "Open Source Contributor",
      image: "https://github.com/identicons/user3.png",
      quote:
        "The templates are beautiful and the customization options are endless!",
    },
  ];

  return (
    <section id="examples" className="py-20 bg-[#0d1117]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Trusted by Developers
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <BlurFade key={index} delay={200 * (index + 1)}>
              <div className="bg-[#161b22] p-6 rounded-lg border border-[#30363d]">
                <div className="flex items-center mb-4">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-[#8b949e]">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-[#c9d1d9]">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
