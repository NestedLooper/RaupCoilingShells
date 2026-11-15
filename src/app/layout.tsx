import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Raup Coiling Shells',
  description: "Explore Raup's morphospace of coiled shells in 3D",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} flex min-h-screen flex-col bg-[#0c1418] text-[#e6ded0]`}>
        <nav className="flex items-center gap-4 border-b border-[#26363d] px-6 py-4">
          <span className="text-sm font-bold tracking-widest text-[#e0a458]">RAUP COILING SHELLS</span>
          <a
            href="https://pubmed.ncbi.nlm.nih.gov/27151556/"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-sm text-[#8fa0a3] hover:text-[#e6ded0]"
          >
            Gerber 2017
          </a>
        </nav>
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      </body>
    </html>
  )
}
