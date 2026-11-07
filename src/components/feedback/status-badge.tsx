import type { CandidateStatus } from '@/shared/types/candidate'

type BadgeValue = CandidateStatus | 'Passed' | 'Warning'

const badgeTones: Record<BadgeValue, string> = {
  Completed: 'green',
  'In progress': 'purple',
  Failed: 'red',
  Passed: 'green',
  Warning: 'amber',
}

export function StatusBadge({ value, className }: { value: BadgeValue; className?: string }) {
  return (
    <span className={['badge', badgeTones[value], className].filter(Boolean).join(' ')}>
      <i aria-hidden="true" />
      {value}
    </span>
  )
}
