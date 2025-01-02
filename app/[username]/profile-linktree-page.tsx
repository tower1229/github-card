'use client'
import Image from 'next/image'
import { BlurFade } from '@/components/blur-fade'
import { Footer } from '@/components/footer'
import { GitHubData } from '@/lib/types'
import { useState, useEffect } from 'react'
import { BingImg } from '@/components/bing-img'

export function ProfileLinktreePage({ username }: { username: string }) {
  const [userData, setUserData] = useState<GitHubData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!username) return
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/github/user/${username}`)
        const result = await response.json()
        if (result.success) {
          setUserData(result.data)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()

  }, [username])


  if (loading) return <div className="min-h-screen bg-gradient-to-b from-orange-600 via-orange-800 to-gray-900 text-white flex items-center justify-center">Loading...</div>
  if (!userData) return <div className="min-h-screen bg-gradient-to-b from-orange-600 via-orange-800 to-gray-900 text-white flex items-center justify-center">User not found</div>


  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-600 via-orange-800 to-gray-900 text-white px-4 py-8">
      <BingImg className='absolute left-0 top-0 w-full h-full' />

      {/* Profile section */}
      <BlurFade delay={300}>
        <div className="flex flex-col items-center mb-12">
          <div className="w-32 h-32 rounded-full overflow-hidden mb-6 relative">
            <Image
              src={userData.avatar_url}
              alt="Profile"
              width={128}
              height={128}
              className="object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold mb-2">{userData.name || userData.login}</h1>
          <p className="text-gray-200">{userData.bio || 'No bio available'}</p>
        </div>
      </BlurFade>

      {/* Navigation buttons - updated with real data */}
      <div className="space-y-4 max-w-md mx-auto mb-12">
        {[
          { label: 'Public Repos', value: userData.public_repos, delay: 500 },
          { label: 'Followers', value: userData.followers, delay: 600 },
          { label: 'Total Stars', value: userData.total_stars, delay: 700 },
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

