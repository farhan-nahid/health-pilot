"use client"

import api from "@/lib/api";
import { Appointment, PaginatedResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useAppointments(patientId?: string | null, page: number = 1) {
  const { data, isLoading, error, refetch } = useQuery<PaginatedResponse<Appointment>>({
    queryKey: ["appointments", patientId, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (patientId) params.append("patient_id", patientId);
      if (page > 1) params.append("page", page.toString());

      const url = `/appointments/?${params.toString()}`;
      const { data } = await api.get(url);

      // Handle both paginated and non-paginated responses
      if (data.results) {
        return data as PaginatedResponse<Appointment>;
      }
      return {
        count: (data as Appointment[]).length,
        next: null,
        previous: null,
        results: data as Appointment[]
      };
    },
  });

  return {
    appointments: data?.results || [],
    count: data?.count || 0,
    next: data?.next,
    previous: data?.previous,
    isLoading,
    error: error ? (error as any).message : null,
    refresh: refetch
  };
}
