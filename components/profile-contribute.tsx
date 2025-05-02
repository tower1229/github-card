import { GitHubCalendarWrapper } from "@/components/github-calendar";

export function ProfileContribute({
  username,
  years = 1,
}: {
  username: string;
  years?: number;
}) {
  return (
    <>
      {/* GitHub Calendars */}
      {Array.from({ length: years }, (_, i) => {
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
  );
}
