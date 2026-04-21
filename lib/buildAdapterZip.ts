import JSZip from 'jszip'
import type { GeneratedSeed } from './seedSchema'

/** Assemble the 11-file adapter pack ZIP as a Blob. */
export async function buildAdapterZip(bundle: GeneratedSeed): Promise<Blob> {
  const zip = new JSZip()
  const root = zip.folder('specseed-output')!

  root.file('SEED.md',   bundle.seedMd)
  root.file('CLAUDE.md', bundle.claudeMd)
  root.file('AGENTS.md', bundle.agentsMd)

  const claudeAgents = root.folder('.claude')!.folder('agents')!
  claudeAgents.file('reviewer.md', bundle.claudeAgents.reviewer)
  claudeAgents.file('recon.md',    bundle.claudeAgents.recon)
  claudeAgents.file('tester.md',   bundle.claudeAgents.tester)

  const codexRoot = root.folder('.codex')!
  codexRoot.file('config.toml', bundle.codexConfig)
  const codexAgents = codexRoot.folder('agents')!
  codexAgents.file('reviewer.toml', bundle.codexAgents.reviewer)
  codexAgents.file('worker.toml',   bundle.codexAgents.worker)

  root.file('macos-setup.sh',      bundle.macosSetup)
  root.file('ubuntu-bootstrap.md', bundle.ubuntuBootstrap)

  return zip.generateAsync({ type: 'blob' })
}
