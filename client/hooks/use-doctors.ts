"use client"

import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export interface Doctor {
  id: number;
  doctor_name: string;
  specialization: string;
  profile_picture: string | null;
  experience_years: number;
  consultation_fee: string;
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
