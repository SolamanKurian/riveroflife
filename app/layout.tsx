import React from 'react'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'There Is Still Hope',
  description: 'A message of hope, love, and redemption. Discover the way forward through faith in Jesus Christ.',
  keywords: ['hope', 'faith', 'Jesus', 'redemption', 'forgiveness', 'love'],
  authors: [{ name: 'Eldo Kurian' }],
  openGraph: {
    title: 'There Is Still Hope',
    description: 'A message of hope, love, and redemption. Discover the way forward through faith in Jesus Christ.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'There Is Still Hope',
    description: 'A message of hope, love, and redemption. Discover the way forward through faith in Jesus Christ.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#fafafa" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="h-full overflow-hidden">
        {children}
      </body>
    </html>
  )
}
