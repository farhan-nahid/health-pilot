import { z } from "zod";

export const profileSchema = z.object({
  // Basic Info
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),

  // Patient Info
  date_of_birth: z.string().optional().nullable(),
  blood_group: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  emergency_contact: z.string().optional().nullable(),

  // Doctor Info
  specialization: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  experience_years: z.coerce.number().min(0).optional(),
  consultation_fee: z.string().optional(),
});

export type ProfileValues = z.infer<typeof profileSchema>;
