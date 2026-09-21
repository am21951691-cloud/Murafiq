import { z } from "zod";
import crypto from "crypto";
import { type ActionItem, VerificationMethodEnum } from "@/types/database";

export const CompleteMilestoneSchema = z.object({
  case_id: z.string().uuid("Valid case ID required"),
  milestone_id: z.string().uuid("Valid milestone ID required"),
  evidence_summary: z.string().min(5, "Evidence summary is required"),
  storage_reference_id: z.string().optional(),
  verification_method: z
    .enum([
      VerificationMethodEnum.PLATFORM_EVENT,
      VerificationMethodEnum.USER_CONFIRMATION,
      VerificationMethodEnum.INSTITUTION_DOCUMENT,
      VerificationMethodEnum.UPLOADED_DOCUMENT,
      VerificationMethodEnum.ADMIN_AUDIT,
      VerificationMethodEnum.EXTERNAL_REGISTRY,
    ])
    .default(VerificationMethodEnum.INSTITUTION_DOCUMENT),
});

export type CompleteMilestoneInput = z.infer<typeof CompleteMilestoneSchema>;

export function checkAllMilestonesCompleted(
  milestones: Array<{ id: string; is_completed: boolean }>
): boolean {
  if (!milestones || milestones.length === 0) return false;
  return milestones.every((m) => m.is_completed === true);
}

export function createMilestoneVerificationRecord(
  input: CompleteMilestoneInput,
  userId: string
) {
  return {
    id: crypto.randomUUID(),
    case_id: input.case_id,
    target_entity_type: "ACTION_ITEM",
    target_entity_id: input.milestone_id,
    verification_method: input.verification_method,
    verified_by_user_id: userId,
    verification_scope: "MILESTONE_EXECUTION_COMPLETION",
    evidence_summary: input.evidence_summary,
    storage_reference_id: input.storage_reference_id || null,
    limitations: null,
    created_at: new Date().toISOString(),
  };
}
