import type { Metadata } from "next";
import { Suspense } from "react";
import { AppointmentsClient } from "./_components/appointments-client";

export const metadata: Metadata = {
  title: "Appointments",
  description: "Manage your medical appointments and consultations.",
};

export default function AppointmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          Loading appointments...
        </div>
      }
    >
      <AppointmentsClient />
    </Suspense>
  );
}
