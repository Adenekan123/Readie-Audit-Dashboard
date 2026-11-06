export const campaigns = {
  '119': 'Engineering',
  '120': 'Product & Design',
  '122': 'Customer Operations',
  '123': 'Graduate Programme',
} as const

export type CampaignId = keyof typeof campaigns
export type CandidateStatus = 'Completed' | 'In progress' | 'Failed'
export type RoomTab = 'transcript' | 'identity' | 'integrity'

export interface CandidateSession {
  campaignId: CampaignId
  email: string
  initials: string
  name: string
  roomName: string
  status: CandidateStatus
  submittedAt: string
  submittedAtValue: number
}

interface SampleCandidate {
  name: string
  username: string
  status: CandidateStatus
}

const sampleCandidates: SampleCandidate[] = [
  { name: 'Stephanie Tester', username: 'stephtester1', status: 'Completed' },
  { name: 'Cameron Williamson', username: 'cameron.w', status: 'In progress' },
  { name: 'Amina Yusuf', username: 'amina.yusuf', status: 'Completed' },
  { name: 'David Chen', username: 'david.chen', status: 'Failed' },
  { name: 'Olivia Rhye', username: 'olivia.rhye', status: 'Completed' },
  { name: 'Joshua Okafor', username: 'joshua.okafor', status: 'In progress' },
  { name: 'Priya Shah', username: 'priya.shah', status: 'Completed' },
  { name: 'Noah Williams', username: 'noah.w', status: 'Completed' },
]

export const campaignIds = Object.keys(campaigns) as CampaignId[]

export function isCampaignId(value: string | undefined): value is CampaignId {
  return value !== undefined && Object.hasOwn(campaigns, value)
}

export function getCandidates(campaignId: CampaignId): CandidateSession[] {
  const offset = campaignIds.indexOf(campaignId)

  return sampleCandidates.slice(0, sampleCandidates.length - offset).map((candidate, index) => {
    const day = 5 - offset
    const minute = 53 - index * 6
    const email = `${candidate.username}@example.test`

    return {
      campaignId,
      email,
      initials: candidate.name.split(' ').map((part) => part[0]).join(''),
      name: candidate.name,
      roomName: `campaign_${campaignId}interview~~${email}~~${(0xa3953942 + index).toString(16)}`,
      status: candidate.status,
      submittedAt: `${String(day).padStart(2, '0')} Nov 2026, 10:${String(minute).padStart(2, '0')}`,
      submittedAtValue: Date.UTC(2026, 10, day, 10, minute),
    }
  })
}

export function findCandidateByRoom(roomName: string | undefined): CandidateSession | undefined {
  if (!roomName) return undefined

  for (const campaignId of campaignIds) {
    const candidate = getCandidates(campaignId).find((session) => session.roomName === roomName)
    if (candidate) return candidate
  }

  return undefined
}

export function getRoomPath(roomName: string, tab: RoomTab = 'transcript'): string {
  return `/jobs/room/${encodeURIComponent(roomName)}?tab=${tab}`
}
