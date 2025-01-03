import { ProfileContributePage } from './profile-contribute-page'
import { ProfileLinktreePage } from './profile-linktree-page'
import type { Metadata } from 'next'

type Props = {
    params: Promise<{ username: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
    { params, searchParams }: Props,
): Promise<Metadata> {
    const username = (await params).username
    const template = (await searchParams).template


    console.log(template)

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

const templates = {
    contribute: ProfileContributePage,
    linktree: ProfileLinktreePage,
}


export default async function ProfilePage({ params, searchParams }: Props) {
    const username = (await params).username
    const template = (await searchParams).template as keyof typeof templates || 'contribute'

    const Component = templates[template] || templates.contribute
    return <Component username={username} />
}