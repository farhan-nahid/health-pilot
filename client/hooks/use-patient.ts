"use client"

import api from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Patient {
  id: number;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
  };
  date_of_birth: string | null;
  blood_group: string | null;
  address: string | null;
  emergency_contact: string | null;
  created_at: string;
  updated_at: string;
}

export function usePatientProfile() {
  const { data, isLoading, error } = useQuery<Patient>({
    queryKey: ["patient-profile"],
    queryFn: async () => {
      const { data } = await api.get("/patients/profile/");
      return data;
    },
    // Only fetch for patients
    retry: false,
  });

  return {
    profile: data,
    isLoading,
    error: error ? (error as any).message : null,
  };
}

export function usePatients() {
  const { data, isLoading, error } = useQuery<Patient[]>({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data } = await api.get("/patients/");
      return Array.isArray(data) ? data : data.results || [];
    },
  });

  return {
    patients: data || [],
    isLoading,
    error: error ? (error as any).message : null,
  };
}

export function useUpdatePatientProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<Patient>) => {
      const { data } = await api.patch("/patients/update_profile/", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-profile"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}
