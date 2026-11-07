export type CampaignId = string
export type CandidateStatus = 'Completed' | 'In progress' | 'Failed'

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
