import { ProfileContributePage } from './profile-contribute-page'
import type { Metadata } from 'next'

type Props = {
    params: Promise<{ username: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
    { params }: Props,
): Promise<Metadata> {
    const username = (await params).username

    // optionally access and extend (rather than replace) parent metadata

    return {
        title: `${username}s Github Card`,
        description: `Create beautiful cards showcasing your GitHub stats and contributions`,
        openGraph: {
            title: `${username}s Github Card`,
            description: `Create beautiful cards showcasing your GitHub stats and contributions`,
            images: [`/og.png`],
        },
        twitter: {
            title: `${username}s Github Card`,
            description: `Create beautiful cards showcasing your GitHub stats and contributions`,
            images: [`/og.png`],
        },
    }
}

export default async function ProfilePage({ params }: Props) {
    const username = (await params).username

    return <ProfileContributePage username={username} />
}