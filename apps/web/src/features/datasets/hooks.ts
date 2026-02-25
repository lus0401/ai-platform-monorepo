"use client";

import { fetchDatasets, createDataset } from "./api";

// TODO: @tanstack/react-query 추가 후 useQuery/useMutation으로 교체
export function useDatasets() {
  return {
    data: undefined as Awaited<ReturnType<typeof fetchDatasets>> | undefined,
    isLoading: false,
    error: null as Error | null,
    refetch: () => fetchDatasets(),
  };
}

export function useCreateDataset() {
  return {
    mutateAsync: createDataset,
    isPending: false,
  };
}
