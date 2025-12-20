"use client"

import api from "@/lib/api";
import { Doctor } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useDoctors() {
  const { data, isLoading, error } = useQuery<Doctor[]>({
    queryKey: ["doctors"],
    queryFn: async () => {
      const { data } = await api.get("/doctors/");
      return Array.isArray(data) ? data : data.results || [];
    },
  });

  return {
    doctors: data || [],
    isLoading,
    error: error ? (error as any).message : null
  };
}

export function useDoctorProfile() {
  const { data, isLoading, error } = useQuery<Doctor>({
    queryKey: ["doctor-profile"],
    queryFn: async () => {
      const { data } = await api.get("/doctors/profile/");
      return data;
    },
    retry: false,
  });

  return {
    profile: data,
    isLoading,
    error: error ? (error as any).message : null,
  };
}

export function useUpdateDoctorProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<Doctor>) => {
      const { data } = await api.patch("/doctors/update_profile/", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-profile"] });
    },
  });
}
