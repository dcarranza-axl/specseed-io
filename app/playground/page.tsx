import { Nav } from '@/components/Nav'
import { SeedGenerator } from '@/components/SeedGenerator'
import { Footer } from '@/components/Footer'

export const metadata = {
  title: 'Playground',
  description: 'Full-screen SpecSeed generator for deep sessions.',
}

export default function PlaygroundPage() {
  return (
    <>
      <Nav />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <h1 className="text-2xl mb-6 text-[var(--text-bright)]">Playground</h1>
        <SeedGenerator fullBleed />
      </main>
      <Footer />
    </>
  )
}
