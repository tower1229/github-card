import Image from 'next/image'
import { DotsThree, GithubLogo } from '@phosphor-icons/react/dist/ssr'
import { BlurFade } from '@/components/blur-fade'
import { GitHubCalendarWrapper } from '@/components/github-calendar'
import avatar from "@/images/avatar.jpg"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-600 via-orange-800 to-gray-900 text-white px-4 py-8">
      {/* Settings button */}
      <BlurFade delay={100}>
        <div className="flex justify-end mb-4">
          <button className="p-2 rounded-full bg-white/40 hover:bg-white/10">
            <DotsThree size={24} weight="bold" />
          </button>
        </div>
      </BlurFade>

      {/* Profile section */}
      <BlurFade delay={300}>
        <div className="flex flex-col items-center mb-12">
          <div className="w-32 h-32 rounded-full overflow-hidden mb-6 relative">
            <Image
              src={avatar}
              alt="Profile"
              width={128}
              height={128}
              className="object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold mb-2">tower1229</h1>
          <p className="text-gray-200">Be water my friend</p>
        </div>
      </BlurFade>


      {/* GitHub Calendar */}
      <GitHubCalendarWrapper username="tower1229" year="2024" />

      {/* GitHub Calendar */}
      <GitHubCalendarWrapper username="tower1229" year="2023" />

      {/* GitHub Calendar */}
      <GitHubCalendarWrapper username="tower1229" year="2022" />


      {/* Footer */}
      <BlurFade delay={1300}>
        <div className="text-center mt-10">
          <a href='https://github.com/tower1229' target='_blank' className="text-sm text-gray-300 hover:text-white transition-colors inline-flex items-center gap-2">
            <GithubLogo size={20} /> Github Card
          </a>
        </div>
      </BlurFade>
    </div>
  )
}

