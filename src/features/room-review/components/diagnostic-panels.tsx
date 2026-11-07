import type { ReactNode } from 'react'
import { Check, ClipboardCheck, Clock3, Eye, Mic, Monitor, ScanFace, ShieldAlert, ShieldCheck, UsersRound, Video } from 'lucide-react'

import type { IdentityPhase1, JsonValue, RiskSignal, RoomEvaluation, TranscriptEntry } from '@/api/room-evaluation'
import { confidenceAsPercent, getRoomIntegrityOutcome } from '@/features/room-review/model/room-evaluation'

function Tile({ children, tone }: { children: ReactNode; tone: string }) {
  return <span aria-hidden="true" className={`tile ${tone}`}>{children}</span>
}

function EvidenceList({ items, emptyLabel }: { items: JsonValue[]; emptyLabel: string }) {
  if (items.length === 0) return <p>{emptyLabel}</p>

  return (
    <ul className="audit-list">
      {items.map((item, index) => {
        const text = typeof item === 'string' ? item : JSON.stringify(item)
        return <li key={`${index}-${text ?? 'evidence'}`}>{text ?? 'Evidence detail unavailable'}</li>
      })}
    </ul>
  )
}

function ConfidenceMeter({ value, label }: { value: number | null | undefined; label: string }) {
  const percent = confidenceAsPercent(value)
  if (percent === undefined) return <p className="metric-unavailable">Confidence not provided.</p>

  return (
    <>
      <div className="score-line">
        <strong>{Number.isInteger(percent) ? percent : percent.toFixed(1)}<small>%</small></strong>
        <span>Confidence</span>
      </div>
      <div aria-label={label} aria-valuemax={100} aria-valuemin={0} aria-valuenow={percent} className="track" role="meter">
        <div className={percent < 70 ? 'low' : ''} style={{ width: `${percent}%` }} />
      </div>
    </>
  )
}

export function getIdentityOutcome(decision: string | null | undefined): 'Passed' | 'Warning' | 'Failed' {
  const normalized = decision?.toUpperCase()
  if (normalized === 'PASS' || normalized === 'PASSED' || normalized === 'MATCH' || normalized === 'VERIFIED') return 'Passed'
  if (normalized === 'FAIL' || normalized === 'FAILED' || normalized === 'MISMATCH' || normalized === 'REJECTED') return 'Failed'
  return 'Warning'
}

export function IdentityPanel({ identity }: { identity: IdentityPhase1 | undefined }) {
  if (!identity) {
    return <div className="notice"><h3>Identity data unavailable</h3><p>The response did not include identity_phase1 results.</p></div>
  }

  const decision = identity.decision ?? 'Not provided'
  const liveness = identity.livenessDetection ?? identity.liveness
  const anomalies: JsonValue[] = [...(identity.conflictingEvidence ?? [])]
  if (identity.multiplePeopleDetected) anomalies.unshift('Multiple people were detected in the interview video.')

  return (
    <div className="diagnostic-body">
      <div className="metrics two identity-metrics">
        <article>
          <Tile tone="purple"><ScanFace strokeWidth={1.7} /></Tile>
          <h3>Biometric match confidence</h3>
          <ConfidenceMeter label="Biometric match confidence" value={identity.confidence} />
          <div className="identity-decision"><span>Decision</span><strong>{decision}</strong></div>
        </article>
        <article>
          <Tile tone={liveness ? 'green' : 'amber'}>{liveness ? <Check strokeWidth={1.8} /> : <Clock3 strokeWidth={1.8} />}</Tile>
          <h3>Liveness detection</h3>
          {liveness ? <p>{liveness}</p> : <p className="metric-unavailable">Not provided in this response.</p>}
          <div className="quality-pair">
            <span><small>Reference video</small><strong>{identity.referenceVideoQuality ?? 'Not provided'}</strong></span>
            <span><small>Interview video</small><strong>{identity.interviewVideoQuality ?? 'Not provided'}</strong></span>
          </div>
        </article>
      </div>

      <div className="finding">
        <h3>Flagged anomalies</h3>
        <EvidenceList items={anomalies} emptyLabel="No identity anomalies were reported." />
      </div>
      {(identity.matchingEvidence?.length ?? 0) > 0 && (
        <div className="finding">
          <h3>Matching evidence</h3>
          <EvidenceList items={identity.matchingEvidence ?? []} emptyLabel="No matching evidence returned." />
        </div>
      )}
      {(identity.limitations?.length ?? 0) > 0 && (
        <div className="finding">
          <h3>Review limitations</h3>
          <EvidenceList items={identity.limitations ?? []} emptyLabel="No limitations reported." />
        </div>
      )}
    </div>
  )
}

function speakerPresentation(speaker: string | null | undefined, candidateName: string) {
  const normalized = speaker?.toUpperCase()
  if (normalized === 'INTERVIEWER' || normalized === 'AI') return { label: 'Interviewer', className: 'prompt' }
  if (normalized === 'INTERVIEWEE' || normalized === 'CANDIDATE') return { label: candidateName, className: 'candidate-response' }
  return { label: speaker || 'Participant', className: 'participant-response' }
}

export function TranscriptPanel({ evaluation, candidateName }: { evaluation: RoomEvaluation; candidateName: string }) {
  const entries = evaluation.analytic?.deepfake_phase2?.gemini?.transcript?.entries ?? []
  const videoUrl = evaluation.finalUrl ?? evaluation.objectPath
  const playableVideoUrl = videoUrl?.startsWith('https://') ? videoUrl : undefined

  if (entries.length === 0) {
    return <div className="notice"><h3>Transcript unavailable</h3><p>The response did not include transcript entries for this room.</p></div>
  }

  return (
    <div className="diagnostic-body">
      {playableVideoUrl && (
        <section className="recording-player" aria-label="Interview recording">
          <h3><Video aria-hidden="true" />Interview recording</h3>
          <video aria-label={`Interview recording for ${candidateName}`} controls preload="metadata" src={playableVideoUrl} />
          <a href={playableVideoUrl} rel="noreferrer" target="_blank">Open recording in a new tab</a>
        </section>
      )}
      <ol className="transcript">
        {entries.map((entry: TranscriptEntry, index) => {
          const speaker = speakerPresentation(entry.speaker, candidateName)
          return (
            <li key={`${entry.timestamp ?? 'entry'}-${index}`}>
              <time>{entry.timestamp || '—'}</time>
              <div className={speaker.className}>
                <strong>{speaker.label}</strong>
                <p>{entry.text || 'Transcript text unavailable.'}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function riskTone(risk: string | null | undefined) {
  const normalized = risk?.toLowerCase()
  return normalized === 'low' ? 'risk-low' : normalized === 'high' ? 'risk-high' : normalized === 'medium' ? 'risk-medium' : 'risk-unknown'
}

function RiskSignalCard({ icon, label, signal }: { icon: ReactNode; label: string; signal: RiskSignal | undefined }) {
  const confidence = confidenceAsPercent(signal?.confidence)
  return (
    <article className="risk-signal-card">
      <h3><span className="risk-signal-icon">{icon}</span>{label}</h3>
      <span className={`risk-level ${riskTone(signal?.risk)}`}>{signal?.risk ?? 'Not provided'}</span>
      <p>{signal ? `${signal.observations?.length ?? 0} observations` : 'No assessment returned'}</p>
      {confidence !== undefined && <small>{Number.isInteger(confidence) ? confidence : confidence.toFixed(0)}% confidence</small>}
    </article>
  )
}

export function IntegrityPanel({ evaluation }: { evaluation: RoomEvaluation }) {
  const deepfake = evaluation.analytic?.deepfake_phase2
  const analysis = deepfake?.gemini
  if (!analysis && !deepfake) {
    return <div className="notice"><h3>Proctoring data unavailable</h3><p>The response did not include deepfake_phase2 results.</p></div>
  }

  const signals: { icon: ReactNode; label: string; signal: RiskSignal | undefined }[] = [
    { icon: <Video aria-hidden="true" />, label: 'Synthetic video', signal: analysis?.syntheticVideo },
    { icon: <UsersRound aria-hidden="true" />, label: 'Person continuity', signal: analysis?.personContinuity },
    { icon: <Mic aria-hidden="true" />, label: 'Audio and video consistency', signal: analysis?.audioVideoConsistency },
    { icon: <Monitor aria-hidden="true" />, label: 'Possible off-screen assistance', signal: analysis?.possibleOffScreenAssistance },
  ]
  const observations = signals.flatMap(({ label, signal }) => (signal?.observations ?? []).map((observation, index) => ({ ...observation, label, key: `${label}-${observation.timestamp ?? index}` })))
  const suspiciousRanges = analysis?.suspiciousTimeRanges ?? []
  const limitations = analysis?.limitations ?? []
  const integrityOutcome = getRoomIntegrityOutcome(evaluation)
  const missingProctoringMetrics = [analysis?.gazeTrackingIndex, analysis?.audioAnomalyCount, analysis?.flaggedFrames]
    .some((metric) => metric === undefined || metric === null)

  return (
    <div className="diagnostic-body">
      <div className="integrity-summary">
        <div><ShieldAlert aria-hidden="true" /><span className="summary-label">Overall risk</span><strong className={`risk-level ${riskTone(analysis?.overallRisk)}`}>{analysis?.overallRisk ?? 'Not provided'}</strong></div>
        <div><ShieldCheck aria-hidden="true" /><span className="summary-label">Overall outcome</span><strong className={`integrity-outcome-value outcome-${integrityOutcome.toLowerCase()}`}>{integrityOutcome.toUpperCase()}</strong></div>
        <div><ClipboardCheck aria-hidden="true" /><span className="summary-label">Disposition</span><strong>{deepfake?.disposition ?? 'Not provided'}</strong></div>
        <div><Clock3 aria-hidden="true" /><span className="summary-label">Human review</span><strong>{deepfake?.humanReviewRequired === undefined ? 'Not specified' : deepfake.humanReviewRequired ? 'Required' : 'Not required'}</strong></div>
      </div>

      <div className="finding">
        <h3>Proctoring risk assessments</h3>
        <div className="risk-signal-grid">
          {signals.map(({ icon, label, signal }) => <RiskSignalCard icon={icon} key={label} label={label} signal={signal} />)}
        </div>
      </div>

      <div className="finding">
        <h3>Observed events</h3>
        {observations.length > 0 ? (
          <ul className="integrity-observations">
            {observations.map((event) => (
              <li key={event.key}>
                <time>{event.timestamp || 'Time unavailable'}</time>
                <div><strong>{event.label}{event.category ? ` · ${event.category.replaceAll('_', ' ').toLowerCase()}` : ''}</strong><p>{event.observation || 'Observation detail unavailable.'}</p></div>
              </li>
            ))}
          </ul>
        ) : <p>No risk observations were returned.</p>}
      </div>

      <div className="finding">
        <h3>Suspicious time ranges</h3>
        <EvidenceList items={suspiciousRanges} emptyLabel="No suspicious time ranges were reported." />
      </div>

      <div className="finding">
        <h3>Additional proctoring metrics</h3>
        <div className="metric-availability">
          <span><Eye aria-hidden="true" /><small>Gaze Tracking Index</small><strong>{analysis?.gazeTrackingIndex ?? 'Not provided'}</strong></span>
          <span><Mic aria-hidden="true" /><small>Audio Anomaly Count</small><strong>{analysis?.audioAnomalyCount ?? 'Not provided'}</strong></span>
          <span><ScanFace aria-hidden="true" /><small>Flagged Frames</small><strong>{analysis?.flaggedFrames ?? 'Not provided'}</strong></span>
        </div>
        {missingProctoringMetrics && <p className="metric-unavailable">Some metric values were not included in this response.</p>}
      </div>

      {limitations.length > 0 && (
        <div className="finding">
          <h3>Analysis limitations</h3>
          <EvidenceList items={limitations} emptyLabel="No limitations reported." />
        </div>
      )}
    </div>
  )
}
