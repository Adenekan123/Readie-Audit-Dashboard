import type { CampaignId } from '@/shared/types/candidate'
import type { RoomTab } from '@/shared/types/room-review'

export function isCampaignId(value: string | undefined): value is CampaignId {
  return value !== undefined && /^\d+$/.test(value) && Number(value) > 0
}

export function getCampaignIdFromRoomName(roomName: string | undefined): CampaignId | undefined {
  const match = roomName?.match(/^campaign_(\d+)interview/)
  return match && isCampaignId(match[1]) ? match[1] : undefined
}

export function getRoomPath(roomName: string, tab: RoomTab = 'transcript'): string {
  return `/jobs/room/${encodeURIComponent(roomName)}?tab=${tab}`
}
