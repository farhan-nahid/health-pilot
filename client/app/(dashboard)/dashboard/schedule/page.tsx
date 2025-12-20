import { ScheduleClient } from "@/components/dashboard/schedule/schedule-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Schedule | Health Pilot",
  description: "Manage your weekly availability slots.",
};

export default function SchedulePage() {
  return <ScheduleClient />;
}
