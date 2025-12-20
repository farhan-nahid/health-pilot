"use client"

import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Appointment } from "./use-appointments";

export interface DashboardSummary {
  user: {
    name: string;
    first_name: string;
  };
  stats: {
    appointments_total: number;
    appointments_accepted: number;
    appointments_completed: number;
    appointments_pending?: number;
    patients_total?: number;
    revenue_estimated?: number;
    reports_total: number;
    reports_analyzed: number;
    unique_specializations?: string[];
  };
  upcoming_consultations: Appointment[];
  recent_activity: {
    id: string;
    type: 'appointment' | 'report';
    title: string;
    detail: string;
    date: string;
  }[];
}

export function useDashboardSummary(userType?: string) {
  const { data, isLoading, error, refetch } = useQuery<DashboardSummary>({
    queryKey: ["dashboard-summary", userType],
    queryFn: async () => {
      const endpoint = userType === 'doctor' ? "/doctors/dashboard_summary/" : "/patients/dashboard_summary/";
      const { data } = await api.get(endpoint);
      return data;
    },
    retry: false,
    enabled: !!userType,
  });

  return {
    summary: data,
    isLoading,
    error: error ? (error as any).message : null,
    refresh: refetch,
  };
}
