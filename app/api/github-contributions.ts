import { NextResponse } from 'next/server'

const GITHUB_USERNAME = 'tower1229' // Replace with the actual GitHub username

export async function GET() {
  const currentYear = new Date().getFullYear()
  const startDate = `${currentYear - 1}-01-01`
  const endDate = `${currentYear}-12-31`

  const query = `
    query($username: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $username) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `

  const variables = {
    username: GITHUB_USERNAME,
    from: startDate,
    to: endDate,
  }

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('GitHub API Error:', errorText)
      return NextResponse.json({ error: 'Failed to fetch GitHub data' }, { status: res.status })
    }

    const data = await res.json()

    if (!data.data || !data.data.user) {
      console.error('Unexpected GitHub API response:', data)
      return NextResponse.json({ error: 'Invalid GitHub API response' }, { status: 500 })
    }

    const contributions = data.data.user.contributionsCollection.contributionCalendar.weeks
      .flatMap((week: any) => week.contributionDays)
      .map((day: any) => ({
        date: day.date,
        count: day.contributionCount,
        level: day.contributionCount === 0 ? 0 : Math.min(Math.floor(day.contributionCount / 5) + 1, 4),
      }))

    return NextResponse.json(contributions)
  } catch (error) {
    console.error('Error fetching GitHub contributions:', error)
    return NextResponse.json({ error: 'Failed to fetch GitHub data' }, { status: 500 })
  }
}

