"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { MedicalReport, PaginatedResponse, UploadReportPayload } from "@/types";

export function useMedicalReports(page: number = 1) {
  const { data, isLoading, error, refetch } = useQuery<PaginatedResponse<MedicalReport>>({
    queryKey: ["medical-reports", page],
    queryFn: async () => {
      const url = page > 1 ? `/medical-reports/?page=${page}` : "/medical-reports/";
      const { data } = await api.get(url);

      if (data.results) {
        return data as PaginatedResponse<MedicalReport>;
      }
      return {
        count: (data as MedicalReport[]).length,
        next: null,
        previous: null,
        results: data as MedicalReport[],
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

export function useUploadReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UploadReportPayload) => {
      const formData = new FormData();
      formData.append("report_file", payload.report_file);
      formData.append("symptoms", payload.symptoms);

      const { data } = await api.post("/medical-reports/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-reports"] });
    },
  });
}
