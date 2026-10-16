import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Pin } from "../lib/types";

export function usePins() {
  return useQuery({
    queryKey: ["pins"],
    queryFn: () => api<{ pins: Pin[] }>("/pins"),
  });
}

export function useCreatePin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { repoId: number; note?: string; tags?: string[] }) =>
      api<{ pin: Pin }>("/pins", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pins"] }),
  });
}

export function useUpdatePin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: number; note?: string | null; tags?: string[] }) =>
      api<{ pin: Pin }>(`/pins/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pins"] }),
  });
}

export function useDeletePin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api<null>(`/pins/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pins"] }),
  });
}