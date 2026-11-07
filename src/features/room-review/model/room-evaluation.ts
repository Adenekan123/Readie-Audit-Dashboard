import type { RoomEvaluation } from '@/api/room-evaluation'

export function confidenceAsPercent(confidence: number | null | undefined): number | undefined {
  if (confidence === null || confidence === undefined || !Number.isFinite(confidence)) return undefined
  return Math.min(100, Math.max(0, confidence <= 1 ? confidence * 100 : confidence))
}

export function getRoomIntegrityOutcome(evaluation: RoomEvaluation): 'Passed' | 'Warning' | 'Failed' {
  const analytic = evaluation.analytic
  const deepfake = analytic?.deepfake_phase2
  const gemini = deepfake?.gemini
  const riskLevels = [
    gemini?.overallRisk,
    gemini?.syntheticVideo?.risk,
    gemini?.personContinuity?.risk,
    gemini?.audioVideoConsistency?.risk,
    gemini?.possibleOffScreenAssistance?.risk,
  ].map((risk) => risk?.toUpperCase())
  const disposition = deepfake?.disposition?.toUpperCase()
  const identityDecision = (analytic?.identity_phase1?.decision ?? gemini?.identityPhase1?.decision)?.toUpperCase()

  if (riskLevels.includes('HIGH') || ['FAILED', 'FAIL', 'REJECTED'].includes(disposition ?? '') || ['FAILED', 'MISMATCH'].includes(identityDecision ?? '')) {
    return 'Failed'
  }
  if (
    deepfake?.humanReviewRequired
    || disposition === 'REVIEW_REQUIRED'
    || identityDecision === 'INCONCLUSIVE'
    || riskLevels.includes('MEDIUM')
  ) {
    return 'Warning'
  }
  if (riskLevels.includes('LOW') || ['PASSED', 'PASS', 'APPROVED'].includes(disposition ?? '') || ['VERIFIED', 'MATCH'].includes(identityDecision ?? '')) {
    return 'Passed'
  }
  return 'Warning'
}
