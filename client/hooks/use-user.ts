"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { User } from "@/types";

export function useUser() {
  const { data, isLoading, error } = useQuery<User>({
    queryKey: ["user"],
    queryFn: async () => {
      const { data } = await api.get("/auth/user/");
      return data;
    },
    // Only fetch if a token exists in localStorage
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
    retry: false,
  });

  return {
    user: data,
    isLoading,
    error: error ? (error as any).message : null,
  };
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<User>) => {
      const { data } = await api.patch("/auth/user/", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}
