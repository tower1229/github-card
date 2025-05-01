"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { BlurFade } from "./blur-fade";
import { CheckCheck } from "lucide-react";

export function QuickStart() {
  const { data: session } = useSession();

  const steps = [
    {
      number: 1,
      title: "Sign in with GitHub",
      description: "Connect your GitHub account to get started",
      link: "/",
      isCompleted: !!session,
    },
    {
      number: 2,
      title: "Choose a Template",
      description: "Select from our beautiful template collection",
      link: "#templates",
      isCompleted: false,
    },
    {
      number: 3,
      title: "Share & Export",
      description: "Make it yours and publish to your profile",
      link: session?.user?.username
        ? `/${session.user.username}?template=contribute`
        : "#templates",
      isCompleted: false,
    },
  ];

  return (
    <section className="py-20 bg-[#161b22]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Get Started in 3 Easy Steps
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <BlurFade key={index} delay={200 * (index + 1)}>
              <Link href={step.link} className="block">
                <div className="text-center group">
                  <div
                    className={`w-16 h-16 ${
                      step.isCompleted ? "bg-green-600" : "bg-[#fa7b19]"
                    } rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform`}
                  >
                    {step.isCompleted ? (
                      <CheckCheck className="text-white w-8 h-8" />
                    ) : (
                      <span className="text-2xl font-bold">{step.number}</span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-[#8b949e]">{step.description}</p>
                </div>
              </Link>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
