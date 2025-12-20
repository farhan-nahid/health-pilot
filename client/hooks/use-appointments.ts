"use client"

import api from "@/lib/api";
import { Appointment } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useAppointments(patientId?: string | null) {
  const { data, isLoading, error, refetch } = useQuery<Appointment[]>({
    queryKey: ["appointments", patientId],
    queryFn: async () => {
      const url = patientId ? `/appointments/?patient_id=${patientId}` : "/appointments/";
      const { data } = await api.get(url);
      return Array.isArray(data) ? data : data.results || [];
    },
  });

  return {
    appointments: data || [],
    isLoading,
    error: error ? (error as any).message : null,
    refresh: refetch
  };
}
