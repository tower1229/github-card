import { GitHubCalendarWrapper } from '@/components/github-calendar'

export function ProfileContribute({ username }: { username: string }) {

    return (
        <>

            {/* GitHub Calendars */}
            {Array.from({ length: 3 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                    <GitHubCalendarWrapper
                        key={year}
                        username={username}
                        year={year.toString()}
                    />
                );
            })}

        </>
    )
}
