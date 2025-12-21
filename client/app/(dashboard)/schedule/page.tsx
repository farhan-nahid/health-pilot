import type { Metadata } from "next";
import { ScheduleClient } from "./_components/schedule-client";

export const metadata: Metadata = {
  title: "My Schedule",
  description: "Manage your weekly availability slots.",
};

export default function SchedulePage() {
  return <ScheduleClient />;
}
