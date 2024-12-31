'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface BlurFadeProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function BlurFade({ children, delay = 0, className }: BlurFadeProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={cn(
        'transition-all duration-700 ease-out',
        isVisible
          ? 'opacity-100 blur-none translate-y-0'
          : 'opacity-0 blur-sm translate-y-4',
        className
      )}
    >
      {children}
    </div>
  )
}

