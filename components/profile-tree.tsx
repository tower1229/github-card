import Image from 'next/image'
import { BlurFade } from '@/components/blur-fade'
import avatar from "@/public/avatar.jpg"
import { Footer } from '@/components/footer'

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-600 via-orange-800 to-gray-900 text-white px-4 py-8">


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

      {/* Navigation buttons - updated with real data */}
      <div className="space-y-4 max-w-md mx-auto mb-12">
        {[
          { label: 'Public Repos', value: 100, delay: 500 },
          { label: 'Followers', value: 100, delay: 600 },
          { label: 'Total Stars', value: 100, delay: 700 },
        ].map((item) => (
          <BlurFade key={item.label} delay={item.delay}>
            <button
              className="w-full bg-white text-black rounded-full py-4 px-6 flex justify-between items-center hover:bg-gray-100 transition-colors"
            >
              <span className="text-lg font-medium">{item.label}</span>
              <span className="text-lg font-medium">{item.value}</span>
            </button>
          </BlurFade>
        ))}
      </div>


      {/* Footer */}
      <BlurFade delay={1300}>
        <Footer />
      </BlurFade>
    </div>
  )
}
