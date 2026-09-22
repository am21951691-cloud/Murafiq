export type LifecycleStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "PRIVATE_GRACE"
  | "ACTION_PLAN_PENDING"
  | "IN_PROGRESS"
  | "AWAITING_EVALUATION"
  | "CLOSED"
  | "ARCHIVED";

export const LifecycleStatusEnum = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  PRIVATE_GRACE: "PRIVATE_GRACE",
  ACTION_PLAN_PENDING: "ACTION_PLAN_PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  AWAITING_EVALUATION: "AWAITING_EVALUATION",
  CLOSED: "CLOSED",
  ARCHIVED: "ARCHIVED",
} as const;

export type ModerationStatus =
  | "PENDING"
  | "APPROVED"
  | "REDACTED_APPROVED"
  | "HELD_FOR_REVIEW"
  | "REJECTED";

export const ModerationStatusEnum = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REDACTED_APPROVED: "REDACTED_APPROVED",
  HELD_FOR_REVIEW: "HELD_FOR_REVIEW",
  REJECTED: "REJECTED",
} as const;

export type DisputeStatus = "NONE" | "OPEN" | "RESOLVED" | "ESCALATED";

export const DisputeStatusEnum = {
  NONE: "NONE",
  OPEN: "OPEN",
  RESOLVED: "RESOLVED",
  ESCALATED: "ESCALATED",
} as const;

export type SafetyStatus = "CLEAR" | "FLAGGED" | "ESCALATED";

export const SafetyStatusEnum = {
  CLEAR: "CLEAR",
  FLAGGED: "FLAGGED",
  ESCALATED: "ESCALATED",
} as const;

export type SectorType =
  | "EDUCATION_SCHOOLS"
  | "HIGHER_EDUCATION"
  | "GOVERNMENT_PUBLIC"
  | "COMMERCIAL_COMPANIES"
  | "HEALTHCARE_MEDICAL";

export const SectorEnum = {
  EDUCATION_SCHOOLS: "EDUCATION_SCHOOLS",
  HIGHER_EDUCATION: "HIGHER_EDUCATION",
  GOVERNMENT_PUBLIC: "GOVERNMENT_PUBLIC",
  COMMERCIAL_COMPANIES: "COMMERCIAL_COMPANIES",
  HEALTHCARE_MEDICAL: "HEALTHCARE_MEDICAL",
} as const;

export type CaseCategory =
  | "ACADEMIC_CURRICULUM"
  | "TEACHER_COMMUNICATION"
  | "STUDENT_BEHAVIOR_BULLYING"
  | "FACILITIES_HEALTH_SAFETY"
  | "TRANSPORTATION_BUSES"
  | "TUITION_FEES_REFUNDS"
  | "ADMINISTRATION_DISCIPLINE"
  | (string & {});

export const CaseCategoryEnum = {
  ACADEMIC_CURRICULUM: "ACADEMIC_CURRICULUM",
  TEACHER_COMMUNICATION: "TEACHER_COMMUNICATION",
  STUDENT_BEHAVIOR_BULLYING: "STUDENT_BEHAVIOR_BULLYING",
  FACILITIES_HEALTH_SAFETY: "FACILITIES_HEALTH_SAFETY",
  TRANSPORTATION_BUSES: "TRANSPORTATION_BUSES",
  TUITION_FEES_REFUNDS: "TUITION_FEES_REFUNDS",
  ADMINISTRATION_DISCIPLINE: "ADMINISTRATION_DISCIPLINE",
} as const;

export type VisibilityLevel = "STRICTLY_PRIVATE" | "ANONYMOUS_PUBLIC" | "PUBLIC";

export const VisibilityLevelEnum = {
  STRICTLY_PRIVATE: "STRICTLY_PRIVATE",
  ANONYMOUS_PUBLIC: "ANONYMOUS_PUBLIC",
  PUBLIC: "PUBLIC",
} as const;

export type VerificationMethod =
  | "PLATFORM_EVENT"
  | "USER_CONFIRMATION"
  | "INSTITUTION_DOCUMENT"
  | "UPLOADED_DOCUMENT"
  | "ADMIN_AUDIT"
  | "EXTERNAL_REGISTRY";

export const VerificationMethodEnum = {
  PLATFORM_EVENT: "PLATFORM_EVENT",
  USER_CONFIRMATION: "USER_CONFIRMATION",
  INSTITUTION_DOCUMENT: "INSTITUTION_DOCUMENT",
  UPLOADED_DOCUMENT: "UPLOADED_DOCUMENT",
  ADMIN_AUDIT: "ADMIN_AUDIT",
  EXTERNAL_REGISTRY: "EXTERNAL_REGISTRY",
} as const;

export type CasePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export const CasePriorityEnum = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;

export type InstitutionStaffRole = "ADMIN" | "OPS_LEAD" | "STAFF" | "OBSERVER";

export const InstitutionStaffRoleEnum = {
  ADMIN: "ADMIN",
  OPS_LEAD: "OPS_LEAD",
  STAFF: "STAFF",
  OBSERVER: "OBSERVER",
} as const;

export interface InstitutionStaffMember {
  id: string;
  institution_id: string;
  user_id?: string;
  name: string;
  email: string;
  phone?: string | null;
  role: InstitutionStaffRole;
  department_id?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface TenantBranding {
  primary_color: string;
  secondary_color?: string;
  logo_url?: string | null;
  institution_short_name?: string | null;
  welcome_message_ar?: string | null;
  welcome_message_en?: string | null;
  support_email?: string | null;
  support_phone?: string | null;
  custom_domain?: string | null;
}

export interface TenantSlaConfig {
  first_response_hours: number;
  action_plan_hours: number;
  resolution_hours: number;
  escalation_threshold_hours?: number;
  critical_resolution_hours?: number;
  high_resolution_hours?: number;
  medium_resolution_hours?: number;
  low_resolution_hours?: number;
  business_hours_start?: string;
  business_hours_end?: string;
  working_days?: number[];
}

export interface TenantBeneficiaryTerminology {
  term_ar: string;
  term_en: string;
  identifier_label_ar: string;
  identifier_label_en: string;
}

export interface InstitutionDepartment {
  id: string;
  institution_id: string;
  code: string;
  name_ar: string;
  name_en: string;
  default_sla_hours: number;
  head_user_id?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CaseInternalNote {
  id: string;
  case_id: string;
  institution_id: string;
  author_id: string;
  author_name: string;
  author_role: string;
  note_text: string;
  created_at: string;
}

export interface Institution {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  sector?: SectorType;
  sector_metadata?: Record<string, unknown>;
  registration_number?: string | null;
  identifier_type: string;
  verification_metadata: Record<string, unknown>;
  is_verified: boolean;
  branding?: TenantBranding;
  sla_config?: TenantSlaConfig;
  beneficiary_terminology?: TenantBeneficiaryTerminology;
  created_at: string;
  updated_at: string;
}

export type Entity = Institution;

export interface Case {
  id: string;
  reference_number: string;
  user_id: string;
  institution_id: string;
  branch_id?: string | null;
  assigned_department_id?: string | null;
  assigned_staff_id?: string | null;
  category: CaseCategory;
  subcategory: string;
  priority?: CasePriority;
  lifecycle_status: LifecycleStatus;
  moderation_status: ModerationStatus;
  dispute_status: DisputeStatus;
  safety_status: SafetyStatus;
  visibility: VisibilityLevel;
  sanitized_description: string;
  public_summary_ar?: string | null;
  public_summary_en?: string | null;
  initial_experience_rating: number;
  grace_expires_at?: string | null;
  sla_target_at?: string | null;
  first_responded_at?: string | null;
  resolved_at?: string | null;
  evaluation_timeout_at?: string | null;
  closed_at?: string | null;
  closure_reason?: string | null;
  sector_taxonomy_version?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CaseSensitiveData {
  case_id: string;
  raw_description_encrypted: string;
  parent_contact_phone_encrypted?: string | null;
  student_identifiers_encrypted?: Record<string, unknown> | null;
  sensitive_identifiers_encrypted?: Record<string, unknown> | null;
  created_at: string;
}

export interface ActionPlan {
  id: string;
  case_id: string;
  submitted_by: string;
  official_statement: string;
  rqs_score: number;
  rqs_breakdown: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ActionItem {
  id: string;
  action_plan_id: string;
  title: string;
  owner_role: string;
  due_date: string;
  is_completed: boolean;
  completed_at?: string | null;
  created_at: string;
}

export interface Evaluation {
  id: string;
  case_id: string;
  response_rating: number;
  resolution_rating: number;
  closing_comment?: string | null;
  created_at: string;
}

export interface CaseEvent {
  id: string;
  case_id: string;
  actor_id?: string | null;
  event_type: string;
  from_state?: Record<string, unknown> | null;
  to_state?: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  created_at: string;
}
