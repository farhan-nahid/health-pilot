import { PatientsClient } from "@/components/dashboard/patients/patients-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Patients",
  description: "View and manage your patient records and clinical history.",
};

export default function PatientsPage() {
  return <PatientsClient />;
}
