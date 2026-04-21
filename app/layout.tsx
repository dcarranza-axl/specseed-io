import type { Metadata } from 'next'
import { Inter, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://specseed.io'),
  title: {
    default: 'SpecSeed — Master Orchestration Seed Generator',
    template: '%s · SpecSeed',
  },
  description:
    'Turn one project objective into Claude Code and Codex-ready parallel agent execution. Generate SEED.md, CLAUDE.md, AGENTS.md, and adapter files from a single form.',
  openGraph: {
    title: 'SpecSeed — Master Orchestration Seed Generator',
    description:
      'Turn one project objective into Claude Code and Codex-ready parallel agent execution.',
    url: 'https://specseed.io',
    siteName: 'SpecSeed',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'SpecSeed',
    description: 'Master orchestration seed generator.',
  },
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${ibmPlexMono.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
