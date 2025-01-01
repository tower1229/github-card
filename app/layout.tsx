import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Github Card',
    template: '%s | Github Card'
  },
  description: 'Github Card',
  keywords: ['Github Card'],
  openGraph: {
    title: 'Github Card',
    description: 'Github Card',
    url: 'https://github-card.vercel.app',
    siteName: 'Github Card',
    images: [
      {
        url: 'https://github-card.vercel.app/og.png',
      }
    ],
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}

