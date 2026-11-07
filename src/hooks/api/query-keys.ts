import type { CampaignId } from '@/shared/types/candidate'

export const campaignJobsQueryKey = (campaignId: CampaignId) =>
  ['jobs', 'campaign', campaignId] as const

export const roomEvaluationQueryKey = (roomName: string) =>
  ['jobs', 'room', roomName] as const
