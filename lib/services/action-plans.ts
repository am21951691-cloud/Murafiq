import { z } from "zod";

export const ActionPlanSubmissionSchema = z.object({
  case_id: z.string().uuid("Valid case ID required"),
  official_statement: z
    .string()
    .min(20, "Official statement must be at least 20 characters")
    .max(3000, "Official statement cannot exceed 3000 characters"),
  milestones: z
    .array(
      z.object({
        title: z.string().min(3, "Milestone title must be at least 3 characters"),
        owner_role: z.string().min(2, "Owner role is required"),
        due_date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be in YYYY-MM-DD format"),
        deliverable: z.string().optional(),
      })
    )
    .min(1, "At least one milestone is required"),
  user_role: z
    .enum(["ADMIN", "OPS_LEAD", "STAFF", "OBSERVER"])
    .optional()
    .default("OPS_LEAD"),
});

export type ActionPlanSubmissionInput = z.infer<typeof ActionPlanSubmissionSchema>;
