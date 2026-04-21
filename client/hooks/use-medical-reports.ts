"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  CreateSymptomAssessmentPayload,
  PaginatedResponse,
  SymptomAssessment,
} from "@/types";

export function useSymptomAssessments(page: number = 1) {
  const { data, isLoading, error, refetch } = useQuery<
    PaginatedResponse<SymptomAssessment>
  >({
    queryKey: ["symptom-assessments", page],
    queryFn: async () => {
      const url =
        page > 1 ? `/symptom-assessments/?page=${page}` : "/symptom-assessments/";
      const { data } = await api.get(url);

      if (data.results) {
        return data as PaginatedResponse<SymptomAssessment>;
      }
      return {
        count: (data as SymptomAssessment[]).length,
        next: null,
        previous: null,
        results: data as SymptomAssessment[],
      };
    },
  });

  return {
    reports: data?.results || [],
    count: data?.count || 0,
    next: data?.next,
    previous: data?.previous,
    isLoading,
    error: error ? (error as any).message : null,
    refresh: refetch,
  };
}

export function useAnalyzeSymptoms() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSymptomAssessmentPayload) => {
      const { data } = await api.post("/symptom-assessments/", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["symptom-assessments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });
}
