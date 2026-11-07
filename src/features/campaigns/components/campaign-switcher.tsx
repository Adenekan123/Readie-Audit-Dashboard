import { useEffect, useState } from 'react'
import { Filter } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getRecentCampaignIds, rememberCampaignId } from '@/features/campaigns/model/recent-campaigns'
import type { CampaignId } from '@/shared/types/candidate'

const PDF_TEST_CAMPAIGN_IDS: CampaignId[] = ['119', '120', '122', '123']

export function CampaignSwitcher({ campaignId }: { campaignId: CampaignId }) {
  const navigate = useNavigate()
  const [recentCampaignIds, setRecentCampaignIds] = useState(getRecentCampaignIds)
  const campaignOptions = [...new Set([...PDF_TEST_CAMPAIGN_IDS, campaignId, ...recentCampaignIds])]

  useEffect(() => {
    rememberCampaignId(campaignId)
    setRecentCampaignIds(getRecentCampaignIds())
  }, [campaignId])

  return (
    <div className="filter-control campaign-filter">
      <Filter aria-hidden="true" strokeWidth={1.7} />
      <Select value={campaignId} onValueChange={(value) => navigate(`/jobs/campaign/${value}`)}>
        <SelectTrigger aria-label="Switch campaign" className="control-select-trigger">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start" avoidCollisions={false} className="dashboard-select-content" position="popper" side="bottom">
          {campaignOptions.map((id) => (
            <SelectItem className="dashboard-select-item" key={id} value={id}>Campaign {id}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
