import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PayR | Payment Gateway',
  description: 'A payment gateway built with Next.js',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-cream font-display text-ink antialiased">{children}</body>
    </html>
  )
}
