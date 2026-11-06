import type { CandidateStatus } from '@/lib/demo-data'

type BadgeValue = CandidateStatus | 'Passed' | 'Warning'

const badgeTones: Record<BadgeValue, string> = {
  Completed: 'green',
  'In progress': 'purple',
  Failed: 'red',
  Passed: 'green',
  Warning: 'amber',
}

export function StatusBadge({ value }: { value: BadgeValue }) {
  return (
    <span className={`badge ${badgeTones[value]}`}>
      <i aria-hidden="true" />
      {value}
    </span>
  )
}
