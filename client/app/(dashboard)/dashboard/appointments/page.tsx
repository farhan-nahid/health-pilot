import { AppointmentsClient } from "@/components/dashboard/appointments/appointments-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Appointments",
  description: "Manage your medical appointments and consultations.",
};

export default function AppointmentsPage() {
  return <AppointmentsClient />;
}
