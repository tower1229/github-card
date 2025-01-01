import { ImageResponse } from 'next/og'
import { ProfileTotal } from '@/components/profile-total'

export const runtime = 'edge'

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

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/github/user/${username}`)
    const result = await response.json()

    if (result.success) {
        const userData: GitHubData = result.data
        return new ImageResponse(
            (
                <div
                    style={{
                        display: 'block',
                        width: '1200px',
                        height: '630px',
                        overflow: 'hidden',
                    }}
                >
                    <ProfileTotal userData={userData} />

                </div>
            ),
            {
                width: 1200,
                height: 630,
            },
        )

    }

    return new ImageResponse(
        (
            <div
                style={{
                    display: 'block',
                    width: '1200px',
                    height: '630px',
                    overflow: 'hidden',
                }}
            >
                123
            </div>
        ),
        {
            width: 1200,
            height: 630,
        },
    )
}