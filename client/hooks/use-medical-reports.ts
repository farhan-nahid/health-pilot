"use client"

import api from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface MedicalReport {
  id: number;
  patient: number;
  patient_name: string;
  report_file: string;
  symptoms: string;
  ai_specialization: string | null;
  ai_summary: string | null;
  extracted_text: string | null;
  uploaded_at: string;
}

export interface UploadReportPayload {
  report_file: File;
  symptoms: string;
}

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
