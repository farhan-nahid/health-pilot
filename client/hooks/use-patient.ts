"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { PaginatedResponse, Patient } from "@/types";

export function usePatientProfile() {
  const { data, isLoading, error } = useQuery<Patient>({
    queryKey: ["patient-profile"],
    queryFn: async () => {
      const { data } = await api.get("/patients/profile/");
      return data;
    },
    // Only fetch for patients
    retry: false,
  });

  return {
    profile: data,
    isLoading,
    error: error ? (error as any).message : null,
  };
}

export function usePatients(search: string = "", page: number = 1) {
  const { data, isLoading, error } = useQuery<PaginatedResponse<Patient>>({
    queryKey: ["patients", search, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      if (search) {
        params.append("search", search);
      }
      const { data } = await api.get(`/patients/?${params.toString()}`);

      if (data.results) {
        return data as PaginatedResponse<Patient>;
      }
      return {
        count: (data as Patient[]).length,
        next: null,
        previous: null,
        results: data as Patient[],
      };
    },
  });

  return {
    patients: data?.results || [],
    count: data?.count || 0,
    next: data?.next,
    previous: data?.previous,
    isLoading,
    error: error ? (error as any).message : null,
  };
}

export function useUpdatePatientProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<Patient>) => {
      const { data } = await api.patch("/patients/update_profile/", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-profile"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}
