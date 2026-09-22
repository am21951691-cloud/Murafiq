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
  favicon_url?: string | null;
  login_banner_url?: string | null;
  institution_short_name?: string | null;
  portal_title_ar?: string | null;
  portal_title_en?: string | null;
  org_description_ar?: string | null;
  org_description_en?: string | null;
  welcome_message_ar?: string | null;
  welcome_message_en?: string | null;
  support_email?: string | null;
  support_phone?: string | null;
  email_header_logo?: string | null;
  email_footer_text?: string | null;
  whatsapp_header_text?: string | null;
  pdf_crest_url?: string | null;
  pdf_footer_text?: string | null;
  footer_text_ar?: string | null;
  footer_text_en?: string | null;
  custom_domain?: string | null;
}

export type SubscriptionPlanTier = "STARTER" | "PROFESSIONAL" | "ENTERPRISE" | "CUSTOM";
export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "SUSPENDED" | "EXPIRED";

export interface TenantSubscription {
  plan: SubscriptionPlanTier;
  status: SubscriptionStatus;
  max_staff_seats: number;
  max_cases_monthly: number;
  max_storage_gb: number;
  ai_quota_monthly: number;
  ai_used_this_month: number;
  custom_domain_enabled: boolean;
  webhooks_enabled: boolean;
  sso_enabled: boolean;
  trial_ends_at?: string | null;
  renews_at?: string | null;
}

export type CustomFieldType = "TEXT" | "NUMBER" | "DATE" | "SELECT" | "BOOLEAN" | "FILE";

export interface CustomFieldDefinition {
  id: string;
  institution_id: string;
  field_key: string;
  label_ar: string;
  label_en: string;
  field_type: CustomFieldType;
  options?: string[];
  is_required: boolean;
  visibility: "BENEFICIARY" | "STAFF_ONLY";
  sector?: SectorType;
  placeholder_ar?: string;
  placeholder_en?: string;
}

export type WorkflowTrigger =
  | "CASE_CREATED"
  | "SLA_WARNING"
  | "SLA_BREACHED"
  | "STATUS_CHANGED"
  | "EVALUATION_SUBMITTED";

export interface WorkflowRule {
  id: string;
  institution_id: string;
  name: string;
  trigger: WorkflowTrigger;
  condition_category?: string;
  condition_priority?: CasePriority;
  condition_sla_hours_left?: number;
  action_assign_department_id?: string;
  action_assign_staff_id?: string;
  action_set_priority?: CasePriority;
  action_set_sla_hours?: number;
  action_notify_channels?: ("IN_APP" | "EMAIL" | "WHATSAPP" | "SMS")[];
  escalation_threshold_hours?: number;
  escalation_target_role?: InstitutionStaffRole;
  is_active: boolean;
  created_at: string;
}

export type WebhookEventType =
  | "case.created"
  | "case.assigned"
  | "case.updated"
  | "case.resolved"
  | "case.closed"
  | "evaluation.created"
  | "report.generated";

export interface WebhookSubscription {
  id: string;
  institution_id: string;
  url: string;
  secret: string;
  events: WebhookEventType[];
  is_active: boolean;
  created_at: string;
  last_delivery_at?: string;
  last_status_code?: number;
}

export interface WebhookDeliveryLog {
  id: string;
  subscription_id: string;
  event: WebhookEventType;
  payload: any;
  status_code: number;
  response_body?: string;
  delivered_at: string;
  retry_count: number;
}

export interface AuditLogEntry {
  id: string;
  institution_id: string;
  actor_id: string;
  actor_name: string;
  actor_role: string;
  action: string;
  entity_type:
    | "CASE"
    | "DEPARTMENT"
    | "STAFF"
    | "SLA"
    | "BRANDING"
    | "WORKFLOW"
    | "CUSTOM_FIELD"
    | "INTEGRATION"
    | "SECURITY"
    | "ORGANIZATION";
  entity_id: string;
  before_state?: any;
  after_state?: any;
  ip_address?: string;
  created_at: string;
}

export interface CaseTemplate {
  id: string;
  institution_id: string;
  sector: SectorType;
  title_ar: string;
  title_en: string;
  category: CaseCategory;
  default_priority: CasePriority;
  suggested_sla_hours: number;
  preset_description_ar?: string;
  preset_description_en?: string;
  recommended_department_code?: string;
}

export interface TenantBranch {
  id: string;
  institution_id: string;
  code: string;
  name_ar: string;
  name_en: string;
  is_active: boolean;
  created_at: string;
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
  status?: SubscriptionStatus;
  subscription?: TenantSubscription;
  branding?: TenantBranding;
  sla_config?: TenantSlaConfig;
  beneficiary_terminology?: TenantBeneficiaryTerminology;
  branches?: TenantBranch[];
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
