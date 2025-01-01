'use client'
import Image from 'next/image'
import { BlurFade } from '@/components/blur-fade'
import { Footer } from '@/components/footer'
import { useEffect, useState } from 'react'
import { ShareButton } from '@/components/ShareButton';
import { ProfileContribute } from '@/components/profile-contribute'
import { ProfileTotal } from '@/components/profile-total'

interface GitHubData {
    login: string
    name: string
    avatar_url: string
    bio: string
    public_repos: number
    followers: number
    total_stars: number
    contribution_grade: string
}

export function ProfileContributePage({ username }: { username: string }) {
    const [userData, setUserData] = useState<GitHubData | null>(null)
    const [loading, setLoading] = useState(true)
    const [bgUrl, setBgUrl] = useState<string | null>(null)

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

        const fetchBgUrl = async () => {
            try {
                const response = await fetch('/api/background')
                const data = await response.json()
                console.log(data)
                if (data.success) {
                    setBgUrl(data.url)
                }
            } catch (error) {
                console.error('Error fetching background URL:', error)
            }
        }

        fetchBgUrl()

    }, [username])

    const [isDownloading, setIsDownloading] = useState(false)


    if (loading) return <div className="min-h-screen bg-gradient-to-b from-orange-600 via-orange-800 to-gray-900 text-white flex items-center justify-center">Loading...</div>
    if (!userData) return <div className="min-h-screen bg-gradient-to-b from-orange-600 via-orange-800 to-gray-900 text-white flex items-center justify-center">User not found</div>

    return (
        <div className="relative min-h-screen  text-white sm:px-4 sm:py-8" >
            <Image src={bgUrl || `https://www.bing.com/th?id=OHR.Rivendell_ZH-CN6669549862_1920x1080.jpg`} alt="Background" fill className='absolute inset-0 object-cover w-full h-full' />

            <div className={`relative z-10 w-content mx-auto ${isDownloading ? 'bg-gray-900/70' : 'bg-gray-900/20'} backdrop-blur-lg sm:rounded-lg p-4 pt-8`}>
                {/* Settings button */}
                {!isDownloading && <BlurFade delay={100}>
                    <div className="flex justify-end mb-4 gap-2">
                        <ShareButton setIsDownloading={setIsDownloading} />
                    </div>
                </BlurFade>}
                <BlurFade delay={200}>
                    <ProfileTotal userData={userData} />
                </BlurFade>

                <ProfileContribute username={username} />

                {/* Footer */}
                {<BlurFade delay={1300}>
                    <Footer showQrcode={isDownloading} />
                </BlurFade>}

            </div>
        </div >
    )
}
