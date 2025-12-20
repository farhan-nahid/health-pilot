"use client"

import api from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Doctor {
  id: number;
  doctor_name: string;
  specialization: string;
  bio: string | null;
  profile_picture: string | null;
  experience_years: number;
  consultation_fee: string;
  created_at?: string;
  updated_at?: string;
}

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
