import { isCampaignId } from '@/shared/lib/campaign-routing'
import type { CampaignId } from '@/shared/types/candidate'

const STORAGE_KEY = 'readie.audit.recent-campaign-ids'
const MAX_RECENT_CAMPAIGNS = 8

export function getRecentCampaignIds(): CampaignId[] {
  try {
    const storedValue: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (!Array.isArray(storedValue)) return []
    return [...new Set(storedValue.filter((value): value is string => typeof value === 'string' && isCampaignId(value)))].slice(0, MAX_RECENT_CAMPAIGNS)
  } catch {
    return []
  }
}

export function rememberCampaignId(campaignId: CampaignId) {
  try {
    const recentIds = getRecentCampaignIds().filter((id) => id !== campaignId)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([campaignId, ...recentIds].slice(0, MAX_RECENT_CAMPAIGNS)))
  } catch {
    // Campaign navigation still works when browser storage is unavailable.
  }
}

export function getLastOpenedCampaignId(): CampaignId | undefined {
  return getRecentCampaignIds()[0]
}
