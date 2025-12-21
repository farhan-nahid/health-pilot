import { z } from "zod";

export const accountSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().optional().nullable(),
});

export type AccountValues = z.infer<typeof accountSchema>;

export const patientProfileSchema = z.object({
  date_of_birth: z.string().optional().nullable(),
  blood_group: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  emergency_contact: z.string().optional().nullable(),
});

export type PatientProfileValues = z.infer<typeof patientProfileSchema>;

export const doctorProfileSchema = z.object({
  specialization: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  experience_years: z.coerce.number().min(0).optional(),
  consultation_fee: z.string().optional(),
});

export type DoctorProfileValues = z.infer<typeof doctorProfileSchema>;

// Keep for backward compatibility if needed, though we should transition away
export const profileSchema = z.object({
  ...accountSchema.shape,
  ...patientProfileSchema.shape,
  ...doctorProfileSchema.shape,
});

export type ProfileValues = z.infer<typeof profileSchema>;
