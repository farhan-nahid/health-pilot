"use client";

import api from "@/lib/api";
import type { Doctor } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useDoctors(search: string = "", page: number = 1) {
  const { data, isLoading, error } = useQuery<any>({
    queryKey: ["doctors", search, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      if (search) {
        params.append("search", search);
      }
      const { data } = await api.get(`/doctors/?${params.toString()}`);
      return data;
    },
  });

  return {
    doctors: data?.results || [],
    count: data?.count || 0,
    isLoading,
    error: error ? (error as any).message : null,
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

export function useDoctorDocuments() {
  const { data, isLoading, error, refetch } = useQuery<any>({
    queryKey: ["doctor-documents"],
    queryFn: async () => {
      const { data } = await api.get("/doctor-documents/");
      return data;
    },
  });

  const documents = Array.isArray(data) ? data : data?.results || [];

  return {
    documents,
    isLoading,
    error: error ? (error as any).message : null,
    refetch,
  };
}

export function useUploadDoctorDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post("/doctor-documents/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-documents"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-profile"] });
    },
  });
}

export function useDeleteDoctorDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: number) => {
      await api.delete(`/doctor-documents/${documentId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-documents"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-profile"] });
    },
  });
}
