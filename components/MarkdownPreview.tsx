'use client'

import { useEffect, useRef, useState } from 'react'
import { CodeBlock } from './ui/CodeBlock'

interface MarkdownPreviewProps {
  content: string
  filename?: string
  maxHeight?: string
}

export function MarkdownPreview({ content, filename, maxHeight = '60vh' }: MarkdownPreviewProps) {
  const [fading, setFading] = useState(false)
  const prev = useRef(content)

  useEffect(() => {
    if (prev.current !== content) {
      setFading(true)
      const t = setTimeout(() => setFading(false), 100)
      prev.current = content
      return () => clearTimeout(t)
    }
  }, [content])

  const lineCount = content.split('\n').length

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-mono uppercase tracking-wider">
        <span>{filename ?? 'preview'}</span>
        <span>{lineCount} lines</span>
      </div>
      <div className="preview-fade" data-fading={fading}>
        <CodeBlock code={content} maxHeight={maxHeight} ariaLabel={filename} />
      </div>
    </div>
  )
}
