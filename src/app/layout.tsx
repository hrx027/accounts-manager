import { type Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import ConvexClerkProvider from '@/components/providers/ConvexClerkProvider'
import { Toaster } from '@/components/ui/sonner'
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Stake Manager',
  description: 'Manage your stake accounts and bets efficiently. Track your performance, analyze your betting history, and maximize your returns.',
  keywords: ['stake management', 'betting', 'gambling', 'stake accounts', 'bet tracking'],
  authors: [{ name: 'Stake Manager Team' }],
  creator: 'Stake Manager',
  metadataBase: new URL('https://stake-manager.vercel.app'),
  openGraph: {
    title: 'Stake Manager',
    description: 'Manage your stake accounts and bets efficiently',
    images: ['/og-image.svg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stake Manager',
    description: 'Manage your stake accounts and bets efficiently',
    images: ['/og-image.svg'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/apple-icon.svg', type: 'image/svg+xml' }
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ConvexClerkProvider>
      <html lang="en">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/apple-icon.svg" type="image/svg+xml" />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {children}
          <Toaster />
        </body>
      </html>
    </ConvexClerkProvider>
  )
}