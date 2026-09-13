import { z } from "zod";
import crypto from "crypto";
import {
  CaseCategoryEnum,
  VisibilityLevelEnum,
  type Case,
  type CaseSensitiveData,
  type CaseEvent,
} from "@/types/database";
import { sanitizeRawInput, encryptSensitiveData } from "@/lib/ai/sanitizer";
import { formatEgyptianPhone } from "@/lib/utils";

export const CaseIntakeSchema = z.object({
  institution_id: z.string().min(1, "Institution is required"),
  branch_id: z.string().optional().nullable(),
  category: z.enum([
    CaseCategoryEnum.ACADEMIC_CURRICULUM,
    CaseCategoryEnum.TEACHER_COMMUNICATION,
    CaseCategoryEnum.STUDENT_BEHAVIOR_BULLYING,
    CaseCategoryEnum.FACILITIES_HEALTH_SAFETY,
    CaseCategoryEnum.TRANSPORTATION_BUSES,
    CaseCategoryEnum.TUITION_FEES_REFUNDS,
    CaseCategoryEnum.ADMINISTRATION_DISCIPLINE,
  ]),
  subcategory: z.string().min(2, "Subcategory is required"),
  raw_description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(2000, "Description cannot exceed 2000 characters"),
  initial_experience_rating: z.number().int().min(1).max(5),
  desired_outcome: z
    .string()
    .min(5, "Desired outcome must be at least 5 characters")
    .max(500, "Desired outcome cannot exceed 500 characters")
    .optional(),
  visibility: z
    .enum([
      VisibilityLevelEnum.STRICTLY_PRIVATE,
      VisibilityLevelEnum.ANONYMOUS_PUBLIC,
      VisibilityLevelEnum.PUBLIC,
    ])
    .default(VisibilityLevelEnum.STRICTLY_PRIVATE),
  parent_phone: z.string().min(10, "Valid Egyptian phone required"),
  student_identifiers: z.record(z.unknown()).optional().nullable(),
  consent_given: z.literal(true, {
    errorMap: () => ({ message: "Consent is required" }),
  }),
});

export type CaseIntakeInput = z.input<typeof CaseIntakeSchema>;

export interface ProcessedCaseIntake {
  caseRecord: Omit<Case, "created_at" | "updated_at">;
  sensitiveData: CaseSensitiveData;
  consentRecord: {
    id: string;
    user_id: string;
    case_id: string;
    consent_type: string;
    policy_version: string;
    ip_address_hash: string;
  };
  eventRecord: Omit<CaseEvent, "created_at">;
}

export function processCaseIntake(
  input: CaseIntakeInput,
  userId: string,
  ipAddress: string = "127.0.0.1"
): ProcessedCaseIntake {
  const validated = CaseIntakeSchema.parse(input);
  const formattedPhone = formatEgyptianPhone(validated.parent_phone);

  const caseId = crypto.randomUUID();
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const referenceNumber = `MRF-${year}-${randomSuffix}`;

  // Layer 1 PII Sanitization
  const { cleanedText: sanitizedDesc } = sanitizeRawInput(validated.raw_description);
  const { cleanedText: sanitizedOutcome } = sanitizeRawInput(validated.desired_outcome || "");

  // Private Grace Window: Exactly 7 days
  const now = new Date();
  const graceExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // One-way phone hash for abuse/fraud detection without storing plaintext phone in operational table
  const phoneHash = crypto.createHash("sha256").update(formattedPhone).digest("hex");

  const caseRecord: Omit<Case, "created_at" | "updated_at"> = {
    id: caseId,
    reference_number: referenceNumber,
    user_id: userId,
    institution_id: validated.institution_id,
    branch_id: validated.branch_id || null,
    category: validated.category,
    subcategory: validated.subcategory,
    lifecycle_status: "PRIVATE_GRACE",
    moderation_status: "PENDING",
    dispute_status: "NONE",
    safety_status: "CLEAR",
    visibility: validated.visibility,
    sanitized_description: sanitizedDesc,
    initial_experience_rating: validated.initial_experience_rating,
    grace_expires_at: graceExpiresAt,
    metadata: {
      desired_outcome: sanitizedOutcome,
      phone_hash: phoneHash,
    },
  };

  const sensitiveData: CaseSensitiveData = {
    case_id: caseId,
    raw_description_encrypted: encryptSensitiveData(validated.raw_description),
    parent_contact_phone_encrypted: encryptSensitiveData(formattedPhone),
    student_identifiers_encrypted: validated.student_identifiers
      ? validated.student_identifiers
      : null,
    created_at: now.toISOString(),
  };

  const ipHash = crypto.createHash("sha256").update(ipAddress).digest("hex");

  const consentRecord = {
    id: crypto.randomUUID(),
    user_id: userId,
    case_id: caseId,
    consent_type: "LAW_151_2020_EDUCATION_INTAKE",
    policy_version: "2026.1",
    ip_address_hash: ipHash,
  };

  const eventRecord: Omit<CaseEvent, "created_at"> = {
    id: crypto.randomUUID(),
    case_id: caseId,
    actor_id: userId,
    event_type: "CASE_SUBMITTED",
    from_state: { lifecycle_status: "DRAFT" },
    to_state: { lifecycle_status: "PRIVATE_GRACE" },
    metadata: {
      reference_number: referenceNumber,
      visibility: validated.visibility,
      grace_expires_at: graceExpiresAt,
    },
  };

  return {
    caseRecord,
    sensitiveData,
    consentRecord,
    eventRecord,
  };
}

export interface AcknowledgeCaseInput {
  caseId: string;
  userId: string;
  userRole: "ADMIN" | "OPS_LEAD" | "STAFF" | "OBSERVER" | string;
  caseInstitutionId: string;
  memberInstitutionId: string;
  caseStatus: string;
  graceExpiresAt: string | null;
  internalNotes?: string;
}

export interface AcknowledgeCaseResult {
  authorized: boolean;
  errorCode?: "UNAUTHORIZED_INSTITUTION" | "INSUFFICIENT_ROLE" | "INVALID_LIFECYCLE_STATE" | "GRACE_EXPIRED";
  errorMessage?: string;
  eventRecord?: Omit<CaseEvent, "created_at">;
  newStatus?: string;
}

export function verifyAndAcknowledgeCase(input: AcknowledgeCaseInput): AcknowledgeCaseResult {
  // 1. Institution Isolation
  if (input.caseInstitutionId !== input.memberInstitutionId) {
    return {
      authorized: false,
      errorCode: "UNAUTHORIZED_INSTITUTION",
      errorMessage: "Access denied: Case does not belong to your institution.",
    };
  }

  // 2. Granular Role Enforcement (Only ADMIN or OPS_LEAD)
  if (input.userRole !== "ADMIN" && input.userRole !== "OPS_LEAD") {
    return {
      authorized: false,
      errorCode: "INSUFFICIENT_ROLE",
      errorMessage: "Access denied: Only ADMIN or OPS_LEAD roles can acknowledge cases.",
    };
  }

  // 3. Lifecycle State Check
  if (input.caseStatus !== "PRIVATE_GRACE") {
    return {
      authorized: false,
      errorCode: "INVALID_LIFECYCLE_STATE",
      errorMessage: `Cannot acknowledge case in status ${input.caseStatus}; must be in PRIVATE_GRACE.`,
    };
  }

  // 4. Grace Window Expiry Check
  if (input.graceExpiresAt && new Date(input.graceExpiresAt).getTime() < Date.now()) {
    return {
      authorized: false,
      errorCode: "GRACE_EXPIRED",
      errorMessage: "Private grace period has expired for this case.",
    };
  }

  const eventRecord: Omit<CaseEvent, "created_at"> = {
    id: crypto.randomUUID(),
    case_id: input.caseId,
    actor_id: input.userId,
    event_type: "CASE_ACKNOWLEDGED",
    from_state: { lifecycle_status: "PRIVATE_GRACE" },
    to_state: { lifecycle_status: "ACTION_PLAN_PENDING" },
    metadata: {
      acknowledged_by_role: input.userRole,
      acknowledged_at: new Date().toISOString(),
      internal_notes: input.internalNotes || null,
    },
  };

  return {
    authorized: true,
    newStatus: "ACTION_PLAN_PENDING",
    eventRecord,
  };
}
