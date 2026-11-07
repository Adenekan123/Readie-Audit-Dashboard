import { getRoomEvaluation, type RoomEvaluationResponse } from '@/api/room-evaluation'
import { useApiQuery, type ApiQueryOptions } from '@/hooks/custom/use-api-query'

import { roomEvaluationQueryKey } from './query-keys'

/** Fetch the evaluation records associated with a room. */
export function useGetRoomEvaluation<TData = RoomEvaluationResponse>(
  roomName: string,
  options: ApiQueryOptions<RoomEvaluationResponse, TData> = {},
) {
  return useApiQuery<RoomEvaluationResponse, TData>(
    roomEvaluationQueryKey(roomName),
    (signal) => getRoomEvaluation(roomName, signal),
    { ...options, enabled: Boolean(roomName) && options.enabled !== false },
  )
}
