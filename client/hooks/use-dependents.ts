"use client";

import api from "@/lib/api";
import type { Dependent, DependentCreateData, DependentUpdateData } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useDependents() {
  const { data, isLoading, error } = useQuery<Dependent[]>({
    queryKey: ["dependents"],
    queryFn: async () => {
      const { data } = await api.get("/dependents/");
      return data.results || data; // Handle pagination if present, though views.py might just return list if no pagination set
    },
  });

  return {
    dependents: data || [],
    isLoading,
    error: error ? (error as any).message : null,
  };
}

export function useCreateDependent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: DependentCreateData) => {
      const { data } = await api.post("/dependents/", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dependents"] });
    },
  });
}

export function useUpdateDependent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: DependentUpdateData }) => {
      const response = await api.patch(`/dependents/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dependents"] });
    },
  });
}

export function useDeleteDependent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/dependents/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dependents"] });
    },
  });
}
