import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Planificateur de Repas',
  description: 'Planifiez vos repas de la semaine et générez votre liste de courses',
  icons: {
    icon: [
      {
        url: '/canard-laque.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      }
    ]
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
