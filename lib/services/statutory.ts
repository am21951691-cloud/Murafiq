import { z } from "zod";

export const StatutoryQuerySchema = z.object({
  query: z
    .string()
    .min(2, "Query must be at least 2 characters")
    .max(1000, "Query cannot exceed 1000 characters"),
  threshold: z.number().min(0).max(1).optional(),
  limit: z.number().int().min(1).max(10).optional(),
  locale: z.enum(["en", "ar"]).optional().default("en"),
  sector: z
    .enum([
      "EDUCATION_SCHOOLS",
      "HIGHER_EDUCATION",
      "GOVERNMENT_PUBLIC",
      "COMMERCIAL_COMPANIES",
      "HEALTHCARE_MEDICAL",
    ])
    .optional(),
});

export type StatutoryQueryInput = z.infer<typeof StatutoryQuerySchema>;
