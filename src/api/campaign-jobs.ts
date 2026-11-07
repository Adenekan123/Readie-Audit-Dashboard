import { apiClient } from '@/api/client'
import { getOfflineCampaignJobs, isOfflineMockApiEnabled } from '@/api/mock-adapter'

export interface CampaignAssessmentVideoLink {
  created_at: string
  video_url_link: string
  userId: string
  streakId: number
  profileAvatar: string | null
  userName: string
  userEmail: string
  totalQuestions: number
  correctCount: number
  wrongCount: number
  unansweredCount: number
  pctCorrect: number
  created_date: string
  created_time: string
  totalActivityCount: number
  activityCountsByType: string
  invigilatorVideoUrlLink: string
}

export interface CampaignJob {
  roomName: string
  campaignId: number
  userId: number
  analyticsCompleted: boolean
  candidateUserId: number | null
  candidateId: string | null
  candidateName: string | null
  candidateEmail: string
  candidateDateCreated: string
  campaignJobTitle: string
  percentageAnalyticCompleted: number
  campaign_assessment_video_link: CampaignAssessmentVideoLink[]
}

export type CampaignJobsResponse = CampaignJob[]

export async function getCampaignJobs(campaignId: string, signal?: AbortSignal): Promise<CampaignJobsResponse> {
  if (isOfflineMockApiEnabled()) return getOfflineCampaignJobs(campaignId, signal)

  const response = await apiClient.get<CampaignJobsResponse>(
    `campaignHACKATHON/${encodeURIComponent(campaignId)}`,
    { signal },
  )
  return response.data
}
