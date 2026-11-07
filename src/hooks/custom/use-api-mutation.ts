import { useMutation, type UseMutationOptions } from '@tanstack/react-query'

export type ApiMutationFn<TData, TVariables> = (variables: TVariables) => Promise<TData>

export type ApiMutationOptions<TData, TVariables, TContext = unknown> = Omit<
  UseMutationOptions<TData, Error, TVariables, TContext>,
  'mutationFn'
>

export function useApiMutation<TData, TVariables = void, TContext = unknown>(
  mutationFn: ApiMutationFn<TData, TVariables>,
  options: ApiMutationOptions<TData, TVariables, TContext> = {},
) {
  return useMutation<TData, Error, TVariables, TContext>({
    ...options,
    mutationFn,
  })
}
