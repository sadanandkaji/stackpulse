import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { DeveloperProfile } from "../lib/types";

const key = (username: string) => ["developer", username.toLowerCase()];

export function useDeveloper(username: string) {
  return useQuery({
    queryKey: key(username),
    queryFn: () => api<DeveloperProfile>(`/developers/${encodeURIComponent(username)}`),
    enabled: username.length > 0,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRefreshDeveloper(username: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api<DeveloperProfile>(`/developers/${encodeURIComponent(username)}/refresh`, { method: "POST" }),
    onSuccess: (data) => queryClient.setQueryData(key(username), data),
  });
}