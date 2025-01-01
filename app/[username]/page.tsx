import { ProfileClient } from '@/components/profile-client'

type Props = {
    params: {
        username: string
    }
}

export async function generateMetadata({ params }: Props) {
    const { username } = params

    return {
        title: `${username} `,
        description: username,
        openGraph: {
            title: `${username} `,
            description: username,
            images: [
                {
                    url: `https://github-card.vercel.app/og.png`,
                }
            ]
        }
    }
}

export default function ProfilePage({ params }: Props) {
    const { username } = params
    return <ProfileClient username={username} />
}