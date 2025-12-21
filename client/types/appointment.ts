import type { Doctor } from "./doctor";
import type { Patient } from "./patient";

export interface Appointment {
  id: number;
  patient: number;
  patient_name: string;
  patient_details: Patient;
  doctor: number;
  doctor_details: Doctor;
  appointment_date: string;
  appointment_time: string;
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
  symptoms: string;
  doctor_notes: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}
