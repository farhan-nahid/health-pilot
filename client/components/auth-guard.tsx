"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@/hooks/use-user";

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, error } = useUser();
  const router = useRouter();
  console.log({ error, isLoading, user });

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      !isLoading &&
      !user &&
      !localStorage.getItem("token")
    ) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  const hasToken =
    typeof window !== "undefined" ? !!localStorage.getItem("token") : false;

  if (isLoading || (!user && hasToken)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2"></div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2"></div>
      </div>
    );
  }

  if (user) return null;

  return <>{children}</>;
}
