import fs from "fs";
import path from "path";
import crypto from "crypto";
import type {
  Case,
  SectorType,
  LifecycleStatus,
  CasePriority,
  TenantBranding,
  TenantSlaConfig,
  InstitutionStaffMember,
  Institution,
  TenantSubscription,
  CustomFieldDefinition,
  WorkflowRule,
  WebhookSubscription,
  WebhookDeliveryLog,
  AuditLogEntry,
  CaseTemplate,
  TenantBranch,
} from "@/types/database";
import { getSectorConfig } from "@/lib/config/sectors";
import { createClient } from "@/lib/supabase/server";

export interface StoredCaseItem extends Case {
  institution_name?: string;
  sector: SectorType;
  remaining_days?: number;
  remaining_hours?: number;
  is_urgent?: boolean;
}

export interface StoredMilestone {
  id: string;
  action_plan_id: string;
  title: string;
  owner_role: string;
  due_date: string;
  deliverable?: string;
  is_completed: boolean;
  completed_at: string | null;
  completed_by?: string | null;
  created_at: string;
}

export interface StoredActionPlan {
  id: string;
  case_id: string;
  submitted_by: string;
  official_statement: string;
  rqs_score: number;
  rqs_breakdown: any;
  created_at: string;
  updated_at: string;
  milestones: StoredMilestone[];
}

export interface StoredEvaluation {
  id: string;
  case_id: string;
  user_id: string;
  responsiveness_rating: number;
  resolution_satisfaction_rating: number;
  feedback_notes?: string | null;
  created_at: string;
}

export interface StoredEvent {
  id: string;
  case_id: string;
  event_type: string;
  actor_id: string;
  actor_role: string;
  payload: any;
  created_at: string;
}

export interface StoredDepartment {
  id: string;
  institution_id: string;
  code: string;
  name_ar: string;
  name_en: string;
  default_sla_hours: number;
  head_user_id?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface StoredInternalNote {
  id: string;
  case_id: string;
  institution_id: string;
  author_id: string;
  author_name: string;
  author_role: string;
  note_text: string;
  created_at: string;
}

interface StorageSchema {
  cases: StoredCaseItem[];
  actionPlans: StoredActionPlan[];
  evaluations: StoredEvaluation[];
  events: StoredEvent[];
  departments: StoredDepartment[];
  internalNotes: StoredInternalNote[];
  tenantBranding?: Record<string, TenantBranding>;
  tenantSlaConfigs?: Record<string, TenantSlaConfig>;
  staffMembers?: InstitutionStaffMember[];
  institutions?: Institution[];
  customFields?: Record<string, CustomFieldDefinition[]>;
  workflowRules?: Record<string, WorkflowRule[]>;
  webhooks?: Record<string, WebhookSubscription[]>;
  webhookLogs?: WebhookDeliveryLog[];
  auditLogs?: AuditLogEntry[];
  caseTemplates?: Record<string, CaseTemplate[]>;
  branches?: Record<string, TenantBranch[]>;
}

const STORE_PATH = path.join(process.cwd(), "data", "cases-store.json");

export const SEED_INSTITUTIONS: Institution[] = [
  {
    id: "00000000-0000-0000-0000-000000000010",
    slug: "cairo-experimental-school",
    name_ar: "مدرسة القاهرة التجريبية الرسمية للغات",
    name_en: "Cairo Experimental Language School",
    sector: "EDUCATION_SCHOOLS",
    identifier_type: "STUDENT_ID",
    verification_metadata: { registered: true },
    is_verified: true,
    status: "ACTIVE",
    subscription: {
      plan: "ENTERPRISE",
      status: "ACTIVE",
      max_staff_seats: 50,
      max_cases_monthly: 1000,
      max_storage_gb: 100,
      ai_quota_monthly: 5000,
      ai_used_this_month: 420,
      custom_domain_enabled: true,
      webhooks_enabled: true,
      sso_enabled: true,
      renews_at: new Date(Date.now() + 300 * 86400000).toISOString(),
    },
    branding: {
      primary_color: "#0F766E",
      secondary_color: "#1E293B",
      institution_short_name: "مدرسة القاهرة التجريبية",
      portal_title_ar: "بوابة خدمة أولياء الأمور وإدارة الحالات",
      portal_title_en: "Parent Services & Case Management Portal",
      org_description_ar: "البوابة الرسمية المعتمدة لتلقي ومعالجة طلبات ومقترحات وشكاوى أولياء الأمور والطلاب بمؤشرات أداء موثوقة.",
      welcome_message_ar: "أهلاً بكم في البوابة المؤسسية لمدرسة القاهرة التجريبية لإدارة وحسم الحالات",
      welcome_message_en: "Welcome to Cairo Experimental Language School Resolution Portal",
      support_email: "support@cairo-school.edu.eg",
      support_phone: "+20227914000",
      custom_domain: "cases.cairo-school.edu.eg",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "uni-cairo-001",
    slug: "cairo-university",
    name_ar: "جامعة القاهرة (Cairo University)",
    name_en: "Cairo University",
    sector: "HIGHER_EDUCATION",
    identifier_type: "STUDENT_ID",
    verification_metadata: { registered: true },
    is_verified: true,
    status: "ACTIVE",
    subscription: {
      plan: "ENTERPRISE",
      status: "ACTIVE",
      max_staff_seats: 250,
      max_cases_monthly: 10000,
      max_storage_gb: 500,
      ai_quota_monthly: 25000,
      ai_used_this_month: 3120,
      custom_domain_enabled: true,
      webhooks_enabled: true,
      sso_enabled: true,
      renews_at: new Date(Date.now() + 320 * 86400000).toISOString(),
    },
    branding: {
      primary_color: "#1E3A8A",
      secondary_color: "#D97706",
      institution_short_name: "جامعة القاهرة",
      portal_title_ar: "بوابة شؤون الطلاب والالتماسات الأكاديمية",
      portal_title_en: "Student Affairs & Academic Petitions Portal",
      org_description_ar: "المنظومة الرقمية الموحدة لخدمة طلاب جامعة القاهرة لتسجيل ومتابعة الالتماسات الأكاديمية والمقترحات والشكاوى.",
      welcome_message_ar: "مرحباً بكم في بوابة جامعة القاهرة الموحدة لتسوية الحالات والالتماسات",
      welcome_message_en: "Welcome to Cairo University Academic Resolution Portal",
      support_email: "helpdesk@cu.edu.eg",
      support_phone: "+20235676100",
      custom_domain: "resolution.cu.edu.eg",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "gov-post-001",
    slug: "egypt-post",
    name_ar: "الهيئة القومية للبريد المصري",
    name_en: "Egypt Post Authority",
    sector: "GOVERNMENT_PUBLIC",
    identifier_type: "NATIONAL_ID",
    verification_metadata: { registered: true },
    is_verified: true,
    status: "ACTIVE",
    subscription: {
      plan: "ENTERPRISE",
      status: "ACTIVE",
      max_staff_seats: 500,
      max_cases_monthly: 50000,
      max_storage_gb: 1000,
      ai_quota_monthly: 50000,
      ai_used_this_month: 8400,
      custom_domain_enabled: true,
      webhooks_enabled: true,
      sso_enabled: true,
      renews_at: new Date(Date.now() + 180 * 86400000).toISOString(),
    },
    branding: {
      primary_color: "#047857",
      secondary_color: "#B45309",
      institution_short_name: "البريد المصري",
      portal_title_ar: "منظومة خدمة العملاء وحسم المعاملات البريدية",
      portal_title_en: "Customer Care & Postal Transactions Resolution",
      org_description_ar: "بوابة الشكاوى والمعاملات البريدية والمالية الرسمية للهيئة القومية للبريد.",
      welcome_message_ar: "أهلاً بك في بوابة خدمة عملاء البريد المصري الرسمية",
      welcome_message_en: "Welcome to Egypt Post Official Customer Resolution Portal",
      support_email: "care@egyptpost.org",
      support_phone: "16789",
      custom_domain: "care.egyptpost.org",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "com-vodafone-001",
    slug: "vodafone-egypt",
    name_ar: "شركة فودافون مصر للاتصالات",
    name_en: "Vodafone Egypt Telecom",
    sector: "COMMERCIAL_COMPANIES",
    identifier_type: "PHONE_NUMBER",
    verification_metadata: { registered: true },
    is_verified: true,
    status: "ACTIVE",
    subscription: {
      plan: "ENTERPRISE",
      status: "ACTIVE",
      max_staff_seats: 1000,
      max_cases_monthly: 100000,
      max_storage_gb: 2000,
      ai_quota_monthly: 100000,
      ai_used_this_month: 14200,
      custom_domain_enabled: true,
      webhooks_enabled: true,
      sso_enabled: true,
      renews_at: new Date(Date.now() + 240 * 86400000).toISOString(),
    },
    branding: {
      primary_color: "#E11D48",
      secondary_color: "#0F172A",
      institution_short_name: "فودافون مصر",
      portal_title_ar: "بوابة حل مشكلات واشتراكات العملاء",
      portal_title_en: "Subscriber Care & Dispute Resolution Portal",
      org_description_ar: "المنصة الرسمية لإدارة ومتابعة طلبات الدعم المتقدم والشكاوى لعملاء شبكة فودافون مصر.",
      welcome_message_ar: "أهلاً بكم في بوابة فودافون مصر لحل مشكلات المشتركين",
      welcome_message_en: "Welcome to Vodafone Egypt Resolution Portal",
      support_email: "enterprise.care@vodafone.com.eg",
      support_phone: "888",
      custom_domain: "care.vodafone.com.eg",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "med-qasr-001",
    slug: "qasr-el-eini-hospitals",
    name_ar: "مستشفيات جامعة القاهرة - قصر العيني",
    name_en: "Qasr El-Eini University Hospitals",
    sector: "HEALTHCARE_MEDICAL",
    identifier_type: "MEDICAL_RECORD",
    verification_metadata: { registered: true },
    is_verified: true,
    status: "ACTIVE",
    subscription: {
      plan: "ENTERPRISE",
      status: "ACTIVE",
      max_staff_seats: 300,
      max_cases_monthly: 20000,
      max_storage_gb: 500,
      ai_quota_monthly: 20000,
      ai_used_this_month: 1950,
      custom_domain_enabled: true,
      webhooks_enabled: true,
      sso_enabled: true,
      renews_at: new Date(Date.now() + 365 * 86400000).toISOString(),
    },
    branding: {
      primary_color: "#0284C7",
      secondary_color: "#0D9488",
      institution_short_name: "مستشفيات قصر العيني",
      portal_title_ar: "بوابة علاقات المرضى والرعاية الصحية",
      portal_title_en: "Patient Relations & Quality Care Portal",
      org_description_ar: "البوابة الرسمية المعتمدة لتقديم ومتابعة ملاحظات المرضى والمراجعين وفق معايير الجودة والاعتماد الصحية.",
      welcome_message_ar: "أهلاً بكم في بوابة رعاية وعلاقات المرضى لمستشفيات قصر العيني",
      welcome_message_en: "Welcome to Qasr El-Eini Patient Care Portal",
      support_email: "patientcare@kasralainy.edu.eg",
      support_phone: "+20223654000",
      custom_domain: "patients.kasralainy.edu.eg",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Multi-sector seed cases for Egypt's 5 core national sectors
const SEED_CASES: StoredCaseItem[] = [
  // 1. Pre-University Schools
  {
    id: "11111111-1111-1111-1111-111111111111",
    reference_number: "MRF-2026-48219",
    user_id: "00000000-0000-0000-0000-000000000001",
    institution_id: "00000000-0000-0000-0000-000000000010",
    institution_name: "مدرسة القاهرة التجريبية الرسمية للغات",
    sector: "EDUCATION_SCHOOLS",
    category: "TEACHER_COMMUNICATION",
    subcategory: "التواصل الأسبوعي مع أولياء الأمور",
    lifecycle_status: "PRIVATE_GRACE",
    moderation_status: "APPROVED",
    dispute_status: "NONE",
    safety_status: "CLEAR",
    visibility: "STRICTLY_PRIVATE",
    sanitized_description: "تأخر غير مبرر في الرد على استفسارات درجات منتصف العام الدراسي لأكثر من أسبوعين.",
    initial_experience_rating: 2,
    grace_expires_at: new Date(Date.now() + 5 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    metadata: { display_token: "STU-***412" },
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    reference_number: "MRF-2026-89143",
    user_id: "00000000-0000-0000-0000-000000000001",
    institution_id: "00000000-0000-0000-0000-000000000010",
    institution_name: "مدرسة القاهرة التجريبية الرسمية للغات",
    sector: "EDUCATION_SCHOOLS",
    category: "TRANSPORTATION_BUSES",
    subcategory: "مواعيد حافلات التوصيل",
    lifecycle_status: "PRIVATE_GRACE",
    moderation_status: "APPROVED",
    dispute_status: "NONE",
    safety_status: "CLEAR",
    visibility: "STRICTLY_PRIVATE",
    sanitized_description: "تكرار تأخر حافلة خط التجمع الأول لمدة تتجاوز 40 دقيقة يومياً مما يعطل الطلاب.",
    initial_experience_rating: 1,
    grace_expires_at: new Date(Date.now() + 1.5 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 5.5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5.5 * 86400000).toISOString(),
    metadata: { display_token: "BUS-***892" },
  },

  // 2. Higher Education & Universities
  {
    id: "33333333-3333-3333-3333-333333333333",
    reference_number: "MRF-2026-31045",
    user_id: "00000000-0000-0000-0000-000000000001",
    institution_id: "uni-cairo-001",
    institution_name: "جامعة القاهرة (Cairo University)",
    sector: "HIGHER_EDUCATION",
    category: "ACADEMIC_CURRICULUM",
    subcategory: "معادلة الساعات المعتمدة والتسجيل الأكاديمي",
    lifecycle_status: "PRIVATE_GRACE",
    moderation_status: "APPROVED",
    dispute_status: "NONE",
    safety_status: "CLEAR",
    visibility: "STRICTLY_PRIVATE",
    sanitized_description: "تعطل تسجيل المقررات للفصل الدراسي الثاني بسبب تأخر قسم شؤون الطلاب في إدراج مقرر المتطلب السابق المعادل بلائحة الساعات المعتمدة لكلية الهندسة وفق قانون 49 لسنة 1972.",
    initial_experience_rating: 2,
    grace_expires_at: new Date(Date.now() + 4 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    metadata: { display_token: "ENG-***812" },
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    reference_number: "MRF-2026-62184",
    user_id: "00000000-0000-0000-0000-000000000001",
    institution_id: "uni-cairo-001",
    institution_name: "جامعة القاهرة (Cairo University)",
    sector: "HIGHER_EDUCATION",
    category: "ADMINISTRATION_DISCIPLINE",
    subcategory: "استخراج الشهادات والوثائق الأكاديمية الرسمية",
    lifecycle_status: "PRIVATE_GRACE",
    moderation_status: "APPROVED",
    dispute_status: "NONE",
    safety_status: "CLEAR",
    visibility: "STRICTLY_PRIVATE",
    sanitized_description: "تأخر تسليم بيان الدرجات المعتمد باللغة الإنجليزية والموجه للبعثات والمنح الخارجية لأكثر من 18 يوم عمل دون إبداء سبب إداري واضح.",
    initial_experience_rating: 2,
    grace_expires_at: new Date(Date.now() + 1.8 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 5.2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5.2 * 86400000).toISOString(),
    metadata: { display_token: "REQ-***504" },
  },

  // 3. Government & Public Services
  {
    id: "55555555-5555-5555-5555-555555555555",
    reference_number: "MRF-2026-77312",
    user_id: "00000000-0000-0000-0000-000000000001",
    institution_id: "gov-post-001",
    institution_name: "الهيئة القومية للبريد - مكتب بريد العتبة الرئيسي",
    sector: "GOVERNMENT_PUBLIC",
    category: "FACILITIES_HEALTH_SAFETY",
    subcategory: "التزام مواعيد تسليم الخطابات والشحنات المسجلة (SLA)",
    lifecycle_status: "PRIVATE_GRACE",
    moderation_status: "APPROVED",
    dispute_status: "NONE",
    safety_status: "CLEAR",
    visibility: "STRICTLY_PRIVATE",
    sanitized_description: "تأخر تسليم طرد حكومي مسجل بعلم الوصول صادر من مكتب بريد الأهرام وموجه لمنطقة مدينة نصر لمدة 9 أيام دون تحديث رمز التتبع في البوابة الإلكترونية.",
    initial_experience_rating: 2,
    grace_expires_at: new Date(Date.now() + 3 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    metadata: { display_token: "POST-***214" },
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
    reference_number: "MRF-2026-90421",
    user_id: "00000000-0000-0000-0000-000000000001",
    institution_id: "gov-post-001",
    institution_name: "الهيئة القومية للبريد - مكتب بريد العتبة الرئيسي",
    sector: "GOVERNMENT_PUBLIC",
    category: "ADMINISTRATION_DISCIPLINE",
    subcategory: "إجراءات إيداع وصرف المعاشات البريدية",
    lifecycle_status: "PRIVATE_GRACE",
    moderation_status: "APPROVED",
    dispute_status: "NONE",
    safety_status: "CLEAR",
    visibility: "STRICTLY_PRIVATE",
    sanitized_description: "تعطل ماكينة الصرف الرئيسية وتكدس المواطنين وكبار السن بالمكتب دون توفير شباك طوارئ بديل لتسيير المعاملات في المواعيد الرسمية.",
    initial_experience_rating: 1,
    grace_expires_at: new Date(Date.now() + 1.1 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 5.9 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5.9 * 86400000).toISOString(),
    metadata: { display_token: "TKT-***991" },
  },

  // 4. Commercial Companies & Telecom
  {
    id: "77777777-7777-7777-7777-777777777777",
    reference_number: "MRF-2026-14892",
    user_id: "00000000-0000-0000-0000-000000000001",
    institution_id: "com-vodafone-001",
    institution_name: "شركة فودافون مصر للاتصالات (Vodafone Egypt)",
    sector: "COMMERCIAL_COMPANIES",
    category: "FACILITIES_HEALTH_SAFETY",
    subcategory: "جودة خدمة الإنترنت المنزلي VDSL والفايبر",
    lifecycle_status: "PRIVATE_GRACE",
    moderation_status: "APPROVED",
    dispute_status: "NONE",
    safety_status: "CLEAR",
    visibility: "STRICTLY_PRIVATE",
    sanitized_description: "انقطاع متكرر لخدمة الإنترنت المنزلي فايبر لأكثر من 5 أيام بمنطقة المعادي مع عدم التزام فريق الصيانة بالحضور في الموعد المحدد المسبق.",
    initial_experience_rating: 1,
    grace_expires_at: new Date(Date.now() + 1.4 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 5.6 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5.6 * 86400000).toISOString(),
    metadata: { display_token: "DSL-***771" },
  },
  {
    id: "88888888-8888-8888-8888-888888888888",
    reference_number: "MRF-2026-58201",
    user_id: "00000000-0000-0000-0000-000000000001",
    institution_id: "com-vodafone-001",
    institution_name: "شركة فودافون مصر للاتصالات (Vodafone Egypt)",
    sector: "COMMERCIAL_COMPANIES",
    category: "TUITION_FEES_REFUNDS",
    subcategory: "حقوق الاسترجاع واسترداد مبالغ التأمين التعاقدية",
    lifecycle_status: "PRIVATE_GRACE",
    moderation_status: "APPROVED",
    dispute_status: "NONE",
    safety_status: "CLEAR",
    visibility: "STRICTLY_PRIVATE",
    sanitized_description: "تأخر استرداد مبلغ تأمين جهاز الراوتر بعد تسليم الجهاز رسمياً وإتمام المخالصة التعاقدية بالمخالفة لمهلة الـ 14 يوماً بقانون حماية المستهلك رقم 181 لسنة 2018.",
    initial_experience_rating: 2,
    grace_expires_at: new Date(Date.now() + 5 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    metadata: { display_token: "INV-***819" },
  },

  // 5. Healthcare & Medical Facilities
  {
    id: "99999999-9999-9999-9999-999999999999",
    reference_number: "MRF-2026-95104",
    user_id: "00000000-0000-0000-0000-000000000001",
    institution_id: "med-salam-001",
    institution_name: "مستشفى السلام الدولي بالمعادي",
    sector: "HEALTHCARE_MEDICAL",
    category: "FACILITIES_HEALTH_SAFETY",
    subcategory: "أولويات قسم الطوارئ والتسكين السريع",
    lifecycle_status: "PRIVATE_GRACE",
    moderation_status: "APPROVED",
    dispute_status: "NONE",
    safety_status: "CLEAR",
    visibility: "STRICTLY_PRIVATE",
    sanitized_description: "تأخر إدخال حالة طارئة متوسطة الخطورة لقسم الملاحظة لأكثر من 90 دقيقة دون تقديم إفادة طبية واضحة للمرافقين وفق معايير الهيئة العامة للاعتماد (GAHAR).",
    initial_experience_rating: 1,
    grace_expires_at: new Date(Date.now() + 1.2 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 5.8 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5.8 * 86400000).toISOString(),
    metadata: { display_token: "MRN-***412" },
  },
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    reference_number: "MRF-2026-42938",
    user_id: "00000000-0000-0000-0000-000000000001",
    institution_id: "med-salam-001",
    institution_name: "مستشفى السلام الدولي بالمعادي",
    sector: "HEALTHCARE_MEDICAL",
    category: "ADMINISTRATION_DISCIPLINE",
    subcategory: "إجراءات الموافقات التأمينية والمطالبات",
    lifecycle_status: "PRIVATE_GRACE",
    moderation_status: "APPROVED",
    dispute_status: "NONE",
    safety_status: "CLEAR",
    visibility: "STRICTLY_PRIVATE",
    sanitized_description: "تأخر التنسيق مع شركة التأمين الطبي لاعتماد الفحوصات الإشعاعية المتقدمة قبل موعد التدخل الجراحي بـ 48 ساعة مما سبب إلغاء الموعد المحدد.",
    initial_experience_rating: 2,
    grace_expires_at: new Date(Date.now() + 4 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    metadata: { display_token: "POL-***882" },
  },

  // 6. Custom / Manually Added Entities
  {
    id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    reference_number: "MRF-2026-11849",
    user_id: "00000000-0000-0000-0000-000000000001",
    institution_id: "OTHER",
    institution_name: "مدرسة النصر للبنات بالشاطبي (جهة مضافة يدوياً - الإسكندرية)",
    sector: "EDUCATION_SCHOOLS",
    category: "TEACHER_COMMUNICATION",
    subcategory: "تواصل الإدارة مع أولياء الأمور",
    lifecycle_status: "PRIVATE_GRACE",
    moderation_status: "APPROVED",
    dispute_status: "NONE",
    safety_status: "CLEAR",
    visibility: "STRICTLY_PRIVATE",
    sanitized_description: "طلب مراجعة مواعيد تسليم الكتب الدراسية والشهادات لطلاب الصف الأول الثانوي بعد تعذر التواصل الهاتفي مع إدارة الفرع.",
    initial_experience_rating: 2,
    grace_expires_at: new Date(Date.now() + 4.5 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 2.5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2.5 * 86400000).toISOString(),
    metadata: { display_token: "STU-***291", custom_entity_name: "مدرسة النصر للبنات بالشاطبي", is_custom_entity: true },
  },
];

function isLiveSupabaseAvailable(): boolean {
  if (process.env.NODE_ENV === "test") return false;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  if (url.includes("localhost:54321") || key.includes("dummy")) return false;
  return true;
}

class StorageAdapter {
  private inMemoryStore: StorageSchema;

  constructor() {
    this.inMemoryStore = this.loadStore();
  }

  private loadStore(): StorageSchema {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.cases && Array.isArray(parsed.cases)) {
          parsed.departments = parsed.departments || [];
          parsed.internalNotes = parsed.internalNotes || [];
          parsed.tenantBranding = parsed.tenantBranding || {};
          parsed.tenantSlaConfigs = parsed.tenantSlaConfigs || {};
          parsed.staffMembers = parsed.staffMembers || [];
          parsed.institutions = parsed.institutions || SEED_INSTITUTIONS;
          parsed.customFields = parsed.customFields || {};
          parsed.workflowRules = parsed.workflowRules || {};
          parsed.webhooks = parsed.webhooks || {};
          parsed.webhookLogs = parsed.webhookLogs || [];
          parsed.auditLogs = parsed.auditLogs || [];
          parsed.caseTemplates = parsed.caseTemplates || {};
          parsed.branches = parsed.branches || {};
          return parsed;
        }
      }
    } catch {
      // Fallback
    }

    const initialStore: StorageSchema = {
      cases: [...SEED_CASES],
      actionPlans: [],
      evaluations: [],
      events: [],
      departments: [],
      internalNotes: [],
      tenantBranding: {},
      tenantSlaConfigs: {},
      staffMembers: [],
      institutions: SEED_INSTITUTIONS,
      customFields: {},
      workflowRules: {},
      webhooks: {},
      webhookLogs: [],
      auditLogs: [],
      caseTemplates: {},
      branches: {},
    };
    this.persistStore(initialStore);
    return initialStore;
  }

  private persistStore(data: StorageSchema): void {
    try {
      const dir = path.dirname(STORE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.warn("Could not persist to file store, running in-memory only:", err);
    }
  }

  public async saveCase(
    caseRecord: any,
    sensitiveData?: any,
    consentRecord?: any,
    eventRecord?: any
  ): Promise<StoredCaseItem> {
    // Attempt Supabase persistence if available
    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = await createClient();
        await supabase.from("cases").insert(caseRecord);
        if (sensitiveData) await supabase.from("case_sensitive_data").insert(sensitiveData);
        if (consentRecord) await supabase.from("consent_records").insert(consentRecord);
        if (eventRecord) await supabase.from("case_events").insert(eventRecord);
      } catch (dbErr) {
        // Supabase unconfigured or offline in local dev; persistent store takes over
      }
    }

    const item: StoredCaseItem = {
      ...caseRecord,
      institution_name: (caseRecord.metadata as any)?.custom_entity_name || caseRecord.institution_name || "جهة مسجلة",
      sector: caseRecord.sector || "COMMERCIAL_COMPANIES",
      moderation_status: caseRecord.moderation_status || "APPROVED",
      dispute_status: caseRecord.dispute_status || "NONE",
      safety_status: caseRecord.safety_status || "CLEAR",
    };

    // Prepend to cases
    this.inMemoryStore.cases.unshift(item);

    if (eventRecord) {
      this.inMemoryStore.events.push(eventRecord);
    }

    this.persistStore(this.inMemoryStore);
    return item;
  }

  public async getCaseById(id: string): Promise<StoredCaseItem | null> {
    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = await createClient();
        const { data } = await supabase.from("cases").select("*").eq("id", id).single();
        if (data) return data as StoredCaseItem;
      } catch {
        // fallback
      }
    }

    const found = this.inMemoryStore.cases.find((c) => c.id === id);
    return found || null;
  }

  public async getCaseByReference(referenceNumber: string): Promise<StoredCaseItem | null> {
    const normalized = referenceNumber.trim().toUpperCase();
    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = await createClient();
        const { data } = await supabase
          .from("cases")
          .select("*")
          .ilike("reference_number", normalized)
          .single();
        if (data) return data as StoredCaseItem;
      } catch {
        // fallback
      }
    }

    const found = this.inMemoryStore.cases.find(
      (c) => c.reference_number?.toUpperCase() === normalized
    );
    return found || null;
  }

  public async listCases(filters?: {
    institutionId?: string;
    sector?: string;
    lifecycleStatus?: string;
    departmentId?: string;
    priority?: string;
    assignedStaffId?: string;
  }): Promise<StoredCaseItem[]> {
    let cases = [...this.inMemoryStore.cases];

    if (filters?.institutionId && filters.institutionId !== "ALL") {
      cases = cases.filter(
        (c) =>
          c.institution_id === filters.institutionId ||
          (filters.institutionId === "OTHER" &&
            (c.institution_id === "OTHER" || (c.metadata as any)?.is_custom_entity))
      );
    }

    if (filters?.sector) {
      cases = cases.filter((c) => c.sector === filters.sector);
    }

    if (filters?.lifecycleStatus) {
      cases = cases.filter((c) => c.lifecycle_status === filters.lifecycleStatus);
    }

    if (filters?.departmentId && filters.departmentId !== "ALL") {
      cases = cases.filter((c) => c.assigned_department_id === filters.departmentId);
    }

    if (filters?.priority && filters.priority !== "ALL") {
      cases = cases.filter((c) => c.priority === filters.priority);
    }

    if (filters?.assignedStaffId) {
      cases = cases.filter((c) => c.assigned_staff_id === filters.assignedStaffId);
    }

    const now = Date.now();
    return cases.map((c) => {
      const msLeft = c.grace_expires_at ? new Date(c.grace_expires_at).getTime() - now : 0;
      const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
      const hoursLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60)));
      return {
        ...c,
        remaining_days: daysLeft,
        remaining_hours: hoursLeft,
        is_urgent: daysLeft <= 2,
      };
    });
  }

  public async updateCaseLifecycle(
    caseId: string,
    newStatus: LifecycleStatus,
    event?: { actorId: string; actorRole: string; eventType: string; payload?: any }
  ): Promise<StoredCaseItem | null> {
    const caseItem = this.inMemoryStore.cases.find((c) => c.id === caseId);
    if (!caseItem) return null;

    caseItem.lifecycle_status = newStatus;
    caseItem.updated_at = new Date().toISOString();

    if (event) {
      const eventRecord: StoredEvent = {
        id: crypto.randomUUID(),
        case_id: caseId,
        event_type: event.eventType,
        actor_id: event.actorId,
        actor_role: event.actorRole,
        payload: event.payload || {},
        created_at: new Date().toISOString(),
      };
      this.inMemoryStore.events.push(eventRecord);
    }

    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = await createClient();
        await supabase
          .from("cases")
          .update({ lifecycle_status: newStatus, updated_at: caseItem.updated_at })
          .eq("id", caseId);
      } catch {
        // fallback
      }
    }

    this.persistStore(this.inMemoryStore);
    return caseItem;
  }

  public async saveActionPlan(
    planRecord: any,
    milestonesRecords: any[]
  ): Promise<StoredActionPlan> {
    const actionPlan: StoredActionPlan = {
      ...planRecord,
      milestones: milestonesRecords.map((m) => ({
        ...m,
        is_completed: false,
        completed_at: null,
      })),
    };

    // Remove any previous plan for this case
    this.inMemoryStore.actionPlans = this.inMemoryStore.actionPlans.filter(
      (p) => p.case_id !== planRecord.case_id
    );
    this.inMemoryStore.actionPlans.push(actionPlan);

    // Update the case status
    await this.updateCaseLifecycle(planRecord.case_id, "ACTION_PLAN_PENDING", {
      actorId: planRecord.submitted_by,
      actorRole: "INSTITUTION_REP",
      eventType: "ACTION_PLAN_FORMULATED",
      payload: { rqs_score: planRecord.rqs_score },
    });

    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = await createClient();
        await supabase.from("action_plans").insert(planRecord);
        await supabase.from("action_items").insert(milestonesRecords);
      } catch {
        // fallback
      }
    }

    this.persistStore(this.inMemoryStore);
    return actionPlan;
  }

  public async getActionPlanByCaseId(caseId: string): Promise<StoredActionPlan | null> {
    const plan = this.inMemoryStore.actionPlans.find((p) => p.case_id === caseId);
    return plan || null;
  }

  public async completeMilestone(
    milestoneId: string,
    completedBy: string = "INSTITUTION_OPS"
  ): Promise<StoredMilestone | null> {
    for (const plan of this.inMemoryStore.actionPlans) {
      const ms = plan.milestones.find((m) => m.id === milestoneId);
      if (ms) {
        ms.is_completed = true;
        ms.completed_at = new Date().toISOString();
        ms.completed_by = completedBy;

        this.persistStore(this.inMemoryStore);
        return ms;
      }
    }
    return null;
  }

  public async saveEvaluation(evalRecord: StoredEvaluation): Promise<StoredEvaluation> {
    this.inMemoryStore.evaluations.push(evalRecord);

    const isResolved = evalRecord.resolution_satisfaction_rating >= 3;
    const finalStatus: LifecycleStatus = "CLOSED";

    await this.updateCaseLifecycle(evalRecord.case_id, finalStatus, {
      actorId: evalRecord.user_id,
      actorRole: "CITIZEN",
      eventType: "CASE_EVALUATION_SUBMITTED",
      payload: {
        responsiveness_rating: evalRecord.responsiveness_rating,
        resolution_satisfaction_rating: evalRecord.resolution_satisfaction_rating,
        is_resolved: isResolved,
      },
    });

    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = await createClient();
        await supabase.from("evaluations").insert(evalRecord);
      } catch {
        // fallback
      }
    }

    this.persistStore(this.inMemoryStore);
    return evalRecord;
  }

  public async getEvaluationByCaseId(caseId: string): Promise<StoredEvaluation | null> {
    const found = this.inMemoryStore.evaluations.find((e) => e.case_id === caseId);
    return found || null;
  }

  public async getCaseEvents(caseId: string): Promise<StoredEvent[]> {
    return this.inMemoryStore.events.filter((e) => e.case_id === caseId);
  }

  public async getDepartments(institutionId: string, fallbackSector?: SectorType): Promise<StoredDepartment[]> {
    const existing = this.inMemoryStore.departments.filter((d) => d.institution_id === institutionId);
    if (existing.length > 0) {
      return existing;
    }

    // Auto-seed default departments if not yet initialized for this institution
    const sectorToUse = fallbackSector || "EDUCATION_SCHOOLS";
    const sectorConfig = getSectorConfig(sectorToUse);
    const seededDepts: StoredDepartment[] = sectorConfig.defaultDepartments.map((d) => ({
      id: crypto.randomUUID(),
      institution_id: institutionId,
      code: d.code,
      name_ar: d.name_ar,
      name_en: d.name_en,
      default_sla_hours: d.default_sla_hours,
      head_user_id: null,
      is_active: true,
      created_at: new Date().toISOString(),
    }));

    this.inMemoryStore.departments.push(...seededDepts);
    this.persistStore(this.inMemoryStore);
    return seededDepts;
  }

  public async createDepartment(
    dept: Omit<StoredDepartment, "id" | "created_at">
  ): Promise<StoredDepartment> {
    const newDept: StoredDepartment = {
      ...dept,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    this.inMemoryStore.departments.push(newDept);

    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = await createClient();
        await supabase.from("institution_departments").insert(newDept);
      } catch {
        // fallback
      }
    }

    this.persistStore(this.inMemoryStore);
    return newDept;
  }

  public async getInternalNotes(caseId: string): Promise<StoredInternalNote[]> {
    return this.inMemoryStore.internalNotes.filter((n) => n.case_id === caseId);
  }

  public async addInternalNote(
    note: Omit<StoredInternalNote, "id" | "created_at">
  ): Promise<StoredInternalNote> {
    const newNote: StoredInternalNote = {
      ...note,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    this.inMemoryStore.internalNotes.push(newNote);

    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = await createClient();
        await supabase.from("case_internal_notes").insert(newNote);
      } catch {
        // fallback
      }
    }

    this.persistStore(this.inMemoryStore);
    return newNote;
  }

  public async assignCase(
    caseId: string,
    updates: {
      departmentId?: string;
      staffId?: string;
      priority?: CasePriority;
      slaTargetHours?: number;
    }
  ): Promise<StoredCaseItem | null> {
    const caseItem = this.inMemoryStore.cases.find((c) => c.id === caseId);
    if (!caseItem) return null;

    if (updates.departmentId !== undefined) {
      caseItem.assigned_department_id = updates.departmentId;
    }
    if (updates.staffId !== undefined) {
      caseItem.assigned_staff_id = updates.staffId;
    }
    if (updates.priority !== undefined) {
      caseItem.priority = updates.priority;
    }
    if (updates.slaTargetHours) {
      caseItem.sla_target_at = new Date(Date.now() + updates.slaTargetHours * 3600000).toISOString();
    }
    caseItem.updated_at = new Date().toISOString();

    // Log assignment event
    const eventRecord: StoredEvent = {
      id: crypto.randomUUID(),
      case_id: caseId,
      event_type: "CASE_ASSIGNMENT_UPDATED",
      actor_id: updates.staffId || "SYSTEM",
      actor_role: "OPS_LEAD",
      payload: updates,
      created_at: new Date().toISOString(),
    };
    this.inMemoryStore.events.push(eventRecord);

    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = await createClient();
        await supabase
          .from("cases")
          .update({
            assigned_department_id: caseItem.assigned_department_id,
            assigned_staff_id: caseItem.assigned_staff_id,
            priority: caseItem.priority,
            sla_target_at: caseItem.sla_target_at,
            updated_at: caseItem.updated_at,
          })
          .eq("id", caseId);
      } catch {
        // fallback
      }
    }

    this.persistStore(this.inMemoryStore);
    return caseItem;
  }

  public async updateDepartment(
    deptId: string,
    updates: Partial<StoredDepartment>
  ): Promise<StoredDepartment | null> {
    const dept = this.inMemoryStore.departments.find((d) => d.id === deptId);
    if (!dept) return null;

    Object.assign(dept, updates);

    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = await createClient();
        await supabase
          .from("institution_departments")
          .update(updates)
          .eq("id", deptId);
      } catch {
        // fallback
      }
    }

    this.persistStore(this.inMemoryStore);
    return dept;
  }

  public async deleteDepartment(deptId: string): Promise<boolean> {
    const index = this.inMemoryStore.departments.findIndex((d) => d.id === deptId);
    if (index === -1) return false;

    this.inMemoryStore.departments.splice(index, 1);

    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = await createClient();
        await supabase.from("institution_departments").delete().eq("id", deptId);
      } catch {
        // fallback
      }
    }

    this.persistStore(this.inMemoryStore);
    return true;
  }

  public async getTenantBranding(institutionId: string): Promise<TenantBranding | null> {
    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = await createClient();
        const { data } = await supabase
          .from("institutions")
          .select("branding")
          .eq("id", institutionId)
          .single();
        if (data?.branding) return data.branding as TenantBranding;
      } catch {
        // fallback
      }
    }

    return this.inMemoryStore.tenantBranding?.[institutionId] || {
      primary_color: "#0F766E",
      secondary_color: "#1E293B",
      institution_short_name: "مُرافِق المؤسسي",
      welcome_message_ar: "أهلاً بك في البوابة المؤسسية لإدارة الحالات وحل المشكلات",
      welcome_message_en: "Welcome to Enterprise Case & Resolution Management",
    };
  }

  public async saveTenantBranding(
    institutionId: string,
    branding: Partial<TenantBranding>
  ): Promise<TenantBranding> {
    if (!this.inMemoryStore.tenantBranding) {
      this.inMemoryStore.tenantBranding = {};
    }

    const current = this.inMemoryStore.tenantBranding[institutionId] || {
      primary_color: "#0F766E",
      institution_short_name: "مُرافِق المؤسسي",
    };

    const updated: TenantBranding = {
      ...current,
      ...branding,
    };

    this.inMemoryStore.tenantBranding[institutionId] = updated;

    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = await createClient();
        await supabase
          .from("institutions")
          .update({ branding: updated })
          .eq("id", institutionId);
      } catch {
        // fallback
      }
    }

    this.persistStore(this.inMemoryStore);
    return updated;
  }

  public async getTenantSlaConfig(institutionId: string): Promise<TenantSlaConfig> {
    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = await createClient();
        const { data } = await supabase
          .from("institutions")
          .select("sla_config")
          .eq("id", institutionId)
          .single();
        if (data?.sla_config) return data.sla_config as TenantSlaConfig;
      } catch {
        // fallback
      }
    }

    return (
      this.inMemoryStore.tenantSlaConfigs?.[institutionId] || {
        first_response_hours: 24,
        action_plan_hours: 72,
        resolution_hours: 168,
        critical_resolution_hours: 24,
        high_resolution_hours: 48,
        medium_resolution_hours: 96,
        low_resolution_hours: 168,
        escalation_threshold_hours: 48,
        business_hours_start: "08:00",
        business_hours_end: "16:00",
        working_days: [0, 1, 2, 3, 4],
      }
    );
  }

  public async saveTenantSlaConfig(
    institutionId: string,
    config: Partial<TenantSlaConfig>
  ): Promise<TenantSlaConfig> {
    if (!this.inMemoryStore.tenantSlaConfigs) {
      this.inMemoryStore.tenantSlaConfigs = {};
    }

    const current = await this.getTenantSlaConfig(institutionId);
    const updated: TenantSlaConfig = {
      ...current,
      ...config,
    };

    this.inMemoryStore.tenantSlaConfigs[institutionId] = updated;

    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = await createClient();
        await supabase
          .from("institutions")
          .update({ sla_config: updated })
          .eq("id", institutionId);
      } catch {
        // fallback
      }
    }

    this.persistStore(this.inMemoryStore);
    return updated;
  }

  public async getStaffMembers(institutionId: string): Promise<InstitutionStaffMember[]> {
    const list = this.inMemoryStore.staffMembers || [];
    const filtered = list.filter((s) => s.institution_id === institutionId);
    if (filtered.length > 0) return filtered;

    // Seed default staff members for demo/local if empty
    const defaults: InstitutionStaffMember[] = [
      {
        id: crypto.randomUUID(),
        institution_id: institutionId,
        name: "د. طارق مصطفى",
        email: "tarek.m@organization.edu.eg",
        role: "ADMIN",
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        institution_id: institutionId,
        name: "أ. منى يوسف",
        email: "mona.y@organization.edu.eg",
        role: "OPS_LEAD",
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        institution_id: institutionId,
        name: "م. خالد نبيل",
        email: "khaled.n@organization.edu.eg",
        role: "STAFF",
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ];

    if (!this.inMemoryStore.staffMembers) {
      this.inMemoryStore.staffMembers = [];
    }
    this.inMemoryStore.staffMembers.push(...defaults);
    this.persistStore(this.inMemoryStore);
    return defaults;
  }

  public async createStaffMember(
    staff: Omit<InstitutionStaffMember, "id" | "created_at">
  ): Promise<InstitutionStaffMember> {
    if (!this.inMemoryStore.staffMembers) {
      this.inMemoryStore.staffMembers = [];
    }

    const newStaff: InstitutionStaffMember = {
      ...staff,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    this.inMemoryStore.staffMembers.push(newStaff);
    this.persistStore(this.inMemoryStore);
    return newStaff;
  }

  public async updateStaffMember(
    staffId: string,
    updates: Partial<InstitutionStaffMember>
  ): Promise<InstitutionStaffMember | null> {
    if (!this.inMemoryStore.staffMembers) return null;
    const staff = this.inMemoryStore.staffMembers.find((s) => s.id === staffId);
    if (!staff) return null;

    Object.assign(staff, updates);
    this.persistStore(this.inMemoryStore);
    return staff;
  }

  public async deleteStaffMember(staffId: string): Promise<boolean> {
    if (!this.inMemoryStore.staffMembers) return false;
    const index = this.inMemoryStore.staffMembers.findIndex((s) => s.id === staffId);
    if (index === -1) return false;

    this.inMemoryStore.staffMembers.splice(index, 1);
    this.persistStore(this.inMemoryStore);
    return true;
  }

  // ==========================================
  // ENTERPRISE MULTI-TENANCY METHODS
  // ==========================================

  public async getOrganizations(): Promise<Institution[]> {
    return this.inMemoryStore.institutions || SEED_INSTITUTIONS;
  }

  public async getOrganization(id: string): Promise<Institution | null> {
    const list = await this.getOrganizations();
    return list.find((org) => org.id === id) || null;
  }

  public async createOrganization(org: Omit<Institution, "created_at" | "updated_at">): Promise<Institution> {
    if (!this.inMemoryStore.institutions) {
      this.inMemoryStore.institutions = [...SEED_INSTITUTIONS];
    }
    const now = new Date().toISOString();
    const newOrg: Institution = {
      ...org,
      status: org.status || "ACTIVE",
      created_at: now,
      updated_at: now,
    };
    this.inMemoryStore.institutions.push(newOrg);
    this.persistStore(this.inMemoryStore);
    await this.logAuditEvent({
      institution_id: newOrg.id,
      actor_id: "super-admin",
      actor_name: "Murafiq Platform Owner",
      actor_role: "SUPER_ADMIN",
      action: "CREATE_ORGANIZATION",
      entity_type: "ORGANIZATION",
      entity_id: newOrg.id,
      after_state: newOrg,
    });
    return newOrg;
  }

  public async updateOrganization(id: string, updates: Partial<Institution>): Promise<Institution | null> {
    if (!this.inMemoryStore.institutions) {
      this.inMemoryStore.institutions = [...SEED_INSTITUTIONS];
    }
    const org = this.inMemoryStore.institutions.find((o) => o.id === id);
    if (!org) return null;

    const beforeState = { ...org };
    Object.assign(org, updates, { updated_at: new Date().toISOString() });
    this.persistStore(this.inMemoryStore);

    await this.logAuditEvent({
      institution_id: id,
      actor_id: "super-admin",
      actor_name: "Murafiq Platform Owner",
      actor_role: "SUPER_ADMIN",
      action: "UPDATE_ORGANIZATION",
      entity_type: "ORGANIZATION",
      entity_id: id,
      before_state: beforeState,
      after_state: org,
    });

    return org;
  }

  public async getSubscription(institutionId: string): Promise<TenantSubscription> {
    const org = await this.getOrganization(institutionId);
    if (org?.subscription) return org.subscription;

    return {
      plan: "ENTERPRISE",
      status: "ACTIVE",
      max_staff_seats: 50,
      max_cases_monthly: 1000,
      max_storage_gb: 100,
      ai_quota_monthly: 5000,
      ai_used_this_month: 250,
      custom_domain_enabled: true,
      webhooks_enabled: true,
      sso_enabled: true,
      renews_at: new Date(Date.now() + 300 * 86400000).toISOString(),
    };
  }

  public async saveSubscription(institutionId: string, sub: Partial<TenantSubscription>): Promise<TenantSubscription> {
    const current = await this.getSubscription(institutionId);
    const updated: TenantSubscription = { ...current, ...sub };
    await this.updateOrganization(institutionId, { subscription: updated });
    return updated;
  }

  // Custom Fields
  public async getCustomFields(institutionId: string): Promise<CustomFieldDefinition[]> {
    if (!this.inMemoryStore.customFields) {
      this.inMemoryStore.customFields = {};
    }
    if (!this.inMemoryStore.customFields[institutionId]) {
      const org = await this.getOrganization(institutionId);
      const sector = org?.sector || "EDUCATION_SCHOOLS";
      let defaults: CustomFieldDefinition[] = [];
      if (sector === "EDUCATION_SCHOOLS") {
        defaults = [
          {
            id: crypto.randomUUID(),
            institution_id: institutionId,
            field_key: "student_grade",
            label_ar: "الصف الدراسي",
            label_en: "Academic Grade",
            field_type: "SELECT",
            options: ["الصف الأول الابتدائي", "الصف الثاني الابتدائي", "الصف الثالث الإعدادي", "الصف الأول الثانوي"],
            is_required: true,
            visibility: "BENEFICIARY",
          },
          {
            id: crypto.randomUUID(),
            institution_id: institutionId,
            field_key: "student_id",
            label_ar: "رقم قيد الطالب",
            label_en: "Student Registration Code",
            field_type: "TEXT",
            is_required: true,
            visibility: "BENEFICIARY",
            placeholder_ar: "مثال: STU-8924",
          },
        ];
      } else if (sector === "HIGHER_EDUCATION") {
        defaults = [
          {
            id: crypto.randomUUID(),
            institution_id: institutionId,
            field_key: "faculty_name",
            label_ar: "الكلية / المعهد",
            label_en: "Faculty / College",
            field_type: "SELECT",
            options: ["كلية الهندسة", "كلية الطب", "كلية التجارة", "كلية الحاسبات والذكاء الاصطناعي"],
            is_required: true,
            visibility: "BENEFICIARY",
          },
          {
            id: crypto.randomUUID(),
            institution_id: institutionId,
            field_key: "academic_number",
            label_ar: "الرقم الجامعي",
            label_en: "University ID",
            field_type: "TEXT",
            is_required: true,
            visibility: "BENEFICIARY",
          },
        ];
      } else if (sector === "HEALTHCARE_MEDICAL") {
        defaults = [
          {
            id: crypto.randomUUID(),
            institution_id: institutionId,
            field_key: "medical_record_number",
            label_ar: "رقم الملف الطبي",
            label_en: "Medical Record Number (MRN)",
            field_type: "TEXT",
            is_required: true,
            visibility: "BENEFICIARY",
          },
          {
            id: crypto.randomUUID(),
            institution_id: institutionId,
            field_key: "clinic_department",
            label_ar: "العيادة / القسم الطبي",
            label_en: "Clinic / Medical Department",
            field_type: "SELECT",
            options: ["العيادات الخارجية", "قسم الطوارئ", "الباطنة", "الجراحة العامة"],
            is_required: true,
            visibility: "BENEFICIARY",
          },
        ];
      } else {
        defaults = [
          {
            id: crypto.randomUUID(),
            institution_id: institutionId,
            field_key: "customer_id",
            label_ar: "رقم المشترك / الحساب",
            label_en: "Customer Account Number",
            field_type: "TEXT",
            is_required: true,
            visibility: "BENEFICIARY",
          },
        ];
      }
      this.inMemoryStore.customFields[institutionId] = defaults;
      this.persistStore(this.inMemoryStore);
    }
    return this.inMemoryStore.customFields[institutionId] || [];
  }

  public async saveCustomField(institutionId: string, field: Omit<CustomFieldDefinition, "id"> & { id?: string }): Promise<CustomFieldDefinition> {
    if (!this.inMemoryStore.customFields) this.inMemoryStore.customFields = {};
    if (!this.inMemoryStore.customFields[institutionId]) this.inMemoryStore.customFields[institutionId] = [];

    const existingIdx = field.id ? this.inMemoryStore.customFields[institutionId].findIndex((f) => f.id === field.id) : -1;
    if (existingIdx >= 0) {
      const updated = { ...this.inMemoryStore.customFields[institutionId][existingIdx], ...field };
      this.inMemoryStore.customFields[institutionId][existingIdx] = updated;
      this.persistStore(this.inMemoryStore);
      return updated;
    } else {
      const newField: CustomFieldDefinition = {
        ...field,
        id: crypto.randomUUID(),
        institution_id: institutionId,
      };
      this.inMemoryStore.customFields[institutionId].push(newField);
      this.persistStore(this.inMemoryStore);
      return newField;
    }
  }

  public async deleteCustomField(institutionId: string, fieldId: string): Promise<boolean> {
    if (!this.inMemoryStore.customFields || !this.inMemoryStore.customFields[institutionId]) return false;
    const idx = this.inMemoryStore.customFields[institutionId].findIndex((f) => f.id === fieldId);
    if (idx === -1) return false;
    this.inMemoryStore.customFields[institutionId].splice(idx, 1);
    this.persistStore(this.inMemoryStore);
    return true;
  }

  // Workflows
  public async getWorkflowRules(institutionId: string): Promise<WorkflowRule[]> {
    if (!this.inMemoryStore.workflowRules) this.inMemoryStore.workflowRules = {};
    if (!this.inMemoryStore.workflowRules[institutionId]) {
      const defaults: WorkflowRule[] = [
        {
          id: crypto.randomUUID(),
          institution_id: institutionId,
          name: "التوجيه الفوري للشكاوى العاجلة",
          trigger: "CASE_CREATED",
          condition_priority: "CRITICAL",
          action_set_sla_hours: 12,
          action_notify_channels: ["IN_APP", "WHATSAPP"],
          escalation_threshold_hours: 8,
          escalation_target_role: "ADMIN",
          is_active: true,
          created_at: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          institution_id: institutionId,
          name: "إشعار المسؤول عند اقتراب انتهاء الـ SLA بنسبة 75%",
          trigger: "SLA_WARNING",
          condition_sla_hours_left: 6,
          action_notify_channels: ["IN_APP", "EMAIL"],
          escalation_threshold_hours: 4,
          escalation_target_role: "OPS_LEAD",
          is_active: true,
          created_at: new Date().toISOString(),
        },
      ];
      this.inMemoryStore.workflowRules[institutionId] = defaults;
      this.persistStore(this.inMemoryStore);
    }
    return this.inMemoryStore.workflowRules[institutionId] || [];
  }

  public async saveWorkflowRule(institutionId: string, rule: Omit<WorkflowRule, "id" | "created_at"> & { id?: string }): Promise<WorkflowRule> {
    if (!this.inMemoryStore.workflowRules) this.inMemoryStore.workflowRules = {};
    if (!this.inMemoryStore.workflowRules[institutionId]) this.inMemoryStore.workflowRules[institutionId] = [];

    const existingIdx = rule.id ? this.inMemoryStore.workflowRules[institutionId].findIndex((r) => r.id === rule.id) : -1;
    if (existingIdx >= 0) {
      const updated = { ...this.inMemoryStore.workflowRules[institutionId][existingIdx], ...rule };
      this.inMemoryStore.workflowRules[institutionId][existingIdx] = updated;
      this.persistStore(this.inMemoryStore);
      return updated;
    } else {
      const newRule: WorkflowRule = {
        ...rule,
        id: crypto.randomUUID(),
        institution_id: institutionId,
        created_at: new Date().toISOString(),
      };
      this.inMemoryStore.workflowRules[institutionId].push(newRule);
      this.persistStore(this.inMemoryStore);
      return newRule;
    }
  }

  public async deleteWorkflowRule(institutionId: string, ruleId: string): Promise<boolean> {
    if (!this.inMemoryStore.workflowRules || !this.inMemoryStore.workflowRules[institutionId]) return false;
    const idx = this.inMemoryStore.workflowRules[institutionId].findIndex((r) => r.id === ruleId);
    if (idx === -1) return false;
    this.inMemoryStore.workflowRules[institutionId].splice(idx, 1);
    this.persistStore(this.inMemoryStore);
    return true;
  }

  // Webhooks
  public async getWebhooks(institutionId: string): Promise<WebhookSubscription[]> {
    if (!this.inMemoryStore.webhooks) this.inMemoryStore.webhooks = {};
    if (!this.inMemoryStore.webhooks[institutionId]) {
      const defaults: WebhookSubscription[] = [
        {
          id: crypto.randomUUID(),
          institution_id: institutionId,
          url: "https://api.organization.edu.eg/webhooks/murafiq",
          secret: "whsec_" + crypto.randomBytes(16).toString("hex"),
          events: ["case.created", "case.assigned", "case.resolved"],
          is_active: true,
          created_at: new Date().toISOString(),
          last_delivery_at: new Date(Date.now() - 3600000).toISOString(),
          last_status_code: 200,
        },
      ];
      this.inMemoryStore.webhooks[institutionId] = defaults;
      this.persistStore(this.inMemoryStore);
    }
    return this.inMemoryStore.webhooks[institutionId] || [];
  }

  public async saveWebhook(institutionId: string, webhook: Omit<WebhookSubscription, "id" | "created_at"> & { id?: string }): Promise<WebhookSubscription> {
    if (!this.inMemoryStore.webhooks) this.inMemoryStore.webhooks = {};
    if (!this.inMemoryStore.webhooks[institutionId]) this.inMemoryStore.webhooks[institutionId] = [];

    const existingIdx = webhook.id ? this.inMemoryStore.webhooks[institutionId].findIndex((w) => w.id === webhook.id) : -1;
    if (existingIdx >= 0) {
      const updated = { ...this.inMemoryStore.webhooks[institutionId][existingIdx], ...webhook };
      this.inMemoryStore.webhooks[institutionId][existingIdx] = updated;
      this.persistStore(this.inMemoryStore);
      return updated;
    } else {
      const newWebhook: WebhookSubscription = {
        ...webhook,
        id: crypto.randomUUID(),
        institution_id: institutionId,
        secret: webhook.secret || "whsec_" + crypto.randomBytes(16).toString("hex"),
        created_at: new Date().toISOString(),
      };
      this.inMemoryStore.webhooks[institutionId].push(newWebhook);
      this.persistStore(this.inMemoryStore);
      return newWebhook;
    }
  }

  public async deleteWebhook(institutionId: string, webhookId: string): Promise<boolean> {
    if (!this.inMemoryStore.webhooks || !this.inMemoryStore.webhooks[institutionId]) return false;
    const idx = this.inMemoryStore.webhooks[institutionId].findIndex((w) => w.id === webhookId);
    if (idx === -1) return false;
    this.inMemoryStore.webhooks[institutionId].splice(idx, 1);
    this.persistStore(this.inMemoryStore);
    return true;
  }

  public async recordWebhookDelivery(log: Omit<WebhookDeliveryLog, "id" | "delivered_at">): Promise<WebhookDeliveryLog> {
    if (!this.inMemoryStore.webhookLogs) this.inMemoryStore.webhookLogs = [];
    const newLog: WebhookDeliveryLog = {
      ...log,
      id: crypto.randomUUID(),
      delivered_at: new Date().toISOString(),
    };
    this.inMemoryStore.webhookLogs.unshift(newLog);
    if (this.inMemoryStore.webhookLogs.length > 200) {
      this.inMemoryStore.webhookLogs = this.inMemoryStore.webhookLogs.slice(0, 200);
    }
    this.persistStore(this.inMemoryStore);
    return newLog;
  }

  public async getWebhookLogs(institutionId: string): Promise<WebhookDeliveryLog[]> {
    const webhooks = await this.getWebhooks(institutionId);
    const ids = new Set(webhooks.map((w) => w.id));
    return (this.inMemoryStore.webhookLogs || []).filter((l) => ids.has(l.subscription_id));
  }

  // Audit Logs
  public async logAuditEvent(entry: Omit<AuditLogEntry, "id" | "created_at">): Promise<AuditLogEntry> {
    if (!this.inMemoryStore.auditLogs) this.inMemoryStore.auditLogs = [];
    const newEntry: AuditLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    this.inMemoryStore.auditLogs.unshift(newEntry);
    if (this.inMemoryStore.auditLogs.length > 1000) {
      this.inMemoryStore.auditLogs = this.inMemoryStore.auditLogs.slice(0, 1000);
    }
    this.persistStore(this.inMemoryStore);
    return newEntry;
  }

  public async getAuditLogs(institutionId?: string, limit: number = 50): Promise<AuditLogEntry[]> {
    if (!this.inMemoryStore.auditLogs) {
      this.inMemoryStore.auditLogs = [
        {
          id: crypto.randomUUID(),
          institution_id: institutionId || "00000000-0000-0000-0000-000000000010",
          actor_id: "usr-admin-01",
          actor_name: "د. طارق مصطفى",
          actor_role: "ADMIN",
          action: "UPDATE_SLA_POLICY",
          entity_type: "SLA",
          entity_id: "sla-config",
          before_state: { first_response_hours: 48 },
          after_state: { first_response_hours: 24 },
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          id: crypto.randomUUID(),
          institution_id: institutionId || "00000000-0000-0000-0000-000000000010",
          actor_id: "usr-ops-02",
          actor_name: "أ. منى يوسف",
          actor_role: "OPS_LEAD",
          action: "ASSIGN_CASE_DEPARTMENT",
          entity_type: "CASE",
          entity_id: "11111111-1111-1111-1111-111111111111",
          before_state: { department: "UNASSIGNED" },
          after_state: { department: "STUDENT_AFFAIRS" },
          created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
        },
      ];
      this.persistStore(this.inMemoryStore);
    }

    let list = this.inMemoryStore.auditLogs || [];
    if (institutionId) {
      list = list.filter((a) => a.institution_id === institutionId);
    }
    return list.slice(0, limit);
  }

  // Case Templates
  public async getCaseTemplates(institutionId: string, sector?: SectorType): Promise<CaseTemplate[]> {
    if (!this.inMemoryStore.caseTemplates) this.inMemoryStore.caseTemplates = {};
    if (!this.inMemoryStore.caseTemplates[institutionId]) {
      const org = await this.getOrganization(institutionId);
      const sec = sector || org?.sector || "EDUCATION_SCHOOLS";
      let defaults: CaseTemplate[] = [];

      if (sec === "HIGHER_EDUCATION") {
        defaults = [
          {
            id: crypto.randomUUID(),
            institution_id: institutionId,
            sector: "HIGHER_EDUCATION",
            title_ar: "التماس إعادة رصد وتصحيح درجات الامتحان",
            title_en: "Exam Grade Re-evaluation Petition",
            category: "ACADEMIC_CURRICULUM",
            default_priority: "HIGH",
            suggested_sla_hours: 48,
            preset_description_ar: "طلب رسمي لمراجعة كراسة الإجابة وإعادة تجميع الدرجات من قبل لجنة الكنترول المختصة.",
            recommended_department_code: "CONTROL_AFFAIRS",
          },
          {
            id: crypto.randomUUID(),
            institution_id: institutionId,
            sector: "HIGHER_EDUCATION",
            title_ar: "طلب تأجيل سداد القسط الدراسي الجامعي",
            title_en: "Tuition Fee Installment Deferral Request",
            category: "TUITION_FEES_REFUNDS",
            default_priority: "MEDIUM",
            suggested_sla_hours: 72,
            preset_description_ar: "التماس موجه لرعاية الطلاب لتقسيط أو تأجيل المصروفات الدراسية نظراً لظروف طارئة.",
            recommended_department_code: "STUDENT_FINANCE",
          },
        ];
      } else if (sec === "HEALTHCARE_MEDICAL") {
        defaults = [
          {
            id: crypto.randomUUID(),
            institution_id: institutionId,
            sector: "HEALTHCARE_MEDICAL",
            title_ar: "شكوى تأخر مواعيد العيادات الخارجية التخصصية",
            title_en: "Outpatient Clinic Appointment Delay Complaint",
            category: "FACILITIES_HEALTH_SAFETY",
            default_priority: "MEDIUM",
            suggested_sla_hours: 24,
            preset_description_ar: "ملاحظة بشأن تجاوز وقت الانتظار المحدد للكشف الطبي دون إشعار مسبق.",
            recommended_department_code: "PATIENT_RELATIONS",
          },
          {
            id: crypto.randomUUID(),
            institution_id: institutionId,
            sector: "HEALTHCARE_MEDICAL",
            title_ar: "استفسار ومراجعة فاتورة الإقامة والخدمات الطبية",
            title_en: "Hospital Billing & Medical Service Review",
            category: "TUITION_FEES_REFUNDS",
            default_priority: "HIGH",
            suggested_sla_hours: 36,
            preset_description_ar: "طلب تفصيل بنود الفاتورة الطبية والتغطية التأمينية المعتمدة من شركة الرعاية.",
            recommended_department_code: "MEDICAL_BILLING",
          },
        ];
      } else {
        defaults = [
          {
            id: crypto.randomUUID(),
            institution_id: institutionId,
            sector: sec,
            title_ar: "طلب متابعة سلوك وانضباط مدرسي",
            title_en: "Student Behavior & Discipline Follow-up",
            category: "STUDENT_BEHAVIOR_BULLYING",
            default_priority: "HIGH",
            suggested_sla_hours: 24,
            preset_description_ar: "إشعار إدارة المدرسة بحادثة تنمر أو مشادة تتطلب تدخلاً تربوياً فورياً من الأخصائي الاجتماعي.",
            recommended_department_code: "BEHAVIORAL_DISCIPLINE",
          },
          {
            id: crypto.randomUUID(),
            institution_id: institutionId,
            sector: sec,
            title_ar: "شكوى تأخر حافلة النقل المدرسي",
            title_en: "School Bus Transport Route Delay",
            category: "TRANSPORTATION_BUSES",
            default_priority: "HIGH",
            suggested_sla_hours: 18,
            preset_description_ar: "إبلاغ عن عدم التزام السائق بالمسار المحدد وتأخر وصول الطلاب للبيوت في الموعد.",
            recommended_department_code: "FACILITIES_TRANSPORT",
          },
        ];
      }
      this.inMemoryStore.caseTemplates[institutionId] = defaults;
      this.persistStore(this.inMemoryStore);
    }
    return this.inMemoryStore.caseTemplates[institutionId] || [];
  }

  public async saveCaseTemplate(institutionId: string, template: Omit<CaseTemplate, "id"> & { id?: string }): Promise<CaseTemplate> {
    if (!this.inMemoryStore.caseTemplates) this.inMemoryStore.caseTemplates = {};
    if (!this.inMemoryStore.caseTemplates[institutionId]) this.inMemoryStore.caseTemplates[institutionId] = [];

    const newTemplate: CaseTemplate = {
      ...template,
      id: template.id || crypto.randomUUID(),
      institution_id: institutionId,
    };
    this.inMemoryStore.caseTemplates[institutionId].push(newTemplate);
    this.persistStore(this.inMemoryStore);
    return newTemplate;
  }

  // Branches
  public async getBranches(institutionId: string): Promise<TenantBranch[]> {
    if (!this.inMemoryStore.branches) this.inMemoryStore.branches = {};
    if (!this.inMemoryStore.branches[institutionId]) {
      const defaults: TenantBranch[] = [
        {
          id: crypto.randomUUID(),
          institution_id: institutionId,
          code: "MAIN",
          name_ar: "المقر الرئيسي",
          name_en: "Main Campus / HQ",
          is_active: true,
          created_at: new Date().toISOString(),
        },
      ];
      this.inMemoryStore.branches[institutionId] = defaults;
      this.persistStore(this.inMemoryStore);
    }
    return this.inMemoryStore.branches[institutionId] || [];
  }

  public async saveBranch(institutionId: string, branch: Omit<TenantBranch, "id" | "created_at"> & { id?: string }): Promise<TenantBranch> {
    if (!this.inMemoryStore.branches) this.inMemoryStore.branches = {};
    if (!this.inMemoryStore.branches[institutionId]) this.inMemoryStore.branches[institutionId] = [];

    const newBranch: TenantBranch = {
      ...branch,
      id: branch.id || crypto.randomUUID(),
      institution_id: institutionId,
      created_at: new Date().toISOString(),
    };
    this.inMemoryStore.branches[institutionId].push(newBranch);
    this.persistStore(this.inMemoryStore);
    return newBranch;
  }
}

// Global Singleton instance for Next.js runtime
export const storageAdapter = new StorageAdapter();
