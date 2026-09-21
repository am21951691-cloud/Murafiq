import { z } from "zod";

export const EvaluationSchema = z.object({
  case_id: z.string().uuid("Valid case ID required"),
  response_rating: z
    .number()
    .int()
    .min(1, "Response rating must be at least 1")
    .max(5, "Response rating cannot exceed 5"),
  resolution_rating: z
    .number()
    .int()
    .min(1, "Resolution rating must be at least 1")
    .max(5, "Resolution rating cannot exceed 5"),
  closing_comment: z
    .string()
    .max(1000, "Closing comment cannot exceed 1000 characters")
    .optional()
    .nullable(),
});

export type EvaluationInput = z.infer<typeof EvaluationSchema>;

export interface ThreeDimensionalRatings {
  initialExperienceRating: number;
  responseRating: number;
  resolutionRating: number;
}
