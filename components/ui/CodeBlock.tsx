'use client'

import { clsx } from 'clsx'
import type { CSSProperties } from 'react'

interface CodeBlockProps {
  code: string
  maxHeight?: string
  className?: string
  ariaLabel?: string
}

export function CodeBlock({ code, maxHeight, className, ariaLabel }: CodeBlockProps) {
  const style: CSSProperties | undefined = maxHeight ? { maxHeight } : undefined
  return (
    <pre
      className={clsx('code-block', className)}
      style={style}
      aria-label={ariaLabel}
      tabIndex={0}
    >
      {code}
    </pre>
  )
}
