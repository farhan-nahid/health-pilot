"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { DashboardSummary } from "@/types";

export function useDashboardSummary(userType?: string) {
  const { data, isLoading, error, refetch } = useQuery<DashboardSummary>({
    queryKey: ["dashboard-summary", userType],
    queryFn: async () => {
      const endpoint =
        userType === "doctor"
          ? "/doctors/dashboard_summary/"
          : "/patients/dashboard_summary/";
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
