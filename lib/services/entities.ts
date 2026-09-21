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
    name: "الجامعة الألمانية بالقاهرة (GUC)",
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

  // 3. Government & Public Services
  {
    id: "gov-post-001",
    slug: "egypt-post-cairo",
    name: "الهيئة القومية للبريد - منطقة بريد القاهرة",
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

  // 4. Commercial Companies
  {
    id: "com-vodafone-001",
    slug: "vodafone-egypt",
    name: "شركة فودافون مصر للاتصالات (Vodafone Egypt)",
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
    id: "com-we-002",
    slug: "we-telecom-egypt",
    name: "الشركة المصرية للاتصالات (Telecom Egypt - WE)",
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

  // 5. Healthcare & Medical Facilities
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
