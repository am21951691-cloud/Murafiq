import fs from "fs";
import path from "path";
import crypto from "crypto";
import type { Case, SectorType, LifecycleStatus } from "@/types/database";
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

interface StorageSchema {
  cases: StoredCaseItem[];
  actionPlans: StoredActionPlan[];
  evaluations: StoredEvaluation[];
  events: StoredEvent[];
}

const STORE_PATH = path.join(process.cwd(), "data", "cases-store.json");

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
}

// Global Singleton instance for Next.js runtime
export const storageAdapter = new StorageAdapter();
