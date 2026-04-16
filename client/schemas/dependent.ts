import { z } from "zod";

export const dependentSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(255),
    relationship: z.enum(["Son", "Daughter", "Spouse", "Parent", "Other"]),
    date_of_birth: z.string().min(1, "Date of birth is required"), // Validate date format if needed
    gender: z.enum(["Male", "Female", "Other"]),
    blood_group: z.string().max(5).optional(),
    create_account: z.boolean().default(false).optional(),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.create_account) {
        return !!data.email && !!data.password;
      }
      return true;
    },
    {
      message: "Email and Password are required when creating an account",
      path: ["email"], // Error will point to email field
    },
  );

export type DependentValues = z.infer<typeof dependentSchema>;
