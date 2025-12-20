import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Health Pilot",
  description: "Overview of your health data and upcoming activities.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
