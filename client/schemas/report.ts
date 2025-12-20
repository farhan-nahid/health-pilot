import { z } from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ["application/pdf"];

export const uploadReportSchema = z.object({
  report_file: z
    .any()
    .refine((file) => file instanceof File, "Medical report file is required")
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max file size is 10MB.`)
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file?.type),
      "Only .pdf format is supported."
    ),
  symptoms: z.string().min(10, "Please provide context about your symptoms (min 10 characters)"),
});

export type UploadReportValues = z.infer<typeof uploadReportSchema>;
