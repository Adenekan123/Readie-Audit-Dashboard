import { Link, Navigate, Route, Routes, useParams } from 'react-router-dom'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { CampaignPage } from '@/features/campaigns/pages/campaign-page'
import { RoomPage } from '@/features/room-review/pages/room-page'
import { getLastOpenedCampaignId } from '@/features/campaigns/model/recent-campaigns'
import { isCampaignId } from '@/shared/lib/campaign-routing'

const DEFAULT_CAMPAIGN_ID = '119'

function CampaignLandingRoute() {
  const campaignId = getLastOpenedCampaignId() ?? DEFAULT_CAMPAIGN_ID
  return <Navigate replace to={`/jobs/campaign/${campaignId}`} />
}

function CampaignRoute() {
  const { campaignId } = useParams<{ campaignId: string }>()
  if (!isCampaignId(campaignId)) return <Navigate replace to="/" />
  return <CampaignPage campaignId={campaignId} key={campaignId} />
}

function RoomRoute() {
  const { roomName } = useParams<{ roomName: string }>()
  if (!roomName) return <Navigate replace to="/" />
  return <RoomPage key={roomName} roomName={roomName} />
}

function NotFoundPage() {
  return (
    <main className="content" id="main-content" tabIndex={-1}>
      <p className="eyebrow">PAGE NOT FOUND</p>
      <h1>This portal route does not exist.</h1>
      <p><Link className="back" to="/">Return to campaigns</Link></p>
    </main>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route element={<CampaignLandingRoute />} index />
        <Route element={<CampaignRoute />} path="jobs/campaign/:campaignId" />
        <Route element={<RoomRoute />} path="jobs/room/:roomName" />
        <Route element={<NotFoundPage />} path="*" />
      </Route>
    </Routes>
  )
}
