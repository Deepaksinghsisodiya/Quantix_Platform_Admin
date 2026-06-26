export function wrapMutation<
  TTrigger extends (arg: any) => { unwrap: () => Promise<any> },
  TResult extends { isLoading: boolean; isSuccess: boolean; isError: boolean; error?: any; data?: any }
>(trigger: TTrigger, result: TResult) {
  type TVariables = Parameters<TTrigger>[0];
  type TData = any; // We can use the unwrap return type if we want, but any is simple and avoids complex generic inference issues.

  interface MutateOptions {
    onSuccess?: (data: TData, variables: TVariables, context: any) => void;
    onError?: (error: any, variables: TVariables, context: any) => void;
    onSettled?: (data: TData | undefined, error: any | null, variables: TVariables, context: any) => void;
  }

  return {
    mutate: (args: TVariables, options?: MutateOptions) => {
      trigger(args)
        .unwrap()
        .then((data) => {
          options?.onSuccess?.(data, args, undefined);
          options?.onSettled?.(data, null, args, undefined);
        })
        .catch((err) => {
          options?.onError?.(err, args, undefined);
          options?.onSettled?.(undefined, err, args, undefined);
        });
    },
    mutateAsync: async (args: TVariables, options?: MutateOptions) => {
      try {
        const data = await trigger(args).unwrap();
        options?.onSuccess?.(data, args, undefined);
        options?.onSettled?.(data, null, args, undefined);
        return data;
      } catch (err) {
        options?.onError?.(err, args, undefined);
        options?.onSettled?.(undefined, err, args, undefined);
        throw err;
      }
    },
    isPending: result.isLoading,
    isLoading: result.isLoading,
    isSuccess: result.isSuccess,
    isError: result.isError,
    error: result.error,
    data: result.data,
    reset: () => {},
  };
}


export function wrapQuery<TResult extends { data: any; isLoading: boolean; isFetching: boolean; isError: boolean; error: any; refetch: any }>(
  result: TResult
) {
  return {
    data: result.data,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
}
