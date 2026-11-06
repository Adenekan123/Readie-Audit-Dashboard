import { useEffect, type ReactNode } from 'react'
import { ArrowLeft, Check, Clock3, Eye, Mic, ScanFace } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

import { StatusBadge } from '@/components/status-badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { findCandidateByRoom, type CandidateSession, type RoomTab } from '@/lib/demo-data'

const roomTabs: { key: RoomTab; label: string; phase: string }[] = [
  { key: 'transcript', label: 'Transcript', phase: '' },
  { key: 'identity', label: 'Identity Verification', phase: 'Phase 1' },
  { key: 'integrity', label: 'Integrity & Proctoring', phase: 'Phase 2' },
]

function Tile({ children, tone }: { children: ReactNode; tone: string }) {
  return <span aria-hidden="true" className={`tile ${tone}`}>{children}</span>
}

function ScoreMeter({ value, threshold, unit, label }: { value: number; threshold: number; unit: string; label: string }) {
  return (
    <>
      <div className="score-line">
        <strong>{value}<small>{unit}</small></strong>
        <span>Threshold {threshold}</span>
      </div>
      <div aria-label={label} aria-valuemax={100} aria-valuemin={0} aria-valuenow={value} className="track" role="meter">
        <div className={value < threshold ? 'low' : ''} style={{ width: `${value}%` }} />
        <i style={{ left: `${threshold}%` }} />
      </div>
    </>
  )
}

function PendingNotice({ title, message }: { title: string; message: string }) {
  return (
    <div className="notice">
      <Clock3 aria-hidden="true" strokeWidth={1.6} />
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  )
}

function TranscriptPanel({ candidate }: { candidate: CandidateSession }) {
  if (candidate.status === 'In progress') {
    return <PendingNotice message="The transcript will appear here when it’s ready." title="Transcript pending" />
  }

  const lines = [
    { time: '00:08', prompt: true, text: 'Tell us about a project where you simplified a complex process.' },
    { time: '00:21', prompt: false, text: 'I helped redesign the way customers tracked support requests. We started by finding the points where people were unsure what would happen next.' },
    { time: '01:42', prompt: true, text: 'What trade-off did you make?' },
    { time: '01:56', prompt: false, text: 'We focused on the three most common status updates. That gave us time to test whether customers understood each step before we added more detail.' },
  ]

  return (
    <ol className="transcript">
      {lines.map((line) => (
        <li key={line.time}>
          <time>{line.time}</time>
          <div className={line.prompt ? 'prompt' : ''}>
            <strong>{line.prompt ? 'AI interviewer' : candidate.name}</strong>
            <p>{line.text}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

function IdentityPanel({ candidate }: { candidate: CandidateSession }) {
  if (candidate.status === 'In progress') {
    return <PendingNotice message="Results will appear when verification finishes." title="Identity checks pending" />
  }

  const failed = candidate.status === 'Failed'
  return (
    <div className="diagnostic-body">
      <div className="metrics two">
        <article>
          <Tile tone="purple"><Eye strokeWidth={1.7} /></Tile>
          <h3>Biometric match confidence</h3>
          <ScoreMeter label="Face match confidence" threshold={85} unit="%" value={failed ? 63.2 : 98.4} />
        </article>
        <article>
          <Tile tone="green"><Check strokeWidth={1.8} /></Tile>
          <h3>Liveness detection</h3>
          <StatusBadge value={failed ? 'Failed' : 'Passed'} />
          <p>Checks whether a live person was present during verification.</p>
        </article>
      </div>
      <div className="finding">
        <h3>Flagged anomalies</h3>
        <p>{failed ? 'Face match fell below the configured threshold.' : 'No identity anomalies flagged.'}</p>
      </div>
    </div>
  )
}

function IntegrityPanel({ candidate }: { candidate: CandidateSession }) {
  if (candidate.status === 'In progress') {
    return <PendingNotice message="Results will appear when the analysis finishes." title="Proctoring checks pending" />
  }

  const failed = candidate.status === 'Failed'
  const warning = candidate.name === 'Stephanie Tester'
  const flagged = failed || warning
  const gazeScore = failed ? 51 : warning ? 82 : 96

  return (
    <div className="diagnostic-body">
      <div className="metrics">
        <article>
          <Tile tone="purple"><Eye strokeWidth={1.7} /></Tile>
          <h3>Gaze Tracking Index</h3>
          <ScoreMeter label="Gaze tracking index" threshold={75} unit=" / 100" value={gazeScore} />
        </article>
        <article>
          <Tile tone="amber"><Mic strokeWidth={1.7} /></Tile>
          <h3>Audio Anomaly Count</h3>
          <strong>{flagged ? 1 : 0}</strong>
        </article>
        <article>
          <Tile tone="purple"><ScanFace strokeWidth={1.7} /></Tile>
          <h3>Flagged Frames</h3>
          <strong>{flagged ? 2 : 0}</strong>
        </article>
      </div>
      <div className="finding">
        <h3>Flagged events</h3>
        {flagged ? (
          <div className="evidence">
            <details>
              <summary><time>04:32</time>Multiple faces detected <span className="badge red">Frame · High</span></summary>
              <p>A second face appeared briefly in the camera frame.</p>
            </details>
            <details>
              <summary><time>09:18</time>Possible second device <span className="badge amber">Frame · Medium</span></summary>
              <p>A handheld object appeared at the edge of the frame.</p>
            </details>
            <details>
              <summary><time>12:06</time>Background speech <span className="badge amber">Audio · Medium</span></summary>
              <p>Speech was detected while the candidate was silent.</p>
            </details>
          </div>
        ) : (
          <p>No proctoring events flagged.</p>
        )}
      </div>
    </div>
  )
}

function diagnosticCopy(tab: RoomTab): { title: string; description: string } {
  if (tab === 'transcript') return { title: 'Interview transcript', description: 'Timestamped prompts and candidate responses.' }
  if (tab === 'identity') return { title: 'Identity verification', description: 'Biometric match, liveness and flagged anomalies.' }
  return { title: 'Proctoring overview', description: 'Automated signals for auditor review.' }
}

export function RoomPage({ roomName }: { roomName: string }) {
  const candidate = findCandidateByRoom(roomName)
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const activeTab = roomTabs.find((tab) => tab.key === requestedTab)?.key ?? 'transcript'

  useEffect(() => {
    if (requestedTab !== activeTab) setSearchParams({ tab: activeTab }, { replace: true })
  }, [activeTab, requestedTab, setSearchParams])

  if (!candidate) {
    return (
      <main className="content" id="main-content" tabIndex={-1}>
        <Link className="back" to="/jobs/campaign/119"><ArrowLeft aria-hidden="true" size={16} />Back to campaigns</Link>
        <div className="notice"><h3>Room not found</h3><p>No sample interview session matches this room identifier.</p></div>
      </main>
    )
  }

  const pending = candidate.status === 'In progress'
  const outcome = candidate.status === 'Failed' ? 'Failed' : candidate.name === 'Stephanie Tester' ? 'Warning' : 'Passed'

  return (
    <main className="content" id="main-content" tabIndex={-1}>
      <Link className="back" to={`/jobs/campaign/${candidate.campaignId}`}>
        <ArrowLeft aria-hidden="true" size={16} />Back to campaign {candidate.campaignId}
      </Link>
      <header className="page-heading room-heading">
        <div className="room-title">
          <span aria-hidden="true" className="avatar avatar-0 large">{candidate.initials}</span>
          <div>
            <div className="eyebrow">CANDIDATE EVALUATION</div>
            <h1>{candidate.name}</h1>
            <p>{candidate.email}</p>
          </div>
        </div>
      </header>

      <section aria-label="Session information" className="card metadata">
        <div><span>Verification status</span><StatusBadge value={candidate.status} /></div>
        <div><span>Submitted · WAT</span><strong>{candidate.submittedAt}</strong></div>
        <div className="identifier"><span>Room identifier</span><code title={candidate.roomName}>{candidate.roomName}</code></div>
      </section>

      <Tabs
        className="room-tabs"
        onValueChange={(value) => setSearchParams({ tab: value })}
        value={activeTab}
      >
        <TabsList aria-label="Room diagnostics" className="tabs" variant="line">
          {roomTabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key}>
              {tab.label}{tab.phase && <small>{tab.phase}</small>}
            </TabsTrigger>
          ))}
        </TabsList>
        {roomTabs.map((tab) => {
          const copy = diagnosticCopy(tab.key)
          return (
            <TabsContent key={tab.key} value={tab.key}>
              <section className="card diagnostic">
                <div className="section-heading">
                  <div><h2>{copy.title}</h2><p>{copy.description}</p></div>
                  {!pending && tab.key === 'integrity' && <StatusBadge value={outcome} />}
                </div>
                {tab.key === 'transcript' && <TranscriptPanel candidate={candidate} />}
                {tab.key === 'identity' && <IdentityPanel candidate={candidate} />}
                {tab.key === 'integrity' && <IntegrityPanel candidate={candidate} />}
              </section>
            </TabsContent>
          )
        })}
      </Tabs>
    </main>
  )
}
