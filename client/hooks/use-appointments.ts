"use client"

import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export interface Appointment {
  id: number;
  patient: number;
  patient_name: string;
  doctor: number;
  doctor_details: {
    id: number;
    doctor_name: string;
    specialization: string;
    profile_picture: string | null;
    experience_years: number;
    consultation_fee: string;
  };
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  symptoms: string;
  doctor_notes: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export function useAppointments() {
  const { data, isLoading, error, refetch } = useQuery<Appointment[]>({
    queryKey: ["appointments"],
    queryFn: async () => {
      const { data } = await api.get("/appointments/");
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
