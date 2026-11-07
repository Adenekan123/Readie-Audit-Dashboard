import { useEffect, useMemo, type ReactNode } from 'react'
import { ArrowLeft, FileText, Fingerprint, RefreshCw, ShieldCheck } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

import { StatusBadge } from '@/components/feedback/status-badge'
import { Button } from '@/components/ui/button'
import { InlineLoader } from '@/components/ui/loader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGetCampaignJobs } from '@/hooks/api/use-get-campaign-jobs'
import { useGetRoomEvaluation } from '@/hooks/api/use-get-room-evaluation'
import type { RoomEvaluation } from '@/api/room-evaluation'
import { toCandidateSession } from '@/features/campaigns/model/to-candidate-session'
import { getIdentityOutcome, IdentityPanel, IntegrityPanel, TranscriptPanel } from '@/features/room-review/components/diagnostic-panels'
import { getCampaignIdFromRoomName } from '@/shared/lib/campaign-routing'
import type { CandidateSession, CandidateStatus } from '@/shared/types/candidate'
import type { RoomTab } from '@/shared/types/room-review'

const roomTabs: { key: RoomTab; label: string; phase: string }[] = [
  { key: 'transcript', label: 'Transcript', phase: '' },
  { key: 'identity', label: 'Identity Verification', phase: 'Phase 1' },
  { key: 'integrity', label: 'Integrity & Proctoring', phase: 'Phase 2' },
]

const roomTabIcons: Record<RoomTab, ReactNode> = {
  transcript: <FileText aria-hidden="true" />,
  identity: <Fingerprint aria-hidden="true" />,
  integrity: <ShieldCheck aria-hidden="true" />,
}

const watTimestampFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Lagos',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

function diagnosticCopy(tab: RoomTab): { title: string; description: string } {
  if (tab === 'transcript') return { title: 'Interview transcript', description: 'Timestamped prompts and candidate responses.' }
  if (tab === 'identity') return { title: 'Identity verification', description: 'Biometric match, liveness and flagged anomalies.' }
  return { title: 'Proctoring overview', description: 'Automated signals for auditor review.' }
}

function candidateEmailFromRoomName(roomName: string) {
  const parts = roomName.split('~~')
  return parts.length > 1 ? parts[1] : 'Candidate email unavailable'
}

function initialsFor(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'C'
}

function submittedAt(evaluation: RoomEvaluation, candidate: CandidateSession | undefined) {
  if (candidate) return { label: 'Submitted · WAT', value: candidate.submittedAt }
  if (!evaluation.updatedAt) return { label: 'Last updated · WAT', value: 'Not available' }
  const timestamp = /(?:Z|[+-]\d\d:?\d\d)$/i.test(evaluation.updatedAt) ? evaluation.updatedAt : `${evaluation.updatedAt}Z`
  const date = new Date(timestamp)
  return {
    label: 'Last updated · WAT',
    value: Number.isNaN(date.getTime()) ? evaluation.updatedAt : watTimestampFormatter.format(date),
  }
}

function verificationStatus(evaluation: RoomEvaluation, candidate: CandidateSession | undefined): CandidateStatus {
  if (evaluation.analyticsCompleted === true || evaluation.analyticsCompleted === 'Y') return 'Completed'
  if (evaluation.analyticsCompleted === false || evaluation.analyticsCompleted === 'N') return 'In progress'
  return candidate?.status ?? 'In progress'
}

function RoomEvaluationState({
  error,
  onRetry,
  pending,
}: {
  error: Error | null
  onRetry: () => void
  pending: boolean
}) {
  if (pending) return <div className="card notice room-query-state"><InlineLoader label="Loading room evaluation…" /></div>
  if (error) {
    return (
      <div className="card notice room-query-state" role="alert">
        <h3>Unable to load room evaluation</h3>
        <p>{error.message}</p>
        <Button onClick={onRetry} type="button" variant="outline">Try again</Button>
      </div>
    )
  }
  return <div className="card notice room-query-state"><h3>Room evaluation not found</h3><p>No evaluation record matched this room identifier.</p></div>
}

export function RoomPage({ roomName }: { roomName: string }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const routeCampaignId = getCampaignIdFromRoomName(roomName)
  const roomQuery = useGetRoomEvaluation(roomName, { retry: false })
  const jobsQuery = useGetCampaignJobs(routeCampaignId ?? '', { enabled: Boolean(routeCampaignId), retry: false })
  const evaluation = roomQuery.data?.find((item) => item.roomName === roomName)
  const candidateJob = jobsQuery.data?.find((job) => job.roomName === roomName)
  const candidate = useMemo(
    () => candidateJob && routeCampaignId ? toCandidateSession(candidateJob, routeCampaignId) : undefined,
    [candidateJob, routeCampaignId],
  )
  const requestedTab = searchParams.get('tab')
  const activeTab = roomTabs.find((tab) => tab.key === requestedTab)?.key ?? 'transcript'

  useEffect(() => {
    if (requestedTab !== activeTab) setSearchParams({ tab: activeTab }, { replace: true })
  }, [activeTab, requestedTab, setSearchParams])

  const campaignId = candidate?.campaignId ?? routeCampaignId
  const candidateName = candidate?.name ?? 'Candidate'
  const candidateEmail = candidate?.email ?? candidateEmailFromRoomName(roomName)
  const candidateInitials = candidate?.initials ?? initialsFor(candidateName)
  const submitted = evaluation ? submittedAt(evaluation, candidate) : { label: 'Submitted · WAT', value: 'Not available' }
  const status = evaluation ? verificationStatus(evaluation, candidate) : candidate?.status ?? 'In progress'
  const identity = evaluation?.analytic?.identity_phase1 ?? evaluation?.analytic?.deepfake_phase2?.gemini?.identityPhase1

  return (
    <main className="content" id="main-content" tabIndex={-1}>
      <Link className="back" to={campaignId ? `/jobs/campaign/${campaignId}` : '/'}>
        <ArrowLeft aria-hidden="true" size={16} />{campaignId ? `Back to campaign ${campaignId}` : 'Back to campaigns'}
      </Link>
      <header className="page-heading room-heading">
        <div className="room-title">
          <span aria-hidden="true" className="avatar avatar-0 large">{candidateInitials}</span>
          <div>
            <div className="eyebrow">CANDIDATE EVALUATION</div>
            <h1>{candidate?.name ?? 'Room evaluation'}</h1>
            <p>{candidateEmail}</p>
          </div>
        </div>
        <Button disabled={roomQuery.isFetching} onClick={() => void roomQuery.refetch()} type="button" variant="outline">
          <RefreshCw aria-hidden="true" />{roomQuery.isFetching ? 'Refreshing…' : 'Refresh results'}
        </Button>
      </header>

      <section aria-label="Session information" className="card metadata">
        <div><span>Verification status</span><StatusBadge value={status} /></div>
        <div><span>{submitted.label}</span><strong>{submitted.value}</strong></div>
        <div className="identifier"><span>Room identifier</span><code title={roomName}>{roomName}</code></div>
      </section>

      {routeCampaignId && !candidateJob && (jobsQuery.isPending ? (
        <p className="room-candidate-state" role="status">Loading candidate details from campaign jobs…</p>
      ) : jobsQuery.isError ? (
        <p className="room-candidate-state" role="status">Candidate details could not be loaded. The room identifier is shown as a fallback.</p>
      ) : jobsQuery.isSuccess ? (
        <p className="room-candidate-state" role="status">No matching campaign candidate record was returned for this room.</p>
      ) : null)}

      {roomQuery.isPending || roomQuery.isError || !evaluation ? (
        <RoomEvaluationState
          error={roomQuery.isError ? roomQuery.error : null}
          onRetry={() => void roomQuery.refetch()}
          pending={roomQuery.isPending}
        />
      ) : (
        <Tabs
          className="room-tabs"
          onValueChange={(value) => setSearchParams({ tab: value })}
          value={activeTab}
        >
          <TabsList aria-label="Room diagnostics" className="tabs" variant="line">
            {roomTabs.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key}>
                {roomTabIcons[tab.key]}{tab.label}{tab.phase && <small>{tab.phase}</small>}
              </TabsTrigger>
            ))}
          </TabsList>
          {roomTabs.map((tab) => {
            const copy = diagnosticCopy(tab.key)
            return (
              <TabsContent key={tab.key} value={tab.key}>
                <section className="card diagnostic">
                  <div className="section-heading">
                    <div>
                      <div className={tab.key === 'identity' ? 'diagnostic-title-row' : undefined}>
                        <h2>{copy.title}</h2>
                        {tab.key === 'identity' && identity && (
                          <StatusBadge className="identity-heading-outcome" value={getIdentityOutcome(identity.decision)} />
                        )}
                      </div>
                      <p>{copy.description}</p>
                    </div>
                  </div>
                  {tab.key === 'transcript' && <TranscriptPanel candidateName={candidateName} evaluation={evaluation} />}
                  {tab.key === 'identity' && <IdentityPanel identity={identity} />}
                  {tab.key === 'integrity' && <IntegrityPanel evaluation={evaluation} />}
                </section>
              </TabsContent>
            )
          })}
        </Tabs>
      )}
    </main>
  )
}
