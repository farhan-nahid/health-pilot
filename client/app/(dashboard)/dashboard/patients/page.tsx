import { PatientsClient } from "@/components/dashboard/patients/patients-client";

export const metadata = {
  title: "Patients | Health Pilot",
  description: "View and manage your patients",
};

export default function PatientsPage() {
  return <PatientsClient />;
}
