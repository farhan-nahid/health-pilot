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
    reports_total: number;
    reports_analyzed: number;
    unique_specializations: string[];
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

export function useDashboardSummary() {
  const { data, isLoading, error, refetch } = useQuery<DashboardSummary>({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      const { data } = await api.get("/patients/dashboard_summary/");
      return data;
    },
    retry: false,
  });

  return {
    summary: data,
    isLoading,
    error: error ? (error as any).message : null,
    refresh: refetch,
  };
}
