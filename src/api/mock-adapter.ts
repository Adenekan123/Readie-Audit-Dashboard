import type { CampaignJob, CampaignJobsResponse } from '@/api/campaign-jobs'
import type { IdentityPhase1, RoomEvaluation, RoomEvaluationResponse, RiskSignal, TranscriptEntry } from '@/api/room-evaluation'

const supportedCampaignIds = ['119', '120', '122', '123'] as const

interface OfflineCandidate {
  id: number
  name: string
  email: string
  roomSuffix: string
  createdAt: string
  analyticsCompleted: boolean
  percentageAnalyticCompleted: number
  identityDecision: string
  identityConfidence: number
  multiplePeopleDetected: boolean
  referenceVideoQuality: string
  interviewVideoQuality: string
  livenessDetection: string
  risk: string
  gazeTrackingIndex: number
  audioAnomalyCount: number
  flaggedFrames: number
  disposition: string
  humanReviewRequired: boolean
  answer: string
}

const offlineCandidates: OfflineCandidate[] = [
  {
    id: 801, name: 'Maya Chen', email: 'maya.chen@example.test', roomSuffix: 'a19f31d2',
    createdAt: '2026-11-06T14:32:00+00:00', analyticsCompleted: true, percentageAnalyticCompleted: 100,
    identityDecision: 'VERIFIED', identityConfidence: 0.98, multiplePeopleDetected: false,
    referenceVideoQuality: 'GOOD', interviewVideoQuality: 'GOOD', livenessDetection: 'Passed',
    risk: 'LOW', gazeTrackingIndex: 96, audioAnomalyCount: 0, flaggedFrames: 0,
    disposition: 'APPROVED', humanReviewRequired: false,
    answer: 'I applied because the role combines user research with thoughtful product decisions.',
  },
  {
    id: 802, name: 'Jordan Ade', email: 'jordan.ade@example.test', roomSuffix: 'b28e42c3',
    createdAt: '2026-11-06T13:48:00+00:00', analyticsCompleted: false, percentageAnalyticCompleted: 64,
    identityDecision: 'INCONCLUSIVE', identityConfidence: 0.68, multiplePeopleDetected: true,
    referenceVideoQuality: 'FAIR', interviewVideoQuality: 'FAIR', livenessDetection: 'Needs review',
    risk: 'MEDIUM', gazeTrackingIndex: 78, audioAnomalyCount: 2, flaggedFrames: 3,
    disposition: 'REVIEW_REQUIRED', humanReviewRequired: true,
    answer: 'I would first clarify the user need, then test a small set of possible solutions.',
  },
  {
    id: 803, name: 'Samira Okafor', email: 'samira.okafor@example.test', roomSuffix: 'c37d53b4',
    createdAt: '2026-11-06T12:55:00+00:00', analyticsCompleted: true, percentageAnalyticCompleted: 100,
    identityDecision: 'MATCH', identityConfidence: 0.94, multiplePeopleDetected: false,
    referenceVideoQuality: 'GOOD', interviewVideoQuality: 'GOOD', livenessDetection: 'Passed',
    risk: 'LOW', gazeTrackingIndex: 91, audioAnomalyCount: 0, flaggedFrames: 0,
    disposition: 'APPROVED', humanReviewRequired: false,
    answer: 'I use feedback sessions and product analytics together to understand usability issues.',
  },
  {
    id: 804, name: 'Ethan Williams', email: 'ethan.williams@example.test', roomSuffix: 'd46c64a5',
    createdAt: '2026-11-06T11:27:00+00:00', analyticsCompleted: true, percentageAnalyticCompleted: 100,
    identityDecision: 'VERIFIED', identityConfidence: 0.91, multiplePeopleDetected: false,
    referenceVideoQuality: 'GOOD', interviewVideoQuality: 'FAIR', livenessDetection: 'Passed',
    risk: 'LOW', gazeTrackingIndex: 89, audioAnomalyCount: 0, flaggedFrames: 0,
    disposition: 'APPROVED', humanReviewRequired: false,
    answer: 'I would align the team around a measurable outcome before choosing an implementation.',
  },
  {
    id: 805, name: 'Amina Yusuf', email: 'amina.yusuf@example.test', roomSuffix: 'e55b75a6',
    createdAt: '2026-11-06T10:42:00+00:00', analyticsCompleted: true, percentageAnalyticCompleted: 100,
    identityDecision: 'INCONCLUSIVE', identityConfidence: 0.52, multiplePeopleDetected: false,
    referenceVideoQuality: 'POOR', interviewVideoQuality: 'FAIR', livenessDetection: 'Not confirmed',
    risk: 'MEDIUM', gazeTrackingIndex: 72, audioAnomalyCount: 1, flaggedFrames: 1,
    disposition: 'REVIEW_REQUIRED', humanReviewRequired: true,
    answer: 'I would compare the available evidence and document what remains uncertain.',
  },
  {
    id: 806, name: 'Oliver Mensah', email: 'oliver.mensah@example.test', roomSuffix: 'f64a86b7',
    createdAt: '2026-11-05T16:18:00+00:00', analyticsCompleted: true, percentageAnalyticCompleted: 100,
    identityDecision: 'MISMATCH', identityConfidence: 0.27, multiplePeopleDetected: true,
    referenceVideoQuality: 'GOOD', interviewVideoQuality: 'FAIR', livenessDetection: 'Needs review',
    risk: 'HIGH', gazeTrackingIndex: 54, audioAnomalyCount: 4, flaggedFrames: 8,
    disposition: 'REVIEW_REQUIRED', humanReviewRequired: true,
    answer: 'I would pause the decision and request a clearer verification recording.',
  },
  {
    id: 807, name: 'Ada Bello', email: 'ada.bello@example.test', roomSuffix: '075b97c8',
    createdAt: '2026-11-05T14:03:00+00:00', analyticsCompleted: true, percentageAnalyticCompleted: 100,
    identityDecision: 'MATCH', identityConfidence: 0.99, multiplePeopleDetected: false,
    referenceVideoQuality: 'GOOD', interviewVideoQuality: 'GOOD', livenessDetection: 'Passed',
    risk: 'LOW', gazeTrackingIndex: 97, audioAnomalyCount: 0, flaggedFrames: 0,
    disposition: 'APPROVED', humanReviewRequired: false,
    answer: 'I would validate the prototype with users before investing in a broader rollout.',
  },
  {
    id: 808, name: 'Noah Ibrahim', email: 'noah.ibrahim@example.test', roomSuffix: '186ca8d9',
    createdAt: '2026-11-05T12:36:00+00:00', analyticsCompleted: false, percentageAnalyticCompleted: 38,
    identityDecision: 'INCONCLUSIVE', identityConfidence: 0.61, multiplePeopleDetected: false,
    referenceVideoQuality: 'FAIR', interviewVideoQuality: 'FAIR', livenessDetection: 'Pending',
    risk: 'MEDIUM', gazeTrackingIndex: 80, audioAnomalyCount: 1, flaggedFrames: 2,
    disposition: 'REVIEW_REQUIRED', humanReviewRequired: true,
    answer: 'I would make the next step small enough to learn quickly and adjust from the results.',
  },
]

function createRoomName(campaignId: string, candidate: OfflineCandidate) {
  return `campaign_${campaignId}interview~~${candidate.email}~~${candidate.roomSuffix}`
}

function createCampaignJob(campaignId: string, candidate: OfflineCandidate): CampaignJob {
  return {
    roomName: createRoomName(campaignId, candidate),
    campaignId: Number(campaignId),
    userId: candidate.id,
    analyticsCompleted: candidate.analyticsCompleted,
    candidateUserId: candidate.id,
    candidateId: String(candidate.id),
    candidateName: candidate.name,
    candidateEmail: candidate.email,
    candidateDateCreated: candidate.createdAt,
    campaignJobTitle: 'Product Designer (UX/UI)',
    percentageAnalyticCompleted: candidate.percentageAnalyticCompleted,
    campaign_assessment_video_link: [],
  }
}

function createIdentity(candidate: OfflineCandidate): IdentityPhase1 {
  return {
    decision: candidate.identityDecision,
    confidence: candidate.identityConfidence,
    referenceVideoQuality: candidate.referenceVideoQuality,
    interviewVideoQuality: candidate.interviewVideoQuality,
    multiplePeopleDetected: candidate.multiplePeopleDetected,
    matchingEvidence: candidate.identityDecision === 'VERIFIED' || candidate.identityDecision === 'MATCH'
      ? ['Facial landmarks were consistent across the available frames.']
      : [],
    conflictingEvidence: candidate.identityDecision === 'MISMATCH'
      ? ['The available facial features did not match the reference recording.']
      : [],
    limitations: candidate.identityDecision === 'INCONCLUSIVE'
      ? ['Video quality limits confidence; human review is recommended.']
      : [],
    livenessDetection: candidate.livenessDetection,
  }
}

function createRiskSignal(candidate: OfflineCandidate, category: string, observation: string): RiskSignal {
  return {
    risk: candidate.risk,
    confidence: candidate.risk === 'LOW' ? 0.88 : candidate.risk === 'MEDIUM' ? 0.64 : 0.82,
    observations: [{ timestamp: '00:42', source: 'OFFLINE_SAMPLE', category, observation }],
  }
}

function createTranscript(candidate: OfflineCandidate): TranscriptEntry[] {
  return [
    { timestamp: '00:00', speaker: 'INTERVIEWER', text: 'What interested you in this role?' },
    { timestamp: '00:18', speaker: 'INTERVIEWEE', text: candidate.answer },
    { timestamp: '00:52', speaker: 'INTERVIEWER', text: 'How would you decide what to improve first?' },
    { timestamp: '01:10', speaker: 'INTERVIEWEE', text: 'I would combine user feedback with the impact and effort of each option.' },
  ]
}

function createRoomEvaluation(campaignId: string, candidate: OfflineCandidate): RoomEvaluation {
  const roomName = createRoomName(campaignId, candidate)
  const updatedAt = candidate.createdAt

  return {
    roomName,
    recordingType: 'COMPOSITE',
    campaignId: Number(campaignId),
    updatedAt,
    databaseType: 'CAMPAIGN_COMPOSITE_INTERVIEW',
    objectPath: null,
    finalUrl: null,
    status: candidate.analyticsCompleted ? 'PERSISTED' : 'PROCESSING',
    analyticsCompleted: candidate.analyticsCompleted ? 'Y' : 'N',
    analytic: {
      candidateId: String(candidate.id),
      identity_phase1: createIdentity(candidate),
      deepfake_phase2: {
        gemini: {
          identityPhase1: createIdentity(candidate),
          overallRisk: candidate.risk,
          gazeTrackingIndex: candidate.gazeTrackingIndex,
          audioAnomalyCount: candidate.audioAnomalyCount,
          flaggedFrames: candidate.flaggedFrames,
          syntheticVideo: createRiskSignal(candidate, 'SYNTHETIC_VIDEO', 'Natural movement and lighting are visible in the available sample frames.'),
          personContinuity: createRiskSignal(candidate, 'PERSON_CONTINUITY', candidate.multiplePeopleDetected ? 'More than one person appears during part of the recording.' : 'The same participant appears throughout the sample.'),
          audioVideoConsistency: createRiskSignal(candidate, 'AUDIO_VIDEO', 'Speech and visible mouth movement are generally aligned in this sample.'),
          possibleOffScreenAssistance: createRiskSignal(candidate, 'OFF_SCREEN_ACTIVITY', 'No clear off-screen assistance signal was identified in this sample.'),
          suspiciousTimeRanges: [],
          limitations: candidate.humanReviewRequired ? ['This offline sample is illustrative and requires human review.'] : [],
          transcript: { entries: createTranscript(candidate) },
        },
        specialistResults: [],
        disposition: candidate.disposition,
        humanReviewRequired: candidate.humanReviewRequired,
      },
    },
    campaignAssessments: [],
  }
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException('The request was aborted.', 'AbortError')
}

export function isOfflineMockApiEnabled() {
  return import.meta.env.VITE_USE_MOCK_API?.trim().toLowerCase() === 'true'
}

export function getOfflineCampaignJobs(campaignId: string, signal?: AbortSignal): CampaignJobsResponse {
  throwIfAborted(signal)
  if (!supportedCampaignIds.includes(campaignId as (typeof supportedCampaignIds)[number])) return []
  return offlineCandidates.map((candidate) => createCampaignJob(campaignId, candidate))
}

export function getOfflineRoomEvaluation(roomName: string, signal?: AbortSignal): RoomEvaluationResponse {
  throwIfAborted(signal)
  const campaignId = roomName.match(/^campaign_(\d+)interview~~/)?.[1]
  if (!campaignId || !supportedCampaignIds.includes(campaignId as (typeof supportedCampaignIds)[number])) return []

  const candidate = offlineCandidates.find((item) => createRoomName(campaignId, item) === roomName)
  return candidate ? [createRoomEvaluation(campaignId, candidate)] : []
}
