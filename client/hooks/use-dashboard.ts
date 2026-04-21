"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { DashboardActivityItem, DashboardSummary, PaginatedResponse } from "@/types";

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

export function useDashboardActivity(userType?: string, page: number = 1) {
  const { data, isLoading, error, refetch } = useQuery<
    PaginatedResponse<DashboardActivityItem>
  >({
    queryKey: ["dashboard-activity", userType, page],
    queryFn: async () => {
      const baseEndpoint =
        userType === "doctor" ? "/doctors/activity/" : "/patients/activity/";
      const endpoint = page > 1 ? `${baseEndpoint}?page=${page}` : baseEndpoint;

      const { data } = await api.get(endpoint);
      if (data.results) {
        return data as PaginatedResponse<DashboardActivityItem>;
      }

      return {
        count: (data as DashboardActivityItem[]).length,
        next: null,
        previous: null,
        results: data as DashboardActivityItem[],
      };
    },
    retry: false,
    enabled: !!userType,
  });

  return {
    activities: data?.results || [],
    count: data?.count || 0,
    isLoading,
    error: error ? (error as any).message : null,
    refresh: refetch,
  };
}
