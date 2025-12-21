import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview of your health data and upcoming activities.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
