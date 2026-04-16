import { z } from "zod";

export const symptomAssessmentSchema = z.object({
  symptoms: z
    .string()
    .min(15, "Please provide detailed symptoms (minimum 15 characters)")
    .max(3000, "Please keep symptoms under 3000 characters"),
  dependent_id: z.string().optional(),
});

export type SymptomAssessmentValues = z.infer<typeof symptomAssessmentSchema>;
