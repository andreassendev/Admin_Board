import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Board - ELgrossist',
  description: 'Intern admin for ordrer og sendinger',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  )
}
