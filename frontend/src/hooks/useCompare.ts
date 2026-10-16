import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { CompareResult } from "../lib/types";

export function useCompare(usernames: string[]) {
  const joined = usernames.join(",");
  return useQuery({
    queryKey: ["compare", joined],
    queryFn: () => api<CompareResult>(`/compare?users=${encodeURIComponent(joined)}`),
    enabled: usernames.length >= 2,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}