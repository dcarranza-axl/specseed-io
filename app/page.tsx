'use client'

import { useMemo, useState } from 'react'
import { buildWavePlan } from '@/lib/wavePlan'
import { DEFAULT_SEED_INPUT, type SeedInput } from '@/lib/seedSchema'
import { Nav } from '@/components/Nav'
import { Hero } from '@/components/Hero'
import { SeedGenerator } from '@/components/SeedGenerator'
import { PhaseOctopus } from '@/components/PhaseOctopus'
import { HowItWorks } from '@/components/HowItWorks'
import { ArtifactTabs } from '@/components/ArtifactTabs'
import { Footer } from '@/components/Footer'

export default function HomePage() {
  const [input, setInput] = useState<SeedInput>(DEFAULT_SEED_INPUT)
  const plan = useMemo(() => buildWavePlan(input), [input])

  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <SeedGenerator input={input} onInputChange={setInput} />
        <PhaseOctopus plan={plan} />
        <HowItWorks />
        <ArtifactTabs />
      </main>
      <Footer />
    </>
  )
}
