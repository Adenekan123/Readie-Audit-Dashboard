import { describe, expect, it } from 'vitest'
import type { CampaignJob } from '@/api/campaign-jobs'
import { toCandidateSession } from '@/features/campaigns/model/to-candidate-session'

function makeJob(overrides: Partial<CampaignJob> = {}): CampaignJob {
  return {
    roomName: 'campaign_120interview_candidate-1',
    campaignId: 120,
    userId: 1,
    analyticsCompleted: false,
    candidateUserId: 1,
    candidateId: 'candidate-1',
    candidateName: ' Ada Lovelace ',
    candidateEmail: ' ada@example.com ',
    candidateDateCreated: '2025-02-03T10:00:00.000Z',
    campaignJobTitle: 'Software Engineer',
    percentageAnalyticCompleted: 45,
    campaign_assessment_video_link: [
      {
        created_at: '',
        video_url_link: '',
        userId: '',
        streakId: 0,
        profileAvatar: null,
        userName: '',
        userEmail: '',
        totalQuestions: 0,
        correctCount: 0,
        wrongCount: 0,
        unansweredCount: 0,
        pctCorrect: 0,
        created_date: '2025-02-03',
        created_time: '09:05:00',
        totalActivityCount: 0,
        activityCountsByType: '',
        invigilatorVideoUrlLink: '',
      },
    ],
    ...overrides,
  }
}

describe('toCandidateSession', () => {
  it('normalizes candidate details and maps the submitted time', () => {
    const session = toCandidateSession(makeJob(), '119')

    expect(session).toMatchObject({
      campaignId: '120',
      email: 'ada@example.com',
      initials: 'AL',
      name: 'Ada Lovelace',
      roomName: 'campaign_120interview_candidate-1',
      status: 'In progress',
      submittedAt: '03 Feb 2025, 09:05',
      submittedAtValue: Date.UTC(2025, 1, 3, 9, 5),
    })
  })

  it('uses the selected campaign when the job campaign ID is invalid', () => {
    const session = toCandidateSession(makeJob({ campaignId: 0 }), '119')

    expect(session.campaignId).toBe('119')
  })

  it('marks analytics at 100 percent as completed', () => {
    const session = toCandidateSession(makeJob({ percentageAnalyticCompleted: 100 }), '120')

    expect(session.status).toBe('Completed')
  })

  it('provides fallback text when name and email are missing', () => {
    const session = toCandidateSession(makeJob({ candidateName: null, candidateEmail: ' ' }), '120')

    expect(session).toMatchObject({
      email: 'Email unavailable',
      initials: 'UC',
      name: 'Unidentified candidate',
    })
  })
})
