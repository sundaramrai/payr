import { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface Props {
  readonly children: ReactNode
  readonly error?: string
  readonly full?: boolean
  readonly htmlFor: string
  readonly label: string
}

export function FormField({
  children,
  error,
  full = false,
  htmlFor,
  label,
}: Props) {
  return (
    <div
      className={cn(
        'bg-cream border-ink border-b-2 border-r-2 px-4 py-3.5',
        full && 'md:col-span-2'
      )}
    >
      <label
        className="mb-2 block font-mono text-[0.5rem] font-light uppercase tracking-[0.18em] text-ink/45"
        htmlFor={htmlFor}
      >
        {label}
      </label>
      {children}
      {error && <span className="mt-1.5 block font-mono text-[0.5rem] tracking-widest text-danger">{error}</span>}
    </div>
  )
}
