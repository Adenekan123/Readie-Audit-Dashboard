import { getCampaignJobs, type CampaignJobsResponse } from '@/api/campaign-jobs'
import type { CampaignId } from '@/shared/types/candidate'
import { useApiQuery, type ApiQueryOptions } from '@/hooks/custom/use-api-query'

import { campaignJobsQueryKey } from './query-keys'

/** Fetch evaluation jobs for one campaign. */
export function useGetCampaignJobs<TData = CampaignJobsResponse>(
  campaignId: CampaignId,
  options: ApiQueryOptions<CampaignJobsResponse, TData> = {},
) {
  return useApiQuery<CampaignJobsResponse, TData>(
    campaignJobsQueryKey(campaignId),
    (signal) => getCampaignJobs(campaignId, signal),
    options,
  )
}
