"use client"

import api from "@/lib/api";
import { useEffect, useState } from "react";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'patient' | 'doctor';
  phone: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get("/auth/user/");
        setUser(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to fetch user");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, isLoading, error };
}
