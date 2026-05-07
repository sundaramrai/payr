import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PayR - Secure Payment Gateway',
  description: 'A modern, secure payment gateway built with Next.js',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
