import Image from "next/image";
import { BlurFade } from "@/components/blur-fade";
import Logo from "@/public/logo.png";
import Meteors from "@/components/ui/meteors";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye, Github, Calendar, Star } from "lucide-react";
import { TemplateShowcase } from "@/components/template-showcase";
import { Features } from "@/components/features";
import { QuickStart } from "@/components/quick-start";
import { SocialProof } from "@/components/social-proof";
import { Footer } from "@/components/footer";
import GridPattern from "@/components/ui/grid-pattern";
import DataFlow from "@/components/ui/data-flow";

export default function HomePage() {
  return (
    <div className="relative bg-[#0d1117] text-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-[#0d1117]/95 backdrop-blur-sm z-50 border-b border-[#21262d]">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="text-xl font-bold flex items-center gap-2"
            >
              <Image
                src={Logo}
                alt="Logo"
                width={30}
                height={30}
                className="object-cover rounded-full"
              />
              GitHub Card
            </Link>
            <div className="hidden md:flex space-x-6">
              <a
                href="#features"
                className="text-[#c9d1d9] hover:text-white transition"
              >
                Features
              </a>
              <a
                href="#templates"
                className="text-[#c9d1d9] hover:text-white transition"
              >
                Templates
              </a>
              <a
                href="#examples"
                className="text-[#c9d1d9] hover:text-white transition"
              >
                Examples
              </a>
            </div>
          </div>
          <Button className="flex items-center px-4 py-2 bg-[#fa7b19] hover:bg-[#e76b0a] transition transform hover:scale-105">
            <Github className="w-5 h-5 mr-2" />
            Sign in with GitHub
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background animations */}
        <GridPattern />
        <DataFlow />
        <Meteors number={20} />

        <div className="container mx-auto px-4 text-center relative z-10">
          <BlurFade delay={200}>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#fa7b19] to-[#f0883e]">
              Create Beautiful GitHub Profile Cards
            </h1>
          </BlurFade>

          <BlurFade delay={300}>
            <p className="text-xl md:text-2xl text-[#c9d1d9] mb-8 max-w-2xl mx-auto">
              Transform your GitHub profile into an eye-catching card that
              showcases your achievements and personality.
            </p>
          </BlurFade>

          <BlurFade delay={400}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button className="px-8 py-3 bg-[#fa7b19] hover:bg-[#e76b0a] text-white rounded-lg font-medium transition transform hover:scale-105">
                Get Started
              </Button>
              <Button
                variant="outline"
                className="px-8 py-3 border border-[#30363d] bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg font-medium transition transform hover:scale-105"
              >
                View Examples
              </Button>
            </div>
          </BlurFade>

          <BlurFade delay={500}>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-[#8b949e]">
              <div className="flex items-center">
                <Eye className="w-5 h-5 mr-2 text-[#fa7b19]" />
                <span>50K+ Users</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-[#fa7b19]" />
                <span>100K+ Cards Created</span>
              </div>
              <div className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-[#fa7b19]" />
                <span>4.8/5 Rating</span>
              </div>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Features Section */}
      <Features />

      {/* Quick Start Section */}
      <QuickStart />

      {/* Templates Section */}
      <section id="templates" className="py-20 bg-[#161b22]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Choose Your Template
          </h2>
          <TemplateShowcase />
        </div>
      </section>

      {/* Social Proof Section */}
      <SocialProof />

      {/* Footer */}
      <Footer />
    </div>
  );
}
