import { getCampaignJobs, type CampaignJobsResponse } from '@/api/campaign-jobs'
import { useApiMode } from '@/hooks/custom/use-api-mode'
import type { CampaignId } from '@/shared/types/candidate'
import { useApiQuery, type ApiQueryOptions } from '@/hooks/custom/use-api-query'

import { campaignJobsQueryKey } from './query-keys'

/** Fetch evaluation jobs for one campaign. */
export function useGetCampaignJobs<TData = CampaignJobsResponse>(
  campaignId: CampaignId,
  options: ApiQueryOptions<CampaignJobsResponse, TData> = {},
) {
  const mode = useApiMode()

  return useApiQuery<CampaignJobsResponse, TData>(
    campaignJobsQueryKey(campaignId, mode),
    (signal) => getCampaignJobs(campaignId, signal),
    options,
  )
}
