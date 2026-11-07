import { apiClient } from '@/api/client'
import { getApiMode } from '@/api/api-mode'
import { getOfflineRoomEvaluation } from '@/api/mock-adapter'

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

export interface TranscriptEntry {
  timestamp?: string | null
  speaker?: string | null
  text?: string | null
  videoUrl?: string | null
}

export interface IdentityPhase1 {
  decision?: string | null
  confidence?: number | null
  referenceVideoQuality?: string | null
  interviewVideoQuality?: string | null
  multiplePeopleDetected?: boolean | null
  matchingEvidence?: JsonValue[]
  conflictingEvidence?: JsonValue[]
  limitations?: string[]
  liveness?: string | null
  livenessDetection?: string | null
}

export interface RiskObservation {
  timestamp?: string | null
  source?: string | null
  category?: string | null
  observation?: string | null
}

export interface RiskSignal {
  risk?: string | null
  confidence?: number | null
  observations?: RiskObservation[]
}

export interface GeminiAnalysis {
  identityPhase1?: IdentityPhase1
  overallRisk?: string | null
  gazeTrackingIndex?: number | null
  audioAnomalyCount?: number | null
  flaggedFrames?: number | null
  syntheticVideo?: RiskSignal
  personContinuity?: RiskSignal
  audioVideoConsistency?: RiskSignal
  possibleOffScreenAssistance?: RiskSignal
  suspiciousTimeRanges?: JsonValue[]
  limitations?: string[]
  transcript?: { entries?: TranscriptEntry[] }
}

export interface DeepfakePhase2 {
  gemini?: GeminiAnalysis
  specialistResults?: JsonValue[]
  disposition?: string | null
  humanReviewRequired?: boolean | null
}

export interface RoomAnalytic {
  candidateId?: string | null
  identity_phase1?: IdentityPhase1
  deepfake_phase2?: DeepfakePhase2
}

/** The room lookup returns an array of room evaluation records. */
export interface RoomEvaluation {
  roomName: string
  recordingType?: string | null
  campaignId?: number | string | null
  updatedAt?: string | null
  databaseType?: string | null
  objectPath?: string | null
  finalUrl?: string | null
  status?: string | null
  analyticsCompleted?: boolean | string | null
  analytic?: RoomAnalytic | null
  campaignAssessments?: JsonValue[]
}

export type RoomEvaluationResponse = RoomEvaluation[]

export async function getRoomEvaluation(roomName: string, signal?: AbortSignal): Promise<RoomEvaluationResponse> {
  if (getApiMode() === 'local') return getOfflineRoomEvaluation(roomName, signal)

  const response = await apiClient.get<RoomEvaluationResponse>(
    `roomsHACKATHON/${encodeURIComponent(roomName)}`,
    { signal },
  )
  return response.data
}
