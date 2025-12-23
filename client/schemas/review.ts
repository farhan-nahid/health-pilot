import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.coerce
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  comment: z
    .string()
    .min(10, "Review must be at least 10 characters long")
    .max(500, "Review must be less than 500 characters"),
});

export type ReviewValues = z.infer<typeof reviewSchema>;
