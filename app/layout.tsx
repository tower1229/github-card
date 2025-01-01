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
  description: 'Create beautiful cards showcasing your GitHub stats and contributions.',
  keywords: ['Github Card', 'Github Stats', 'Github Contributions'],
  icons: {
    icon: '/favicon/favicon.ico',
    apple: '/favicon/apple-touch-icon.png',

  },
  openGraph: {
    title: 'Github Card',
    description: 'Create beautiful cards showcasing your GitHub stats and contributions.',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Github Card',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/og.png`,
        width: 1200,
        height: 630,
        alt: 'Github Card Preview',
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
  twitter: {
    card: 'summary_large_image',
    title: 'Github Card',
    description: 'Create beautiful cards showcasing your GitHub stats and contributions.',
    creator: '@tower1229',
    site: '@tower1229',
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/og.png`],
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

