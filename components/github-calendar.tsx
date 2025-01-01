'use client'

import React from 'react'
import GitHubCalendar from 'react-github-calendar'
import { BlurFade } from './blur-fade'

interface GitHubCalendarProps {
  username: string
  year?: string
}

export function GitHubCalendarWrapper({ username, year }: GitHubCalendarProps) {
  return (
    <BlurFade delay={1100}>
      <div className="max-w-2xl mx-auto mt-8 bg-white/10 rounded-lg p-4">
        <GitHubCalendar
          username={username}
          colorScheme='dark'
          fontSize={12}
          blockSize={8}
          blockMargin={3}
          year={year ? parseInt(year) : undefined}
        />
      </div>
    </BlurFade>
  )
}

