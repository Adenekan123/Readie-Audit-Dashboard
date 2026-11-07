import type { CampaignId } from '@/shared/types/candidate'
import type { ApiMode } from '@/api/api-mode'

export const campaignJobsQueryKey = (campaignId: CampaignId, mode: ApiMode) =>
  ['jobs', 'campaign', campaignId, mode] as const

export const roomEvaluationQueryKey = (roomName: string, mode: ApiMode) =>
  ['jobs', 'room', roomName, mode] as const
