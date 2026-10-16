import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { SavedComparison } from "../lib/types";

export function useComparisons() {
  return useQuery({
    queryKey: ["comparisons"],
    queryFn: () => api<{ comparisons: SavedComparison[] }>("/comparisons"),
  });
}

export function useCreateComparison() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; usernames: string[] }) =>
      api<{ comparison: SavedComparison }>("/comparisons", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comparisons"] }),
  });
}

export function useUpdateComparison() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: number; name?: string; usernames?: string[] }) =>
      api<{ comparison: SavedComparison }>(`/comparisons/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comparisons"] }),
  });
}

export function useDeleteComparison() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api<null>(`/comparisons/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comparisons"] }),
  });
}