"use client"

import api from "@/lib/api";
import { MedicalReport, UploadReportPayload } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useMedicalReports() {
  const { data, isLoading, error, refetch } = useQuery<MedicalReport[]>({
    queryKey: ["medical-reports"],
    queryFn: async () => {
      const { data } = await api.get("/medical-reports/");
      return Array.isArray(data) ? data : data.results || [];
    },
  });

  return {
    reports: data || [],
    isLoading,
    error: error ? (error as any).message : null,
    refresh: refetch
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
