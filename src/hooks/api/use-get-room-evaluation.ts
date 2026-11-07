import { getRoomEvaluation, type RoomEvaluationResponse } from '@/api/room-evaluation'
import { useApiMode } from '@/hooks/custom/use-api-mode'
import { useApiQuery, type ApiQueryOptions } from '@/hooks/custom/use-api-query'

import { roomEvaluationQueryKey } from './query-keys'

/** Fetch the evaluation records associated with a room. */
export function useGetRoomEvaluation<TData = RoomEvaluationResponse>(
  roomName: string,
  options: ApiQueryOptions<RoomEvaluationResponse, TData> = {},
) {
  const mode = useApiMode()

  return useApiQuery<RoomEvaluationResponse, TData>(
    roomEvaluationQueryKey(roomName, mode),
    (signal) => getRoomEvaluation(roomName, signal),
    { ...options, enabled: Boolean(roomName) && options.enabled !== false },
  )
}
