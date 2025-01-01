import Image from 'next/image'
import { BlurFade } from '@/components/blur-fade'
import Logo from "@/public/logo.png"
import Preview from "@/public/preview.png"
import Preview2 from "@/public/preview2.png"
import Preview3 from "@/public/preview3.png"
import { InputUsername } from "@/components/InputUsername"


export default function Dashboard() {
  return (
    <div className="min-h-screen py-24 sm:py-0 sm:h-screen bg-gradient-to-b from-orange-600 via-orange-800 to-gray-900 text-white flex flex-col ">

      <div className="flex flex-col items-center gap-8 justify-center flex-1 text-center">
        {/* Profile section */}
        <BlurFade delay={200}>
          <h1 className='text-4xl font-bold'>Github Card</h1>
        </BlurFade>

        <BlurFade delay={400}>
          <h2 className='text-xl font-medium'>Create beautiful cards showcasing your GitHub stats and contributions</h2>
        </BlurFade>

        <BlurFade delay={500}>
          <div className="flex items-center mb-12 gap-4">
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

        <BlurFade delay={1500} className="flex w-full max-w-sm items-center gap-2 bg-white shadow-md rounded-lg p-2">
          <InputUsername />
        </BlurFade>


      </div>

      <div className='flex flex-col sm:flex-row items-center gap-8 justify-center'>
        <BlurFade delay={600} className='w-[335px] h-[360px] overflow-hidden rounded-t-lg shadow-xl'>
          <Image src={Preview} alt="Preview" width={335} height={504} />
        </BlurFade>
        <BlurFade delay={800} className='w-[335px] h-[360px] overflow-hidden rounded-t-lg shadow-xl'>
          <Image src={Preview2} alt="Preview" width={335} height={504} />
        </BlurFade>
        <BlurFade delay={1000} className='w-[335px] h-[360px] overflow-hidden rounded-t-lg shadow-xl'>
          <Image src={Preview3} alt="Preview" width={335} height={504} />
        </BlurFade>
      </div>

    </div>
  )
}

