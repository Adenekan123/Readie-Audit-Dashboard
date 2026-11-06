import { Link, Navigate, Route, Routes, useParams } from 'react-router-dom'

import { DashboardLayout } from '@/components/dashboard-layout'
import { CampaignPage } from '@/pages/campaign-page'
import { RoomPage } from '@/pages/room-page'
import { isCampaignId } from '@/lib/demo-data'

function CampaignRoute() {
  const { campaignId } = useParams<{ campaignId: string }>()
  if (!isCampaignId(campaignId)) return <Navigate replace to="/jobs/campaign/119" />
  return <CampaignPage campaignId={campaignId} key={campaignId} />
}

function RoomRoute() {
  const { roomName } = useParams<{ roomName: string }>()
  if (!roomName) return <Navigate replace to="/jobs/campaign/119" />
  return <RoomPage key={roomName} roomName={roomName} />
}

function NotFoundPage() {
  return (
    <main className="content" id="main-content" tabIndex={-1}>
      <p className="eyebrow">PAGE NOT FOUND</p>
      <h1>This portal route doesn’t exist.</h1>
      <p><Link className="back" to="/jobs/campaign/119">Return to campaigns</Link></p>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route element={<Navigate replace to="/jobs/campaign/119" />} index />
        <Route element={<CampaignRoute />} path="jobs/campaign/:campaignId" />
        <Route element={<RoomRoute />} path="jobs/room/:roomName" />
        <Route element={<NotFoundPage />} path="*" />
      </Route>
    </Routes>
  )
}

export default App
