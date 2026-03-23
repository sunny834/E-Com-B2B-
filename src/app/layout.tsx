import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'E-commerce Admin (B2B/B2C)',
  description: 'Full-featured B2B and B2C e-commerce admin platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
