import { z } from "zod";

export const appointmentSchema = z.object({
  doctor: z.string().min(1, "Please select a doctor"),
  appointment_date: z.date({ message: "Please select a date" }),
  appointment_time: z.string().min(1, "Please select a time slot"),
  symptoms: z.string().min(10, "Please describe your symptoms (min 10 characters)"),
  dependent_id: z.string().optional(),
});

export const completeAppointmentSchema = z.object({
  doctor_notes: z.string().min(1, "Please provide clinical notes"),
});

export type AppointmentValues = z.infer<typeof appointmentSchema>;
export type CompleteAppointmentValues = z.infer<typeof completeAppointmentSchema>;
