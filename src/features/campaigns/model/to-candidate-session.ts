import type { CampaignJobsResponse, CampaignJob } from '@/api/campaign-jobs'
import type { CandidateSession, CampaignId } from '@/shared/types/candidate'
import { isCampaignId } from '@/shared/lib/campaign-routing'

const submittedAtFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Lagos',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

function getSubmittedAt(job: CampaignJob) {
  const assessment = job.campaign_assessment_video_link[0]
  const createdDate = assessment?.created_date
  const createdTime = assessment?.created_time

  if (createdDate && createdTime) {
    const [year, month, day] = createdDate.split('-').map(Number)
    const [hour, minute, second] = createdTime.split(':').map(Number)
    const timestamp = Date.UTC(year, month - 1, day, hour, minute, second)
    const date = new Date(Date.UTC(year, month - 1, day))
    const formattedDate = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'UTC',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date)

    if (Number.isFinite(timestamp)) {
      return { label: `${formattedDate}, ${createdTime.slice(0, 5)}`, timestamp }
    }
  }

  const timestamp = Date.parse(job.candidateDateCreated)
  const validTimestamp = Number.isFinite(timestamp)

  return {
    label: validTimestamp ? submittedAtFormatter.format(new Date(timestamp)) : '—',
    timestamp: validTimestamp ? timestamp : 0,
  }
}

export function toCandidateSession(job: CampaignJobsResponse[number], selectedCampaignId: CampaignId): CandidateSession {
  const campaignId = String(job.campaignId)
  const safeCampaignId = isCampaignId(campaignId) ? campaignId : selectedCampaignId
  const email = job.candidateEmail.trim() || 'Email unavailable'
  const name = job.candidateName?.trim() || 'Unidentified candidate'
  const submittedAt = getSubmittedAt(job)
  const analyticsComplete = job.analyticsCompleted || job.percentageAnalyticCompleted >= 100

  return {
    campaignId: safeCampaignId,
    email,
    initials: name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'UC',
    name,
    roomName: job.roomName,
    status: analyticsComplete ? 'Completed' : 'In progress',
    submittedAt: submittedAt.label,
    submittedAtValue: submittedAt.timestamp,
  }
}
