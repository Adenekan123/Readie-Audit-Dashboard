import { ClipboardList, Sparkles } from 'lucide-react'

import type { CampaignId } from '@/shared/types/candidate'

export function NoAssessmentSessions({ campaignId }: { campaignId: CampaignId }) {
  return (
    <div className="campaign-empty-state" role="status">
      <div aria-hidden="true" className="campaign-empty-art">
        <span className="campaign-empty-back-sheet" />
        <span className="campaign-empty-front-sheet"><ClipboardList strokeWidth={1.6} /></span>
        <span className="campaign-empty-spark"><Sparkles strokeWidth={1.8} /></span>
        <span className="campaign-empty-dot" />
      </div>
      <span className="campaign-empty-eyebrow">CAMPAIGN {campaignId}</span>
      <h3>No assessment sessions yet</h3>
      <p>Candidate submissions will appear here once interviews are completed.</p>
    </div>
  )
}
