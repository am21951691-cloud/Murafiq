// lib/validators/sector-metadata.ts
import { z } from "zod";
import type { SectorType } from "@/types/database";

// 1. Pre-University Schools (التعليم قبل الجامعي)
export const SchoolsMetadataSchema = z.object({
  ministry_code: z.string().min(1),
  educational_stage: z.array(
    z.enum(["KINDERGARTEN", "PRIMARY", "PREPARATORY", "SECONDARY"])
  ),
  curriculum_type: z.enum([
    "NATIONAL_ARABIC",
    "NATIONAL_LANGUAGES",
    "IGCSE",
    "AMERICAN_DIPLOMA",
    "IB",
    "FRENCH_BACCALAUREATE",
    "GERMAN_ABITUR",
    "OTHER",
  ]),
  gender_policy: z.enum(["CO_ED", "BOYS_ONLY", "GIRLS_ONLY"]),
  supervisory_administration: z.string().min(2), // الإدارة التعليمية التابعة لها
});

// 2. Higher Education & Universities (التعليم العالي)
export const HigherEducationMetadataSchema = z.object({
  institution_type: z.enum([
    "PUBLIC_UNIVERSITY", // جامعة حكومية
    "PRIVATE_UNIVERSITY", // جامعة خاصة
    "NATIONAL_AHLIYA_UNIVERSITY", // جامعة أهلية
    "TECHNOLOGICAL_UNIVERSITY", // جامعة تكنولوجية
    "HIGHER_INSTITUTE", // معهد عالي خاص
    "ACADEMY", // أكاديمية معتمدة
  ]),
  supreme_council_accreditation: z.string().min(1), // رقم اعتماد المجلس الأعلى للجامعات
  faculties: z.array(z.string()).min(1), // الكليات والمعاهد المعتمدة
  credit_hour_system: z.boolean().default(true),
});

// 3. Government & Public Services (الخدمات الحكومية والهيئات)
export const GovernmentPublicMetadataSchema = z.object({
  parent_ministry_or_authority: z.string().min(2), // الوزارة أو الهيئة التابع لها
  service_domain: z.enum([
    "CIVIL_REGISTRY", // السجل المدني والأحوال المدنية
    "NOTARY_REAL_ESTATE_REGISTRATION", // الشهر العقاري والتوثيق
    "TRAFFIC_LICENSING", // المرور وتراخيص المركبات
    "TAXATION_CUSTOMS", // الضرائب والجمارك
    "SOCIAL_INSURANCE_PENSIONS", // التأمينات الاجتماعية والمعاشات
    "MUNICIPAL_LOCAL_SERVICES", // الأحياء والمجالس المحلية
    "PUBLIC_UTILITIES_WATER_POWER_GAS", // المرافق العامة (مياه، كهرباء، غاز)
    "COMMUNICATIONS_POST", // البريد والاتصالات الحكومية
  ]),
  digital_platform_code: z.string().optional(), // كود المنظومة على مصر الرقمية
  public_operating_hours: z.string().optional(),
});

// 4. Commercial Companies (الشركات والخدمات التجارية)
export const CommercialCompaniesMetadataSchema = z.object({
  commercial_registration_number: z.string().min(3), // رقم السجل التجاري
  tax_card_number: z.string().min(5), // رقم البطاقة الضريبية
  industry_sector: z.enum([
    "TELECOM_AND_ISP",
    "FINANCIAL_BANKING_FINTECH",
    "RETAIL_AND_ECOMMERCE",
    "TRANSPORTATION_RIDE_HAILING",
    "REAL_ESTATE_DEVELOPMENT",
    "CONSUMER_ELECTRONICS_APPLIANCES",
    "AUTOMOTIVE_SALES_SERVICE",
    "SUBSCRIPTION_SERVICES",
  ]),
  cpa_registered: z.boolean().default(false), // مقيد بسجل جهاز حماية المستهلك
});

// 5. Healthcare & Medical Facilities (المنشآت الطبية)
export const HealthcareMedicalMetadataSchema = z.object({
  facility_tier: z.enum([
    "PUBLIC_HOSPITAL_MOH", // مستشفى حكومي تابع لوزارة الصحة
    "UNIVERSITY_HOSPITAL", // مستشفى جامعي
    "UNIVERSAL_HEALTH_INSURANCE", // منشأة تابعة لمنظومة التأمين الصحي الشامل
    "PRIVATE_HOSPITAL", // مستشفى خاص
    "SPECIALIZED_MEDICAL_CENTER", // مركز طبي تخصصي
    "DIAGNOSTIC_IMAGING_LAB", // معمل تحاليل / مركز أشعة
    "PRIMARY_CARE_CLINIC", // عيادة أو وحدة طب أسرة
  ]),
  licensing_authority: z.enum(["MINISTRY_OF_HEALTH", "GAHAR", "DOCTORS_SYNDICATE"]),
  facility_license_number: z.string().min(1),
  emergency_department_active: z.boolean().default(false),
});

export type SchoolsMetadata = z.infer<typeof SchoolsMetadataSchema>;
export type HigherEducationMetadata = z.infer<typeof HigherEducationMetadataSchema>;
export type GovernmentPublicMetadata = z.infer<typeof GovernmentPublicMetadataSchema>;
export type CommercialCompaniesMetadata = z.infer<typeof CommercialCompaniesMetadataSchema>;
export type HealthcareMedicalMetadata = z.infer<typeof HealthcareMedicalMetadataSchema>;

export const SectorMetadataSchemas = {
  EDUCATION_SCHOOLS: SchoolsMetadataSchema,
  HIGHER_EDUCATION: HigherEducationMetadataSchema,
  GOVERNMENT_PUBLIC: GovernmentPublicMetadataSchema,
  COMMERCIAL_COMPANIES: CommercialCompaniesMetadataSchema,
  HEALTHCARE_MEDICAL: HealthcareMedicalMetadataSchema,
} as const;

export function validateSectorMetadata(sector: SectorType, metadata: unknown) {
  const schema = SectorMetadataSchemas[sector];
  if (!schema) {
    throw new Error(`Unknown sector: ${sector}`);
  }
  return schema.safeParse(metadata);
}
