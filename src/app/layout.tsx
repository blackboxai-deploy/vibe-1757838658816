import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Snake Game - Classic Arcade Fun',
  description: 'Play the classic Snake game with modern features, progressive difficulty, and mobile support',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={`${inter.className} bg-black text-white overflow-hidden`}>
        <div className="min-h-screen flex items-center justify-center p-2">
          {children}
        </div>
      </body>
    </html>
  )
}