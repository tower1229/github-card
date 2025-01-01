import { ProfileContribute } from '@/components/profile-contribute'
import type { Metadata, ResolvingMetadata } from 'next'

type Props = {
    params: Promise<{ username: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const username = (await params).username

    // optionally access and extend (rather than replace) parent metadata
    const previousImages = (await parent).openGraph?.images || []

    return {
        title: `${username}s Github Card`,
        description: `Create beautiful cards showcasing your GitHub stats and contributions`,
        openGraph: {
            title: `${username}s Github Card`,
            description: `${username}s Github Card`,
            images: ['/og.png', ...previousImages],
        }
    }
}

export default async function ProfilePage({ params }: Props) {
    const username = (await params).username

    return <ProfileContribute username={username} />
}