import { useRef, useState } from 'react'
import { Link, Outlet, useMatch } from 'react-router-dom'
import { PanelLeftClose } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { findCandidateByRoom } from '@/lib/demo-data'

function BrandMark() {
  return (
    <span className="brand">
      <svg aria-hidden="true" viewBox="0 0 28 28">
        <path fill="currentColor" d="M3 25V12C3 5 8 2 15 2c6 0 10 3 10 8 0 3-2 6-6 7l6 8h-7L9 12l7 1L8 6v19z" />
      </svg>
      <b>readie<span>.</span></b>
    </span>
  )
}

function AuditorDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null)

  return (
    <>
      <Button className="sidebar-logout" onClick={() => dialogRef.current?.showModal()} type="button" variant="ghost">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 4H4v16h5m5-12 4 4-4 4M8 12h12" />
        </svg>
        Logout
        <span className="logout-role">Auditor</span>
      </Button>
      <dialog aria-labelledby="logout-title" className="filter-modal logout-dialog" ref={dialogRef}>
        <form method="dialog">
          <header>
            <div>
              <h2 id="logout-title">Logout</h2>
              <p>This interactive design uses a sample auditor profile. There is no signed-in session to end.</p>
            </div>
          </header>
          <footer>
            <Button autoFocus>Back to dashboard</Button>
          </footer>
        </form>
      </dialog>
    </>
  )
}

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const campaignMatch = useMatch('/jobs/campaign/:campaignId')
  const roomMatch = useMatch('/jobs/room/:roomName')
  const roomCandidate = findCandidateByRoom(roomMatch?.params.roomName)
  const campaignId = campaignMatch?.params.campaignId ?? roomCandidate?.campaignId ?? '119'

  return (
    <div className={`app${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <aside className="sidebar" id="navigation-sidebar">
        <Link className="brand-link" to={`/jobs/campaign/${campaignId}`}>
          <BrandMark />
        </Link>
        <span className="nav-label">WORKSPACE</span>
        <Link className="sidebar-link" to={`/jobs/campaign/${campaignId}`}>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65">
            <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
          </svg>
          Campaigns
        </Link>
        <AuditorDialog />
      </aside>

      <div className="main">
        <div className="dashboard-profile" aria-label="Profile, Alex Morgan">
          <span className="profile-greeting">Welcome back,<strong>Alex Morgan</strong></span>
          <span className="avatar avatar-0" aria-hidden="true">AM</span>
        </div>
        <header className="topbar">
          <div className="crumb"><span>Audit workspace</span><span aria-hidden="true">›</span><strong>Campaign {campaignId}</strong></div>
          <span className="demo"><i />Interactive design</span>
        </header>
        <Outlet />
        <footer className="app-footer">
          Readie · Candidate Integrity &amp; Audit Portal
          <span>Sample sessions · All submission times in WAT</span>
        </footer>
      </div>

      <Button
        aria-controls="navigation-sidebar"
        aria-expanded={!sidebarCollapsed}
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className={`sidebar-toggle${sidebarCollapsed ? ' is-collapsed' : ''}`}
        onClick={() => setSidebarCollapsed((current) => !current)}
        size="icon"
        type="button"
        variant="ghost"
      >
        <PanelLeftClose aria-hidden="true" size={18} strokeWidth={1.8} />
      </Button>
    </div>
  )
}
