import type { HTMLAttributes } from 'react'
import { LoaderCircle } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

type LoadingSize = 'sm' | 'md' | 'lg'

const spinnerSizes: Record<LoadingSize, string> = {
  sm: 'size-3.5',
  md: 'size-5',
  lg: 'size-7',
}

export function LoadingSpinner({ size = 'md', className }: { size?: LoadingSize; className?: string }) {
  return <LoaderCircle aria-hidden="true" className={cn('animate-spin text-[#7040b5]', spinnerSizes[size], className)} />
}

export function InlineLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div aria-live="polite" className="inline-flex items-center gap-2 text-sm text-muted-foreground" role="status">
      <LoadingSpinner size="sm" />
      <span>{label}</span>
    </div>
  )
}

export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div aria-live="polite" className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-muted-foreground" role="status">
      <LoadingSpinner size="lg" />
      <span>{label}</span>
    </div>
  )
}

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />
}
