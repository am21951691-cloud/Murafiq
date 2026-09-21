import type { SectorType } from "@/types/database";
import {
  calculateBARS,
  checkGovernorateThreshold,
  type SchoolBenchmarkMetrics,
  type GovernorateThresholdResult,
} from "./benchmarks";
import { SAMPLE_SCHOOLS, type PublicCaseSummary } from "./schools";

export interface PublicEntitySummary {
  id: string;
  slug: string;
  name: string;
  governorate: string;
  sector: SectorType;
  type: string;
  metrics: SchoolBenchmarkMetrics;
}

export interface EntityProfileData {
  id: string;
  slug: string;
  name: string;
  governorate: string;
  sector: SectorType;
  type: string;
  sectorMetadata?: Record<string, unknown>;
  metrics: SchoolBenchmarkMetrics;
  publicCases: PublicCaseSummary[];
  thresholdInfo: GovernorateThresholdResult;
}

export interface SampleEntityRecord {
  id: string;
  slug: string;
  name: string;
  governorate: string;
  sector: SectorType;
  type: string;
  ratings: number[];
  ucrr: number;
  medianResponseDays: number;
  sectorMetadata?: Record<string, unknown>;
}

// Multi-sector Sample Entities across all 5 Egyptian Sectors
export const SAMPLE_ENTITIES: SampleEntityRecord[] = [
  // 1. Pre-University Schools (mapped from SAMPLE_SCHOOLS)
  ...SAMPLE_SCHOOLS.map((s) => ({
    ...s,
    sector: "EDUCATION_SCHOOLS" as SectorType,
  })),

  // 2. Higher Education & Universities
  // 2. Higher Education & Universities
  // Cairo
  {
    id: "uni-cairo-001",
    slug: "cairo-university",
    name: "جامعة القاهرة (Cairo University)",
    governorate: "الجيزة",
    sector: "HIGHER_EDUCATION",
    type: "جامعة حكومية",
    ratings: [4, 4, 3, 5, 4, 4, 5, 4, 4, 3, 4],
    ucrr: 89,
    medianResponseDays: 3.2,
    sectorMetadata: {
      institution_type: "PUBLIC_UNIVERSITY",
      supreme_council_accreditation: "SCU-1908-01",
      faculties: ["Engineering", "Medicine", "Computers and Artificial Intelligence"],
      credit_hour_system: true,
    },
  },
  {
    id: "uni-guc-002",
    slug: "german-university-in-cairo",
    name: "الجامعة الألمانية بالقاهرة (GUC - القاهرة الجديدة)",
    governorate: "القاهرة",
    sector: "HIGHER_EDUCATION",
    type: "جامعة خاصة وأهلية",
    ratings: [5, 4, 5, 4, 5, 5, 4, 5, 4],
    ucrr: 93,
    medianResponseDays: 2.0,
    sectorMetadata: {
      institution_type: "PRIVATE_UNIVERSITY",
      supreme_council_accreditation: "SCU-2002-27",
      faculties: ["Information Engineering & Technology", "Management Technology"],
      credit_hour_system: true,
    },
  },
  {
    id: "uni-ainshams-003",
    slug: "ain-shams-university",
    name: "جامعة عين شمس (Ain Shams University - العباسية)",
    governorate: "القاهرة",
    sector: "HIGHER_EDUCATION",
    type: "جامعة حكومية",
    ratings: [4, 4, 4, 3, 4, 5, 4, 4],
    ucrr: 87,
    medianResponseDays: 3.0,
    sectorMetadata: {
      institution_type: "PUBLIC_UNIVERSITY",
      supreme_council_accreditation: "SCU-1950-03",
      faculties: ["Medicine", "Engineering", "Commerce", "Law"],
      credit_hour_system: true,
    },
  },
  {
    id: "uni-auc-004",
    slug: "american-university-in-cairo",
    name: "الجامعة الأمريكية بالقاهرة (AUC - التجمع الخامس)",
    governorate: "القاهرة",
    sector: "HIGHER_EDUCATION",
    type: "جامعة خاصة معتمدة دولياً",
    ratings: [5, 5, 4, 5, 5, 4, 5, 5],
    ucrr: 96,
    medianResponseDays: 1.6,
    sectorMetadata: {
      institution_type: "PRIVATE_UNIVERSITY",
      supreme_council_accreditation: "SCU-1919-01",
      credit_hour_system: true,
    },
  },
  // Giza
  {
    id: "uni-october-005",
    slug: "october-6-university",
    name: "جامعة 6 أكتوبر (October 6 University - الجيزة)",
    governorate: "الجيزة",
    sector: "HIGHER_EDUCATION",
    type: "جامعة خاصة",
    ratings: [4, 3, 4, 4, 4, 3, 4, 4],
    ucrr: 84,
    medianResponseDays: 3.4,
    sectorMetadata: {
      institution_type: "PRIVATE_UNIVERSITY",
      supreme_council_accreditation: "SCU-1996-01",
      credit_hour_system: true,
    },
  },
  {
    id: "uni-must-006",
    slug: "misr-university-science-technology",
    name: "جامعة مصر للعلوم والتكنولوجيا (MUST - 6 أكتوبر)",
    governorate: "الجيزة",
    sector: "HIGHER_EDUCATION",
    type: "جامعة خاصة",
    ratings: [4, 4, 4, 5, 4, 4, 5],
    ucrr: 88,
    medianResponseDays: 2.8,
    sectorMetadata: {
      institution_type: "PRIVATE_UNIVERSITY",
      supreme_council_accreditation: "SCU-1996-02",
      credit_hour_system: true,
    },
  },
  {
    id: "uni-nile-007",
    slug: "nile-university-zayed",
    name: "جامعة النيل الأهلية (Nile University - الشيخ زايد)",
    governorate: "الجيزة",
    sector: "HIGHER_EDUCATION",
    type: "جامعة أهلية وبحثية",
    ratings: [5, 5, 4, 5, 4, 5, 5],
    ucrr: 94,
    medianResponseDays: 1.8,
    sectorMetadata: {
      institution_type: "NATIONAL_UNIVERSITY",
      supreme_council_accreditation: "SCU-2006-01",
      credit_hour_system: true,
    },
  },
  // Alexandria
  {
    id: "uni-alex-008",
    slug: "alexandria-university",
    name: "جامعة الإسكندرية (Alexandria University - الشاطبي)",
    governorate: "الإسكندرية",
    sector: "HIGHER_EDUCATION",
    type: "جامعة حكومية",
    ratings: [4, 5, 4, 4, 3, 4, 5, 4, 4],
    ucrr: 89,
    medianResponseDays: 2.9,
    sectorMetadata: {
      institution_type: "PUBLIC_UNIVERSITY",
      supreme_council_accreditation: "SCU-1942-02",
      faculties: ["Medicine", "Engineering", "Science", "Arts"],
      credit_hour_system: true,
    },
  },
  {
    id: "uni-aast-009",
    slug: "aastmt-alexandria",
    name: "الأكاديمية العربية للعلوم والتكنولوجيا والنقل البحري (AASTMT - أبو قير)",
    governorate: "الإسكندرية",
    sector: "HIGHER_EDUCATION",
    type: "منظمة ومنشأة جامعية دولية",
    ratings: [5, 4, 5, 5, 4, 5, 5, 4],
    ucrr: 95,
    medianResponseDays: 1.7,
    sectorMetadata: {
      institution_type: "REGIONAL_ORGANIZATION",
      supreme_council_accreditation: "SCU-1972-01",
      credit_hour_system: true,
    },
  },
  {
    id: "uni-pharos-010",
    slug: "pharos-university-alexandria",
    name: "جامعة فاروس بالإسكندرية (PUA - سموحة)",
    governorate: "الإسكندرية",
    sector: "HIGHER_EDUCATION",
    type: "جامعة خاصة",
    ratings: [4, 4, 4, 4, 5, 4, 3],
    ucrr: 86,
    medianResponseDays: 3.1,
    sectorMetadata: {
      institution_type: "PRIVATE_UNIVERSITY",
      supreme_council_accreditation: "SCU-2006-12",
      credit_hour_system: true,
    },
  },

  // 3. Government & Public Services
  // Cairo
  {
    id: "gov-post-001",
    slug: "egypt-post-cairo",
    name: "الهيئة القومية للبريد - مكتب بريد العتبة الرئيسي",
    governorate: "القاهرة",
    sector: "GOVERNMENT_PUBLIC",
    type: "هيئة قومية وخدمات بريدية",
    ratings: [4, 3, 4, 4, 3, 4, 4, 5, 4, 3, 4, 4],
    ucrr: 86,
    medianResponseDays: 2.8,
    sectorMetadata: {
      parent_ministry_or_authority: "وزارة الاتصالات وتكنولوجيا المعلومات",
      service_domain: "COMMUNICATIONS_POST",
      digital_platform_code: "EGYPOST-CAIRO-01",
    },
  },
  {
    id: "gov-notary-002",
    slug: "real-estate-notary-nasr-city",
    name: "مكتب الشهر العقاري والتوثيق - مدينة نصر المميكن",
    governorate: "القاهرة",
    sector: "GOVERNMENT_PUBLIC",
    type: "توثيق وشهر عقاري",
    ratings: [3, 4, 4, 3, 4, 3, 4, 4, 3],
    ucrr: 81,
    medianResponseDays: 3.9,
    sectorMetadata: {
      parent_ministry_or_authority: "وزارة العدل - مصلحة الشهر العقاري والتوثيق",
      service_domain: "NOTARY_REAL_ESTATE_REGISTRATION",
      digital_platform_code: "JUSTICE-NOTARY-NC02",
    },
  },
  {
    id: "gov-passports-003",
    slug: "passports-immigration-abbassia",
    name: "مصلحة الجوازات والهجرة والجنسية - المقر الرئيسي بالعباسية",
    governorate: "القاهرة",
    sector: "GOVERNMENT_PUBLIC",
    type: "إدارة وثائق وخدمات عامة",
    ratings: [4, 4, 3, 4, 4, 5, 4],
    ucrr: 88,
    medianResponseDays: 2.5,
    sectorMetadata: {
      parent_ministry_or_authority: "وزارة الداخلية - قطاع الوثائق",
      service_domain: "CIVIL_PASSPORTS",
      digital_platform_code: "MOI-PASS-AB01",
    },
  },
  // Giza
  {
    id: "gov-traffic-giza-004",
    slug: "giza-traffic-department-faisal",
    name: "الإدارة العامة لمرور الجيزة - وحدة مرور فيصل وبين السرايات",
    governorate: "الجيزة",
    sector: "GOVERNMENT_PUBLIC",
    type: "وحدة تراخيص ومرور حكومية",
    ratings: [3, 4, 3, 4, 3, 4, 4],
    ucrr: 82,
    medianResponseDays: 3.6,
    sectorMetadata: {
      parent_ministry_or_authority: "وزارة الداخلية - قطاع المرور والحماية المدنية",
      service_domain: "TRAFFIC_LICENSING",
      digital_platform_code: "TRAFFIC-GIZA-01",
    },
  },
  {
    id: "gov-notary-dokki-005",
    slug: "real-estate-notary-dokki",
    name: "مكتب توثيق الشهر العقاري المطور - الدقي",
    governorate: "الجيزة",
    sector: "GOVERNMENT_PUBLIC",
    type: "توثيق وشهر عقاري مطور",
    ratings: [4, 4, 4, 3, 5, 4],
    ucrr: 87,
    medianResponseDays: 2.6,
    sectorMetadata: {
      parent_ministry_or_authority: "وزارة العدل",
      service_domain: "NOTARY_REAL_ESTATE_REGISTRATION",
      digital_platform_code: "JUSTICE-NOTARY-DOK01",
    },
  },
  // Alexandria
  {
    id: "gov-post-alex-006",
    slug: "egypt-post-alexandria-station",
    name: "منطقة بريد الإسكندرية - مكتب بريد محطة مصر الرئيسي",
    governorate: "الإسكندرية",
    sector: "GOVERNMENT_PUBLIC",
    type: "هيئة قومية وخدمات بريدية",
    ratings: [4, 4, 3, 4, 4, 4, 5],
    ucrr: 88,
    medianResponseDays: 2.7,
    sectorMetadata: {
      parent_ministry_or_authority: "وزارة الاتصالات وتكنولوجيا المعلومات",
      service_domain: "COMMUNICATIONS_POST",
      digital_platform_code: "EGYPOST-ALEX-01",
    },
  },
  {
    id: "gov-notary-smouha-007",
    slug: "real-estate-notary-smouha",
    name: "مكتب توثيق الشهر العقاري النموذجي - سموحة",
    governorate: "الإسكندرية",
    sector: "GOVERNMENT_PUBLIC",
    type: "توثيق وشهر عقاري",
    ratings: [4, 4, 4, 4, 3, 4, 4],
    ucrr: 85,
    medianResponseDays: 3.0,
    sectorMetadata: {
      parent_ministry_or_authority: "وزارة العدل",
      service_domain: "NOTARY_REAL_ESTATE_REGISTRATION",
      digital_platform_code: "JUSTICE-NOTARY-SMH01",
    },
  },

  // 4. Commercial Companies & Telecom
  // Giza
  {
    id: "com-vodafone-001",
    slug: "vodafone-egypt",
    name: "شركة فودافون مصر للاتصالات (Vodafone Egypt - القرية الذكية والجيزة)",
    governorate: "الجيزة",
    sector: "COMMERCIAL_COMPANIES",
    type: "اتصالات وإنترنت منزلي",
    ratings: [4, 4, 3, 4, 4, 3, 4, 5, 4, 4, 3, 4, 5],
    ucrr: 91,
    medianResponseDays: 1.9,
    sectorMetadata: {
      commercial_registration_number: "CR-928172-GIZA",
      tax_card_number: "TC-200-192-811",
      industry_sector: "TELECOM_AND_ISP",
      cpa_registered: true,
    },
  },
  {
    id: "com-orange-002",
    slug: "orange-egypt-smart-village",
    name: "شركة أورنج مصر للاتصالات (Orange Egypt - القرية الذكية)",
    governorate: "الجيزة",
    sector: "COMMERCIAL_COMPANIES",
    type: "اتصالات وإنترنت وخدمات رقمية",
    ratings: [4, 3, 4, 4, 4, 4, 3, 5],
    ucrr: 87,
    medianResponseDays: 2.4,
    sectorMetadata: {
      commercial_registration_number: "CR-61241-GIZA",
      tax_card_number: "TC-100-302-891",
      industry_sector: "TELECOM_AND_ISP",
      cpa_registered: true,
    },
  },
  // Cairo
  {
    id: "com-we-003",
    slug: "we-telecom-egypt",
    name: "الشركة المصرية للاتصالات (Telecom Egypt - WE - سنترال رمسيس)",
    governorate: "القاهرة",
    sector: "COMMERCIAL_COMPANIES",
    type: "اتصالات وخدمات رقمية",
    ratings: [3, 4, 3, 4, 3, 4, 4, 3, 4, 4],
    ucrr: 84,
    medianResponseDays: 3.1,
    sectorMetadata: {
      commercial_registration_number: "CR-10492-CAIRO",
      tax_card_number: "TC-100-482-192",
      industry_sector: "TELECOM_AND_ISP",
      cpa_registered: true,
    },
  },
  {
    id: "com-nbe-004",
    slug: "national-bank-of-egypt-cairo",
    name: "البنك الأهلي المصري (NBE - الفرع الرئيسي كورنيش النيل)",
    governorate: "القاهرة",
    sector: "COMMERCIAL_COMPANIES",
    type: "خدمات مصرفية وبنكية",
    ratings: [4, 4, 4, 5, 4, 4, 4, 5, 4],
    ucrr: 90,
    medianResponseDays: 2.1,
    sectorMetadata: {
      commercial_registration_number: "CR-1898-CAIRO",
      tax_card_number: "TC-100-111-222",
      industry_sector: "BANKING_AND_FINANCE",
      cpa_registered: true,
    },
  },
  {
    id: "com-misr-bank-005",
    slug: "banque-misr-talaat-harb",
    name: "بنك مصر (Banque Misr - الفرع الرئيسي طلعت حرب)",
    governorate: "القاهرة",
    sector: "COMMERCIAL_COMPANIES",
    type: "خدمات مصرفية وبنكية",
    ratings: [4, 3, 4, 4, 3, 4, 5, 4],
    ucrr: 86,
    medianResponseDays: 2.8,
    sectorMetadata: {
      commercial_registration_number: "CR-1920-CAIRO",
      tax_card_number: "TC-100-222-333",
      industry_sector: "BANKING_AND_FINANCE",
      cpa_registered: true,
    },
  },
  // Alexandria
  {
    id: "com-we-alex-006",
    slug: "we-telecom-alex-mostafa-kamel",
    name: "الشركة المصرية للاتصالات WE (سنترال مصطفى كامل - الإسكندرية)",
    governorate: "الإسكندرية",
    sector: "COMMERCIAL_COMPANIES",
    type: "اتصالات وإنترنت أرضي وفايبر",
    ratings: [4, 4, 3, 4, 4, 4, 3],
    ucrr: 85,
    medianResponseDays: 2.9,
    sectorMetadata: {
      commercial_registration_number: "CR-10492-ALEX",
      industry_sector: "TELECOM_AND_ISP",
      cpa_registered: true,
    },
  },
  {
    id: "com-nbe-alex-007",
    slug: "national-bank-egypt-shatby-alex",
    name: "البنك الأهلي المصري (فرع الشاطبي ومحطة الرمل - الإسكندرية)",
    governorate: "الإسكندرية",
    sector: "COMMERCIAL_COMPANIES",
    type: "خدمات مصرفية وبنكية",
    ratings: [4, 5, 4, 4, 5, 4],
    ucrr: 92,
    medianResponseDays: 2.0,
    sectorMetadata: {
      commercial_registration_number: "CR-1898-ALEX",
      industry_sector: "BANKING_AND_FINANCE",
      cpa_registered: true,
    },
  },

  // 5. Healthcare & Medical Facilities
  // Cairo
  {
    id: "med-salam-001",
    slug: "as-salam-international-hospital",
    name: "مستشفى السلام الدولي بالمعادي (As-Salam International Hospital)",
    governorate: "القاهرة",
    sector: "HEALTHCARE_MEDICAL",
    type: "مستشفى خاص معتمد",
    ratings: [5, 4, 5, 5, 4, 5, 4, 5, 5, 4, 5],
    ucrr: 95,
    medianResponseDays: 1.5,
    sectorMetadata: {
      facility_tier: "PRIVATE_HOSPITAL",
      licensing_authority: "GAHAR",
      facility_license_number: "MOH-HOSP-2018-842",
      emergency_department_active: true,
    },
  },
  {
    id: "med-cleo-002",
    slug: "cleopatra-hospital-heliopolis",
    name: "مستشفى كليوباترا - مصر الجديدة",
    governorate: "القاهرة",
    sector: "HEALTHCARE_MEDICAL",
    type: "مستشفى تخصصي ورعاية مركزة",
    ratings: [4, 4, 5, 4, 4, 5, 4, 4],
    ucrr: 90,
    medianResponseDays: 2.2,
    sectorMetadata: {
      facility_tier: "PRIVATE_HOSPITAL",
      licensing_authority: "MINISTRY_OF_HEALTH",
      facility_license_number: "MOH-HOSP-1994-312",
      emergency_department_active: true,
    },
  },
  {
    id: "med-kasr-003",
    slug: "kasr-alainy-french-hospital",
    name: "مستشفى قصر العيني التعليمي الجديد (الفرنساوي - القاهرة)",
    governorate: "القاهرة",
    sector: "HEALTHCARE_MEDICAL",
    type: "مستشفى جامعي وتعليمي تخصصي",
    ratings: [4, 4, 3, 5, 4, 4, 5, 4],
    ucrr: 88,
    medianResponseDays: 2.6,
    sectorMetadata: {
      facility_tier: "TEACHING_HOSPITAL",
      licensing_authority: "CAIRO_UNIVERSITY_HOSPITALS",
      emergency_department_active: true,
    },
  },
  {
    id: "med-57357-004",
    slug: "children-cancer-hospital-57357",
    name: "مستشفى 57357 لعلاج سرطان الأطفال (السيدة زينب)",
    governorate: "القاهرة",
    sector: "HEALTHCARE_MEDICAL",
    type: "مستشفى خيري وتخصصي متقدم",
    ratings: [5, 5, 5, 5, 4, 5, 5, 5],
    ucrr: 98,
    medianResponseDays: 1.2,
    sectorMetadata: {
      facility_tier: "SPECIALIZED_CANCER_CENTER",
      licensing_authority: "GAHAR",
      emergency_department_active: true,
    },
  },
  // Giza
  {
    id: "med-dar-fouad-005",
    slug: "dar-alfouad-hospital-october",
    name: "مستشفى دار الفؤاد - 6 أكتوبر (Dar Al Fouad Hospital)",
    governorate: "الجيزة",
    sector: "HEALTHCARE_MEDICAL",
    type: "مستشفى تخصصي ورعاية مركزة وجراحات دقيقة",
    ratings: [5, 4, 5, 5, 4, 5, 5, 4],
    ucrr: 94,
    medianResponseDays: 1.8,
    sectorMetadata: {
      facility_tier: "PRIVATE_HOSPITAL",
      licensing_authority: "GAHAR",
      emergency_department_active: true,
    },
  },
  {
    id: "med-zayed-006",
    slug: "sheikh-zayed-specialized-hospital",
    name: "مستشفى الشيخ زايد التخصصي (الجيزة)",
    governorate: "الجيزة",
    sector: "HEALTHCARE_MEDICAL",
    type: "مستشفى مراكز طبية متخصصة",
    ratings: [4, 4, 3, 4, 4, 4, 5],
    ucrr: 87,
    medianResponseDays: 2.7,
    sectorMetadata: {
      facility_tier: "SPECIALIZED_CENTER",
      licensing_authority: "MINISTRY_OF_HEALTH",
      emergency_department_active: true,
    },
  },
  {
    id: "med-baheya-007",
    slug: "baheya-hospital-sheikh-zayed",
    name: "مستشفى بهية للكشف المبكر وعلاج أورام السيدات (الشيخ زايد)",
    governorate: "الجيزة",
    sector: "HEALTHCARE_MEDICAL",
    type: "مؤسسة ومستشفى خيري تخصصي",
    ratings: [5, 5, 4, 5, 5, 5, 4],
    ucrr: 97,
    medianResponseDays: 1.4,
    sectorMetadata: {
      facility_tier: "SPECIALIZED_CENTER",
      licensing_authority: "GAHAR",
      emergency_department_active: false,
    },
  },
  // Alexandria
  {
    id: "med-miri-008",
    slug: "alexandria-main-university-hospital",
    name: "المستشفى الجامعي الرئيسي (الميري - محطة الرمل بالإسكندرية)",
    governorate: "الإسكندرية",
    sector: "HEALTHCARE_MEDICAL",
    type: "مستشفى جامعي وطوارئ",
    ratings: [4, 3, 4, 4, 3, 4, 4, 4],
    ucrr: 83,
    medianResponseDays: 3.3,
    sectorMetadata: {
      facility_tier: "TEACHING_HOSPITAL",
      licensing_authority: "ALEXANDRIA_UNIVERSITY_HOSPITALS",
      emergency_department_active: true,
    },
  },
  {
    id: "med-andalusia-009",
    slug: "andalusia-hospital-smouha",
    name: "مستشفى أندلسية سموحة (Andalusia Hospital Smouha)",
    governorate: "الإسكندرية",
    sector: "HEALTHCARE_MEDICAL",
    type: "مستشفى خاص معتمد",
    ratings: [5, 4, 5, 4, 5, 4, 5, 4],
    ucrr: 92,
    medianResponseDays: 2.0,
    sectorMetadata: {
      facility_tier: "PRIVATE_HOSPITAL",
      licensing_authority: "GAHAR",
      emergency_department_active: true,
    },
  },
  {
    id: "med-asafra-010",
    slug: "mabaret-alasafra-hospital",
    name: "مستشفى مبرة العصافرة - الإسكندرية",
    governorate: "الإسكندرية",
    sector: "HEALTHCARE_MEDICAL",
    type: "مستشفى خاص وتخصصي",
    ratings: [4, 4, 4, 4, 3, 4, 5],
    ucrr: 89,
    medianResponseDays: 2.5,
    sectorMetadata: {
      facility_tier: "PRIVATE_HOSPITAL",
      licensing_authority: "MINISTRY_OF_HEALTH",
      emergency_department_active: true,
    },
  },
];

export async function getPublicEntities(filters?: {
  governorate?: string;
  sector?: SectorType;
  search?: string;
}): Promise<PublicEntitySummary[]> {
  let list = SAMPLE_ENTITIES;

  if (filters?.sector) {
    list = list.filter((e) => e.sector === filters.sector);
  }

  if (filters?.governorate && filters.governorate !== "ALL") {
    list = list.filter((e) => e.governorate === filters.governorate);
  }

  if (filters?.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    list = list.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.slug.toLowerCase().includes(q) ||
        e.type.toLowerCase().includes(q)
    );
  }

  return list.map((entity) => {
    const bars = calculateBARS({ ratings: entity.ratings, sector: entity.sector });
    return {
      id: entity.id,
      slug: entity.slug,
      name: entity.name,
      governorate: entity.governorate,
      sector: entity.sector,
      type: entity.type,
      metrics: {
        institutionId: entity.id,
        institutionName: entity.name,
        governorate: entity.governorate,
        bars,
        userConfirmedResolutionRate: entity.ucrr,
        medianResponseDays: entity.medianResponseDays,
        totalCases12Months: entity.ratings.length,
        sampleSizeContext: `بناءً على ${bars.sampleSize} حالة مغلقة ومقيمة خلال 12 شهراً`,
      },
    };
  });
}

export async function getEntityBySlug(slug: string): Promise<EntityProfileData | null> {
  const entity = SAMPLE_ENTITIES.find((e) => e.slug === slug);
  if (!entity) return null;

  const thresholdInfo = checkGovernorateThreshold(
    entity.governorate,
    SAMPLE_ENTITIES.filter(
      (e) => e.governorate === entity.governorate && e.sector === entity.sector
    ).length
  );

  const bars = calculateBARS({ ratings: entity.ratings, sector: entity.sector });

  const samplePublicCases: PublicCaseSummary[] = [
    {
      id: "case-pub-gen-001",
      referenceNumber: "MRF-2026-1049",
      category: "SERVICE_QUALITY",
      sanitizedDescription:
        "شكوى رسمية بخصوص تأخر تقديم الخدمة وتوضيح الاشتراطات المقررة لمقدم الطلب.",
      desiredOutcome: "استكمال المعاملة وفق المدة القانونية المقررة وتوضيح الإجراءات",
      officialStatement:
        "تم التواصل مع المواطن المستفيد وإنهاء المعاملة وتحديث الإجراءات التشغيلية لضمان عدم التكرار.",
      rqsScore: 94,
      rExp: 3,
      rResp: 5,
      rRes: 5,
      closingFeedback: "تم حل المشكلة بمهنية وسرعة بعد التصعيد عبر المنصة، شكراً لكم.",
      closedAt: "2026-09-18",
      visibility: "PUBLIC",
    },
  ];

  return {
    id: entity.id,
    slug: entity.slug,
    name: entity.name,
    governorate: entity.governorate,
    sector: entity.sector,
    type: entity.type,
    sectorMetadata: entity.sectorMetadata,
    metrics: {
      institutionId: entity.id,
      institutionName: entity.name,
      governorate: entity.governorate,
      bars,
      userConfirmedResolutionRate: entity.ucrr,
      medianResponseDays: entity.medianResponseDays,
      totalCases12Months: entity.ratings.length,
      sampleSizeContext: `بناءً على ${bars.sampleSize} حالة مغلقة ومقيمة خلال 12 شهراً`,
    },
    publicCases: samplePublicCases,
    thresholdInfo,
  };
}

// Backward compatibility alias for pre-existing school service callers
export const getSchoolBySlug = getEntityBySlug;
