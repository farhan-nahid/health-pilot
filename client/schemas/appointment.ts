import { z } from "zod";

export const prescriptionMedicineSchema = z.object({
  name: z.string().optional().default(""),
  dose: z.string().optional().default(""),
  when_to_take: z.string().optional().default(""),
  duration: z.string().optional().default(""),
  instructions: z.string().optional().default(""),
});

export const appointmentSchema = z.object({
  doctor: z.string().min(1, "Please select a doctor"),
  appointment_date: z.date({ message: "Please select a date" }),
  appointment_time: z.string().min(1, "Please select a time slot"),
  symptoms: z.string().min(10, "Please describe your symptoms (min 10 characters)"),
  dependent_id: z.string().optional(),
});

export const completeAppointmentSchema = z.object({
  doctor_notes: z.string().min(1, "Please provide clinical notes"),
  medicines: z.array(prescriptionMedicineSchema).default([
    {
      name: "",
      dose: "",
      when_to_take: "",
      duration: "",
      instructions: "",
    },
  ]),
  follow_up_required: z.boolean().default(false),
  follow_up_date: z.string().optional(),
  follow_up_notes: z.string().optional().default(""),
});

export type AppointmentValues = z.infer<typeof appointmentSchema>;
export type CompleteAppointmentValues = z.infer<typeof completeAppointmentSchema>;
