import { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface Props {
  readonly children: ReactNode
  readonly className?: string
  readonly tone: 'danger' | 'success' | 'warning'
}

const toneClasses = {
  success: 'border border-success bg-success/10 text-success',
  danger: 'border border-[#b42318] bg-[#ff5a4e]/15 text-[#2f0906]',
  warning: 'border border-warn bg-warn/10 text-warn',
} as const

export function StatusBadge({ children, className, tone }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-2.5 py-1 font-mono text-[0.5rem] font-semibold uppercase tracking-[0.14em]',
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  )
}
