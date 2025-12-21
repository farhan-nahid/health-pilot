import type { Metadata } from "next";
import { Suspense } from "react";
import { PatientsClient } from "./_components/patients-client";

export const metadata: Metadata = {
  title: "Patients",
  description: "View and manage your patient records and clinical history.",
};

export default function PatientsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">Loading patients...</div>
      }
    >
      <PatientsClient />
    </Suspense>
  );
}
