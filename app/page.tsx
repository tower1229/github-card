import Image from "next/image";
import { BlurFade } from "@/components/blur-fade";
import Logo from "@/public/logo.png";

import { TemplatePreview } from "@/components/template-preview";

export default function Dashboard() {
  return (
    <div className="min-h-screen text-center sm:py-0 sm:h-screen bg-gradient-to-b from-orange-600 via-orange-800 to-gray-900 text-white flex flex-col gap-8 items-center justify-center">
      {/* Profile section */}
      <BlurFade delay={200}>
        <h1 className="text-6xl font-bold pt-24">Github Card</h1>
      </BlurFade>

      <BlurFade delay={400}>
        <h2 className="text-2xl font-medium">
          Create beautiful cards showcasing your GitHub stats and contributions
        </h2>
      </BlurFade>

      <BlurFade delay={500}>
        <div className="flex items-center gap-4">
          <Image
            src={Logo}
            alt="Logo"
            width={40}
            height={40}
            className="object-cover rounded-full"
          />
          <a href={process.env.NEXT_PUBLIC_APP_URL} className="text-white">
            {process.env.NEXT_PUBLIC_APP_URL}
          </a>
        </div>
      </BlurFade>

      <BlurFade
        delay={600}
      >
        <TemplatePreview />
      </BlurFade>
    </div>
  );
}
