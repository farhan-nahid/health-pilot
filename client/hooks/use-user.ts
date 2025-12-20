"use client"

import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_type: "doctor" | "patient";
  phone: string;
}

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
