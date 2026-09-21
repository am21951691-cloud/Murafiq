# Murafiq (مُرافِق) — Generic Entity Architecture Patch
**Version:** 2.3.0-RC1  
**Scope:** Controlled Polymorphic Architecture Patch (5 Egyptian Sectors)  
**Baseline:** Slice 0 Verified (17 Test Suites / 105 Tests Passing)  
**Target Date:** 2026-09-21  

---

## Executive Summary & Architectural Invariants

Murafiq (مُرافِق) is evolving from a pre-university school resolution tool into a unified Egyptian resolution and accountability platform. The system will support five core national sectors under a single **Polymorphic Entity Architecture with Backward-Compatible Aliasing**:

1. `EDUCATION_SCHOOLS` (التعليم قبل الجامعي - المدارس)
2. `HIGHER_EDUCATION` (التعليم العالي والجامعات والمعاهد)
3. `GOVERNMENT_PUBLIC` (الخدمات الحكومية والهيئات العامة)
4. `COMMERCIAL_COMPANIES` (الشركات والخدمات التجارية)
5. `HEALTHCARE_MEDICAL` (المنشآت الصحية والخدمات الطبية)

### Non-Negotiable Invariants
* **Zero Slice 0 Rewrites:** Migration `20260913000001_initial_schema.sql` remains 100% untouched and unmodified.
* **Preserve Core State Engine:** The 4-vector state model (`lifecycle_status`, `moderation_status`, `dispute_status`, `safety_status`) is unchanged.
* **Physical PII Separation:** Strict boundary isolation between operational case metadata (`cases`) and encrypted identity/reference data (`case_sensitive_data`). Zero PII exposure to public or standard staff queries under Law 151/2020.
* **Sector-Agnostic RLS:** Row Level Security policies evaluate actor identities, case ownership, institution membership, and safety status. Sectors are domain classifications, never authorization bypasses.
* **Zero Hallucinated Law:** Statutory decrees must carry human reviewer provenance, issuing authority, and gazette citations. Unverified seed entries remain `PENDING_VERIFICATION` and are excluded from production retrieval.

---

## 1. Current Model vs. Target Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ CURRENT MODEL (Pre-University Education Only)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ institutions (MOE License only) ──> cases (Pre-university category enum)     │
│   ├── institution_branches          ├── case_sensitive_data (Student ID)     │
│   └── institution_members           └── statutory_decrees (Schools only)     │
│ URLs: /schools, /schools/[slug]                                              │
│ Metrics: BARS calibrated only for pre-university Egyptian schools             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ TARGET MODEL (Generic Entity Architecture across 5 Egyptian Sectors)         │
├─────────────────────────────────────────────────────────────────────────────┤
│ institutions (Table preserved for backward-compatibility)                    │
│   ├── sector: sector_enum (5 sectors)                                       │
│   ├── sector_metadata: JSONB (Strictly validated by sector Zod schemas)      │
│   ├── branches, members (Sector-agnostic authorization)                     │
│                                                                             │
│ cases (Preserves 4-vector lifecycle, maps to dynamic sector taxonomy)        │
│   └── case_sensitive_data (Student ID, MRN, National Service No., Order Ref)│
│                                                                             │
│ statutory_decrees                                                           │
│   ├── applicable_sectors: sector_enum[]                                     │
│   └── provenance: issuing_authority, gazette_ref, reviewer_id, hash         │
│                                                                             │
│ URLs: /services, /directory (Canonical) + /schools, /schools/[slug] (Alias) │
│ Metrics: Sector-isolated Bayesian BARS priors (No cross-sector ranking)     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Sector Enum & Validated Metadata Schemas

### 2.1 Strict Sector Enum
```sql
CREATE TYPE sector_enum AS ENUM (
  'EDUCATION_SCHOOLS',
  'HIGHER_EDUCATION',
  'GOVERNMENT_PUBLIC',
  'COMMERCIAL_COMPANIES',
  'HEALTHCARE_MEDICAL'
);
```

### 2.2 Sector-Specific Metadata Schemas (Zod)
`sector_metadata` in the `institutions` table must never become an unvalidated dumping ground. Each sector enforces a strict Zod contract:

```typescript
// lib/validators/sector-metadata.ts
import { z } from "zod";

// 1. Pre-University Schools (التعليم قبل الجامعي)
export const SchoolsMetadataSchema = z.object({
  ministry_code: z.string().min(1),
  educational_stage: z.array(z.enum(["KINDERGARTEN", "PRIMARY", "PREPARATORY", "SECONDARY"])),
  curriculum_type: z.enum([
    "NATIONAL_ARABIC",
    "NATIONAL_LANGUAGES",
    "IGCSE",
    "AMERICAN_DIPLOMA",
    "IB",
    "FRENCH_BACCALAUREATE",
    "GERMAN_ABITUR",
    "OTHER"
  ]),
  gender_policy: z.enum(["CO_ED", "BOYS_ONLY", "GIRLS_ONLY"]),
  supervisory_administration: z.string().min(2), // الإدارة التعليمية التابعة لها
});

// 2. Higher Education & Universities (التعليم العالي)
export const HigherEducationMetadataSchema = z.object({
  institution_type: z.enum([
    "PUBLIC_UNIVERSITY",        // جامعة حكومية
    "PRIVATE_UNIVERSITY",       // جامعة خاصة
    "NATIONAL_AHLIYA_UNIVERSITY", // جامعة أهلية
    "TECHNOLOGICAL_UNIVERSITY", // جامعة تكنولوجية
    "HIGHER_INSTITUTE",         // معهد عالي خاص
    "ACADEMY"                   // أكاديمية معتمدة
  ]),
  supreme_council_accreditation: z.string().min(1), // رقم اعتماد المجلس الأعلى للجامعات
  faculties: z.array(z.string()).min(1),             // الكليات والمعاهد المعتمدة
  credit_hour_system: z.boolean().default(true),
});

// 3. Government & Public Services (الخدمات الحكومية والهيئات)
export const GovernmentPublicMetadataSchema = z.object({
  parent_ministry_or_authority: z.string().min(2), // الوزارة أو الهيئة التابع لها
  service_domain: z.enum([
    "CIVIL_REGISTRY",                  // السجل المدني والأحوال المدنية
    "NOTARY_REAL_ESTATE_REGISTRATION", // الشهر العقاري والتوثيق
    "TRAFFIC_LICENSING",               // المرور وتراخيص المركبات
    "TAXATION_CUSTOMS",                // الضرائب والجمارك
    "SOCIAL_INSURANCE_PENSIONS",       // التأمينات الاجتماعية والمعاشات
    "MUNICIPAL_LOCAL_SERVICES",        // الأحياء والمجالس المحلية
    "PUBLIC_UTILITIES_WATER_POWER_GAS",// المرافق العامة (مياه، كهرباء، غاز)
    "COMMUNICATIONS_POST"              // البريد والاتصالات الحكومية
  ]),
  digital_platform_code: z.string().optional(), // كود المنظومة على مصر الرقمية
  public_operating_hours: z.string().optional(),
});

// 4. Commercial Companies (الشركات والخدمات التجارية)
export const CommercialCompaniesMetadataSchema = z.object({
  commercial_registration_number: z.string().min(3), // رقم السجل التجاري
  tax_card_number: z.string().min(5),                // رقم البطاقة الضريبية
  industry_sector: z.enum([
    "TELECOM_AND_ISP",
    "FINANCIAL_BANKING_FINTECH",
    "RETAIL_AND_ECOMMERCE",
    "TRANSPORTATION_RIDE_HAILING",
    "REAL_ESTATE_DEVELOPMENT",
    "CONSUMER_ELECTRONICS_APPLIANCES",
    "AUTOMOTIVE_SALES_SERVICE",
    "SUBSCRIPTION_SERVICES"
  ]),
  cpa_registered: z.boolean().default(false), // مقيد بسجل جهاز حماية المستهلك
});

// 5. Healthcare & Medical Facilities (المنشآت الطبية)
export const HealthcareMedicalMetadataSchema = z.object({
  facility_tier: z.enum([
    "PUBLIC_HOSPITAL_MOH",        // مستشفى حكومي تابع لوزارة الصحة
    "UNIVERSITY_HOSPITAL",         // مستشفى جامعي
    "UNIVERSAL_HEALTH_INSURANCE",  // منشأة تابعة لمنظومة التأمين الصحي الشامل
    "PRIVATE_HOSPITAL",            // مستشفى خاص
    "SPECIALIZED_MEDICAL_CENTER",  // مركز طبي تخصصي
    "DIAGNOSTIC_IMAGING_LAB",      // معمل تحاليل / مركز أشعة
    "PRIMARY_CARE_CLINIC"          // عيادة أو وحدة طب أسرة
  ]),
  licensing_authority: z.enum(["MINISTRY_OF_HEALTH", "GAHAR", "DOCTORS_SYNDICATE"]),
  facility_license_number: z.string().min(1),
  emergency_department_active: z.boolean().default(false),
});
```

---

## 3. Exact Database Schema Changes

A new additive migration file: `supabase/migrations/20260921000001_generic_entity_sector_patch.sql`.

```sql
-- Migration: 20260921000001_generic_entity_sector_patch.sql
-- Description: Additive migration for Polymorphic Entity Architecture across 5 Egyptian sectors

-- 1. Create Sector Enum
DO $$ BEGIN
  CREATE TYPE sector_enum AS ENUM (
    'EDUCATION_SCHOOLS',
    'HIGHER_EDUCATION',
    'GOVERNMENT_PUBLIC',
    'COMMERCIAL_COMPANIES',
    'HEALTHCARE_MEDICAL'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Enhance institutions Table (Add sector and validated sector_metadata)
ALTER TABLE institutions
  ADD COLUMN IF NOT EXISTS sector sector_enum NOT NULL DEFAULT 'EDUCATION_SCHOOLS',
  ADD COLUMN IF NOT EXISTS sector_metadata JSONB NOT NULL DEFAULT '{}'::JSONB;

CREATE INDEX IF NOT EXISTS idx_institutions_sector ON institutions(sector);

-- 3. Enhance case_sensitive_data (Physical PII / Sensitive Identifier Isolation)
-- Keeps existing student_identifiers_encrypted for backward compatibility
-- Adds generic sensitive_identifiers_encrypted for MRN, National Service No, Order ID, etc.
ALTER TABLE case_sensitive_data
  ADD COLUMN IF NOT EXISTS sensitive_identifiers_encrypted JSONB DEFAULT NULL;

-- 4. Enhance cases Table for Dynamic Sector Taxonomy
-- Convert category column to TEXT to accommodate dynamic sector taxonomies
-- (Existing values 'ACADEMIC_CURRICULUM', etc. remain 100% valid text strings)
ALTER TABLE cases ALTER COLUMN category TYPE TEXT;

ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS sector_taxonomy_version TEXT NOT NULL DEFAULT '2026.1';

-- 5. Enhance statutory_decrees Table for Sector Applicability & Human Provenance
ALTER TABLE statutory_decrees
  ADD COLUMN IF NOT EXISTS applicable_sectors sector_enum[] NOT NULL DEFAULT ARRAY['EDUCATION_SCHOOLS']::sector_enum[],
  ADD COLUMN IF NOT EXISTS official_gazette_reference TEXT,
  ADD COLUMN IF NOT EXISTS version_hash TEXT;

-- 6. Update match_statutory_decrees RPC with Sector-Aware Filtering
CREATE OR REPLACE FUNCTION match_statutory_decrees (
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 5,
  filter_sector sector_enum DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  source_reference TEXT,
  issuing_authority TEXT,
  article_number TEXT,
  title TEXT,
  text_content TEXT,
  publication_date DATE,
  effective_date DATE,
  legal_status TEXT,
  last_verified_date DATE,
  verified_by_user_id UUID,
  verification_status TEXT,
  legal_review_notes TEXT,
  applicable_sectors sector_enum[],
  similarity float
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sd.id,
    sd.source_reference,
    sd.issuing_authority,
    sd.article_number,
    sd.title,
    sd.text_content,
    sd.publication_date,
    sd.effective_date,
    sd.legal_status,
    sd.last_verified_date,
    sd.verified_by_user_id,
    sd.verification_status,
    sd.legal_review_notes,
    sd.applicable_sectors,
    (1 - (sd.embedding <=> query_embedding))::float AS similarity
  FROM statutory_decrees sd
  WHERE sd.verification_status = 'VERIFIED_ACTIVE'
    AND sd.legal_status = 'ACTIVE'
    AND (filter_sector IS NULL OR filter_sector = ANY(sd.applicable_sectors))
    AND (1 - (sd.embedding <=> query_embedding)) >= match_threshold
  ORDER BY sd.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

## 4. RLS Implications: Pure Sector-Agnostic Security

RLS policies in Murafiq are governed by **identity, ownership, institutional membership, and safety state** — never by sector.

| Table | Policy Focus | Sector Agnostic? | Explanation |
| :--- | :--- | :---: | :--- |
| `institutions` | Anyone can view | Yes | Directory viewable across all sectors. |
| `institution_members` | Own membership or Admin | Yes | Hospital admins manage doctor/staff accounts; University admins manage faculty leads. |
| `cases` | Owner view/insert; Member triage; Public curated | Yes | Evaluated via `cases.institution_id = institution_members.institution_id`. Works identically across all 5 sectors. |
| `case_sensitive_data` | Case Owner ONLY | Yes | Absolute physical separation. Zero SELECT access for staff or public, regardless of sector. |
| `statutory_decrees` | Public can view `VERIFIED_ACTIVE` | Yes | RLS permits reading verified laws; sector filtering is a query predicate, not an authorization policy. |

> [!IMPORTANT]
> **No duplicate RLS policies:** We do NOT create `cases_hospital_policy`, `cases_school_policy`, or `cases_company_policy`. A single, battle-tested set of RLS policies protects all entities uniformly.

---

## 5. PII & Sensitive Identifier Architecture (Egyptian Law 151/2020)

Under Egyptian Law No. 151 of 2020 (حماية البيانات الشخصية), reference identifiers carry serious privacy and identity risks. The platform enforces strict physical boundaries:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ INTAKE REQUEST                                                              │
│ {                                                                           │
│   institution_id: "inst-cairo-001",                                        │
│   category: "BILLING_INSURANCE",                                            │
│   sensitive_identifier: {                                                   │
│     type: "MEDICAL_RECORD_NUMBER",                                          │
│     value: "MRN-2026-948123"                                                │
│   }                                                                         │
│ }                                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                 ┌────────────────────┴────────────────────┐
                 ▼                                         ▼
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│ OPERATIONAL DB: cases           │       │ ISOLATED DB: case_sensitive_data│
├─────────────────────────────────┤       ├─────────────────────────────────┤
│ id: "case-uuid-123"             │       │ case_id: "case-uuid-123"        │
│ reference_number: "MRF-2026-4"  │       │ raw_description_encrypted       │
│ category: "BILLING_INSURANCE"   │       │ contact_phone_encrypted         │
│ sanitized_description: "..."    │       │ sensitive_identifiers_encrypted:│
│ metadata: {                     │       │   AES-256-GCM({                 │
│   display_token: "MRN-***-123"  │       │     type: "MRN",                │
│ }                               │       │     value: "MRN-2026-948123"    │
│ (NO MRN, NO CITIZEN PII)        │       │   })                            │
│ RLS: Owner, Staff, Public(safe) │       │ RLS: STRICTLY CASE OWNER ONLY   │
└─────────────────────────────────┘       └─────────────────────────────────┘
```

### Identifier Classification by Sector:
1. **Schools:** `STUDENT_CODE` (كود الطالب بالتربية والتعليم).
2. **Universities:** `ACADEMIC_STUDENT_ID` (رقم القيد / الرقم الأكاديمي).
3. **Government:** `GOVERNMENT_SERVICE_REQUEST_NO` (رقم الطلب / رقم المعاملة الحكومية).
   * **Rule on National ID:** Full 14-digit Egyptian National IDs (الرقم القومي) are **strictly rejected** by client and server validators. Only non-sensitive transactional request numbers are permitted.
4. **Commercial:** `ORDER_OR_ACCOUNT_NUMBER` (رقم الطلب / رقم الفاتورة / رقم الحساب).
5. **Healthcare:** `MEDICAL_RECORD_NUMBER` (رقم الملف الطبي / رقم التأمين الصحي الشامل).

---

## 6. Config-Driven Versioned Sector Taxonomy Model

Taxonomy is versioned and decoupled from code: `sector → category → subcategory`.

```typescript
// lib/config/taxonomies/index.ts
export interface SectorTaxonomyCategory {
  key: string;
  label_ar: string;
  label_en: string;
  subcategories: Array<{
    key: string;
    label_ar: string;
    label_en: string;
  }>;
}

export const SECTOR_TAXONOMIES_V2026_1: Record<string, SectorTaxonomyCategory[]> = {
  EDUCATION_SCHOOLS: [
    {
      key: "ACADEMIC",
      label_ar: "الشؤون الأكاديمية والتعليمية",
      label_en: "Academic & Curriculum",
      subcategories: [
        { key: "CURRICULUM_DELIVERY", label_ar: "شرح المناهج وتأخر التدريس", label_en: "Curriculum Delivery" },
        { key: "ASSESSMENT_GRADING", label_ar: "عدالة التقييم والامتحانات", label_en: "Grading & Exams" }
      ]
    },
    {
      key: "FEES_TUITION",
      label_ar: "المصروفات والرسوم المدرسية",
      label_en: "Tuition & Fees",
      subcategories: [
        { key: "UNAPPROVED_INCREASE", label_ar: "زيادة غير معتمدة في المصروفات", label_en: "Unapproved Fee Increase" },
        { key: "REFUND_DELAY", label_ar: "تأخر رد مبالغ مستحقة", label_en: "Refund Processing Delay" }
      ]
    },
    {
      key: "SAFETY_DISCIPLINE",
      label_ar: "السلامة والانضباط المدرسي",
      label_en: "Safety & Discipline",
      subcategories: [
        { key: "BULLYING", label_ar: "وقائع التنمر والعنف المدرسي", label_en: "Bullying & Harassment" },
        { key: "CORPORAL_PUNISHMENT", label_ar: "العقاب البدني أو النفسي", label_en: "Corporal or Verbal Abuse" }
      ]
    }
  ],

  HIGHER_EDUCATION: [
    {
      key: "REGISTRATION_ENROLLMENT",
      label_ar: "التسجيل وشؤون الطلاب",
      label_en: "Registration & Student Affairs",
      subcategories: [
        { key: "COURSE_OVERLOAD", label_ar: "مشكلات تسجيل الساعات المعتمدة", label_en: "Credit Hour Enrollment" },
        { key: "TRANSCRIPT_DELAY", label_ar: "تأخر استخراج الشهادات والسجلات", label_en: "Transcript Issuance Delay" }
      ]
    },
    {
      key: "TUITION_FINANCIAL",
      label_ar: "المصروفات الجامعية والخدمات",
      label_en: "University Tuition & Fees",
      subcategories: [
        { key: "SUMMER_COURSE_FEES", label_ar: "رسوم الفصول الصيفية والتحسين", label_en: "Summer Semester Billing" }
      ]
    },
    {
      key: "HOUSING_CAMPUS",
      label_ar: "المدن الجامعية والخدمات الطلابية",
      label_en: "Campus Housing & Facilities",
      subcategories: [
        { key: "DORMITORY_CONDITIONS", label_ar: "مستوى الإقامة والتغذية بالمدينة", label_en: "Dormitory Hygiene & Catering" }
      ]
    }
  ],

  GOVERNMENT_PUBLIC: [
    {
      key: "SERVICE_DELAY",
      label_ar: "تأخر إنجاز المعاملة الحكومية",
      label_en: "Service Processing Delay",
      subcategories: [
        { key: "SLA_BREACH", label_ar: "تجاوز المدة القانونية المقررة للمعاملة", label_en: "Statutory SLA Breach" }
      ]
    },
    {
      key: "DIGITAL_ACCESS",
      label_ar: "منظومات التحول الرقمي ومصر الرقمية",
      label_en: "Digital Portal & Access",
      subcategories: [
        { key: "PAYMENT_GATEWAY_FAILURE", label_ar: "خصم الرسوم دون إتمام الخدمة", label_en: "Payment Deducted Without Fulfilment" }
      ]
    },
    {
      key: "STAFF_INTERACTION",
      label_ar: "تعامل الموظفين ومكاتب الخدمة",
      label_en: "Frontline Service & Interaction",
      subcategories: [
        { key: "UNEXCUSED_ABSENCE", label_ar: "عدم تواجد الموظف المختص بمكتب الخدمة", label_en: "Service Counter Absenteeism" }
      ]
    }
  ],

  COMMERCIAL_COMPANIES: [
    {
      key: "PRODUCT_QUALITY",
      label_ar: "جودة المنتجات والخدمات",
      label_en: "Product & Service Quality",
      subcategories: [
        { key: "MANUFACTURING_DEFECT", label_ar: "عيوب صناعة بالمنتج", label_en: "Manufacturing Defect" },
        { key: "SERVICE_OUTAGE", label_ar: "انقطاع أو ضعف الخدمة المتعاقد عليها", label_en: "Service Degradation or Outage" }
      ]
    },
    {
      key: "WARRANTY_REFUND",
      label_ar: "الاستبدال والاسترجاع والضمان (قانون 181)",
      label_en: "Refund, Return & Warranty (CPA 181/2018)",
      subcategories: [
        { key: "REFUSAL_14_DAYS", label_ar: "رفض الاسترجاع خلال 14 يوماً من الشراء", label_en: "Rejection of 14-Day Return Right" },
        { key: "WARRANTY_EVASION", label_ar: "المماطلة في الصيانة المعتمدة", label_en: "Authorized Warranty Evasion" }
      ]
    }
  ],

  HEALTHCARE_MEDICAL: [
    {
      key: "APPOINTMENT_CARE",
      label_ar: "المواعيد والرعاية الطبية",
      label_en: "Appointments & Medical Care",
      subcategories: [
        { key: "EXCESSIVE_WAIT_TIME", label_ar: "تأخر مناظرة الحالات والانتظار المرهق", label_en: "Excessive Specialist Wait Time" },
        { key: "EMERGENCY_TRIAGE", label_ar: "التعامل مع حالات الطوارئ العاجلة", label_en: "Emergency Department Triage" }
      ]
    },
    {
      key: "BILLING_INSURANCE",
      label_ar: "الفواتير والتأمين الصحي الشامل",
      label_en: "Billing & Health Insurance",
      subcategories: [
        { key: "UNITEMIZED_INVOICE", label_ar: "عدم تفصيل بنود الإقامة والعلاج", label_en: "Unitemized Medical Billing" },
        { key: "INSURANCE_COPAY_DISPUTE", label_ar: "خلاف على نسبة التحمل المعتمدة", label_en: "Insurance Co-pay Dispute" }
      ]
    }
  ]
};
```

---

## 7. UX Dynamic Terminology Matrix

UI copy dynamically adapts to the entity's sector without mutating the database core:

| Sector | User / Initiator (AR / EN) | Target Entity (AR / EN) | Sensitive Identifier (AR / EN) |
| :--- | :--- | :--- | :--- |
| `EDUCATION_SCHOOLS` | ولي الأمر / الطالب (Parent / Student) | المدرسة (School) | كود الطالب المدرسي (Student Code) |
| `HIGHER_EDUCATION` | الطالب الجامعي (University Student) | الجامعة / الكلية (University / Faculty) | الرقم الجامعي / كود القيد (Academic ID) |
| `GOVERNMENT_PUBLIC` | المواطن / المستفيد (Citizen / Applicant) | الجهة الحكومية (Government Authority) | رقم الطلب / المعاملة (Service Request No.) |
| `COMMERCIAL_COMPANIES` | العميل / المستهلك (Customer / Consumer) | الشركة / المتجر (Company / Service Provider) | رقم الفاتورة / أمر الشراء (Order / Account No.) |
| `HEALTHCARE_MEDICAL` | المريض / ولي الأمر (Patient / Guardian) | المنشأة الطبية (Medical Facility / Hospital) | رقم السجل الطبي (Medical Record No.) |

---

## 8. Statutory RAG & Human Verification Protocol

### 8.1 No Synthetic or Unverified Legal Citations
* **Mandatory Rule:** Merely inserting a law into a seed file DOES NOT grant it `VERIFIED_ACTIVE` status.
* All entries must specify:
  1. `source_reference` (e.g. الجريدة الرسمية - العدد 38 مكرر ب في 24 سبتمبر 2023).
  2. `issuing_authority` (e.g. وزارة التربية والتعليم والتعليم الفني).
  3. `publication_date` & `effective_date`.
  4. `legal_status` (`ACTIVE` | `AMENDED` | `REPEALED`).
  5. `verification_status` (`VERIFIED_ACTIVE` | `PENDING_VERIFICATION`).
  6. `verified_by_user_id` (Valid UUID of vetted Egyptian legal counsel).
  7. `last_verified_date`.
  8. `version_hash` (SHA-256 of text to prevent silent corruption).

### 8.2 Safe Sector Retrieval & Neutral Fallback
* RAG retrieval is sector-scoped: `filter_sector = ANY(applicable_sectors)`.
* If no active, verified decree achieves the cosine similarity threshold ($\ge 0.78$), the system MUST return the verified neutral statement:
  * **English:** *"No directly relevant source was found in the current curated knowledge base."*
  * **Arabic:** *"لم يتم العثور على مصدر ذي صلة مباشرة في قاعدة المعرفة المعتمدة الحالية."*

---

## 9. URL Routing & Backward-Compatibility Strategy

```
                          ┌─────────────────────────────┐
                          │ Incoming Client Request     │
                          └──────────────┬──────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
      ┌─────────────────────┐                         ┌─────────────────────┐
      │ Legacy Route:       │                         │ Canonical Route:    │
      │ /schools            │                         │ /directory,         │
      │ /schools/[slug]     │                         │ /services,          │
      │                     │                         │ /services/[slug]    │
      └──────────┬──────────┘                         └──────────┬──────────┘
                 │                                               │
                 │ Rewrite / Proxy                               │ Direct
                 ▼                                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ CANONICAL PAGE COMPONENT: app/[locale]/(public)/directory/page.tsx          │
│ CANONICAL SLUG COMPONENT: app/[locale]/(public)/services/[slug]/page.tsx   │
│ (Reads entity with sector, loads dynamic metadata, runs sector-aware BARS)  │
└─────────────────────────────────────────────────────────────────────────────┘
```

1. **Legacy Directory:** `/schools` rewrites internally to `/directory?sector=EDUCATION_SCHOOLS`.
2. **Legacy Profile:** `/schools/[slug]` rewrites internally to `/services/[slug]`.
3. **Canonical Unified Directory:** `/directory` and `/services` render a unified Egyptian search interface with sector filter pills (المدارس، الجامعات، الخدمات الحكومية، الشركات، المنشآت الطبية).
4. **Canonical Entity Service:** `lib/services/entities.ts` exports `getEntityBySlug(slug: string)` and aliases `getSchoolBySlug(slug: string)` for full backward compatibility.

---

## 10. Public Metrics: Sector-Calibrated BARS & Benchmarks

The Bayesian Adjusted Resolution Score ($BARS$) must NOT rank entities across disparate sectors. A public hospital handling emergency trauma cannot be statistically compared to an e-commerce company delivering packages.

### Calibrated Sector Priors
$$BARS = \frac{n}{n + m} \cdot \bar{R} + \frac{m}{n + m} \cdot \mu_{sector}$$

| Sector | Empirical Prior $\mu_{sector}$ | Min Credibility Volume $m$ | Rationale |
| :--- | :---: | :---: | :--- |
| `EDUCATION_SCHOOLS` | 3.60 | 10 | Standard pre-university baseline |
| `HIGHER_EDUCATION` | 3.40 | 12 | Semester-based student volume |
| `GOVERNMENT_PUBLIC` | 3.00 | 20 | High-volume transactional public services |
| `COMMERCIAL_COMPANIES` | 3.20 | 15 | Egyptian commercial consumer benchmark |
| `HEALTHCARE_MEDICAL` | 3.80 | 10 | Clinical care & patient service expectations |

* **Governorate Threshold:** Entities require a minimum number of sector peers within the governorate to unlock relative rank percentiles, preventing misleading single-entity rankings.

---

## 11. Migration & Verification Roadmap

### Step 1: Additive Migration Execution
* Deploy `20260921000001_generic_entity_sector_patch.sql`.
* Zero data mutation or column drops on existing Slice 0 tables.

### Step 2: Regenerate & Extend TypeScript Types
* Update `types/database.ts`:
  * Add `SectorEnum`, `SectorType`.
  * Extend `Institution` interface with `sector: SectorType` and `sector_metadata: Record<string, unknown>`.
  * Extend `CaseSensitiveData` with `sensitive_identifiers_encrypted?: Record<string, unknown> | null`.
  * Add `Entity` type alias (`export type Entity = Institution;`).

### Step 3: Backward Compatibility Verification
* Run existing 17 test suites (105 tests) completely unchanged:
  ```bash
  npm test
  ```
* Verify that 100% of existing tests pass without modification.

### Step 4: Add New Sector Verification Test Suites
* `tests/unit/sector-taxonomy.test.ts`: Validates complete category/subcategory mapping for all 5 sectors.
* `tests/unit/sector-metadata-validation.test.ts`: Verifies strict Zod parsing for each sector metadata schema.
* `tests/unit/sensitive-identifier-isolation.test.ts`: Asserts MRN, Student Code, and Service Ref are isolated in `case_sensitive_data` and never leak into `cases`.
* `tests/integration/sector-aliasing.test.ts`: Verifies that `/schools/[slug]` and `/services/[slug]` route to identical entity data.

---

## 12. Risks & Unresolved Decisions

| # | Topic | Identified Risk | Architectural Decision / Recommendation |
| :--- | :--- | :--- | :--- |
| **R1** | **National ID (الرقم القومي)** | Users might input full 14-digit National IDs into government service fields, exposing high-risk PII. | **Strict rejection:** Regex validator (`/^[23]\d{13}$/`) blocks 14-digit National IDs at intake. Only service ticket numbers (رقم الطلب) are accepted. |
| **R2** | **Medical Privacy** | Medical records and health diagnoses may leak into case summaries. | Sanitize raw description with medical terminology mask; sensitive MRN kept in `case_sensitive_data`; public case summaries strictly redacted. |
| **R3** | **Unverified Egyptian Laws** | Seeding unverified laws across universities, healthcare, or government could lead to false legal citations. | Statutory decrees default to `PENDING_VERIFICATION`. Only decrees signed off by a human reviewer with a valid UUID are returned in RAG retrieval. |
| **R4** | **Legacy Category Enum in DB** | `cases.category` was previously typed as `case_category_enum`. | Migration alters `category` column to `TEXT`. All legacy records remain valid, while new records accept the versioned sector taxonomy keys. |

---

## Approval Gate

Following your approval of this **Generic Entity Architecture Patch**, we will proceed sequentially:
1. Deploy migration `20260921000001_generic_entity_sector_patch.sql`.
2. Update TypeScript types (`types/database.ts`).
3. Add sector metadata validators and taxonomy configs.
4. Verify all 105 existing tests pass unchanged.
5. Implement new unit tests for the generic entity architecture.
