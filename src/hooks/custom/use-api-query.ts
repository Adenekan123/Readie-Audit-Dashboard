import { useQuery, type QueryKey, type UseQueryOptions } from '@tanstack/react-query'

export type ApiQueryOptions<TQueryFnData, TData = TQueryFnData> = Omit<
  UseQueryOptions<TQueryFnData, Error, TData, QueryKey>,
  'queryKey' | 'queryFn'
>

export function useApiQuery<TQueryFnData, TData = TQueryFnData>(
  queryKey: QueryKey,
  queryFn: (signal: AbortSignal) => Promise<TQueryFnData>,
  options: ApiQueryOptions<TQueryFnData, TData> = {},
) {
  return useQuery<TQueryFnData, Error, TData, QueryKey>({
    ...options,
    queryKey,
    queryFn: ({ signal }) => queryFn(signal),
  })
}
