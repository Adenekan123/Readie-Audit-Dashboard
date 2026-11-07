import { useState } from 'react'
import { Link, Outlet, useMatch } from 'react-router-dom'
import { PanelLeftClose } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getCampaignIdFromRoomName } from '@/shared/lib/campaign-routing'

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

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const campaignMatch = useMatch('/jobs/campaign/:campaignId')
  const roomMatch = useMatch('/jobs/room/:roomName')
  const roomCampaignId = getCampaignIdFromRoomName(roomMatch?.params.roomName)
  const campaignId = campaignMatch?.params.campaignId ?? roomCampaignId
  const campaignPath = campaignId ? `/jobs/campaign/${campaignId}` : '/'

  return (
    <div className={`app${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <aside className="sidebar" id="navigation-sidebar">
        <Link className="brand-link" to={campaignPath}>
          <BrandMark />
        </Link>
        <span className="nav-label">WORKSPACE</span>
        <Link className="sidebar-link" to={campaignPath}>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65">
            <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
          </svg>
          Campaigns
        </Link>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="crumb"><span>Audit workspace</span>{campaignId && <><span aria-hidden="true">›</span><strong>Campaign {campaignId}</strong></>}</div>
        </header>
        <Outlet />
        <footer className="app-footer">
          Readie · Candidate Integrity &amp; Audit Portal
          <span>Developer: Usman Adenekan</span>
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
