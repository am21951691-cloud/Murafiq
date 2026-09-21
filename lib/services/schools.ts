import {
  calculateBARS,
  checkGovernorateThreshold,
  isCaseSafeForPublicDisplay,
  type SchoolBenchmarkMetrics,
  type GovernorateThresholdResult,
} from "./benchmarks";
import { createClient } from "../supabase/server";

export interface PublicSchoolSummary {
  id: string;
  slug: string;
  name: string;
  governorate: string;
  type: string;
  metrics: SchoolBenchmarkMetrics;
}

export interface PublicCaseSummary {
  id: string;
  referenceNumber: string;
  category: string;
  sanitizedDescription: string;
  desiredOutcome: string | null;
  officialStatement: string | null;
  rqsScore: number | null;
  rExp: number | null;
  rResp: number | null;
  rRes: number | null;
  closingFeedback: string | null;
  closedAt: string;
  visibility: "PUBLIC" | "ANONYMOUS_PUBLIC";
}

export interface SchoolProfileData {
  id: string;
  slug: string;
  name: string;
  governorate: string;
  type: string;
  metrics: SchoolBenchmarkMetrics;
  publicCases: PublicCaseSummary[];
  thresholdInfo: GovernorateThresholdResult;
}

// Canonical Sample Schools Dataset for Egyptian Pre-University Education
export const SAMPLE_SCHOOLS: Array<{
  id: string;
  slug: string;
  name: string;
  governorate: string;
  type: string;
  ratings: number[];
  ucrr: number;
  medianResponseDays: number;
}> = [
  // Cairo (10 schools -> meets governorate threshold >= 10)
  {
    id: "sch-cairo-001",
    slug: "st-george-language-school",
    name: "مدرسة سان جورج للغات (St. George Language School)",
    governorate: "القاهرة",
    type: "خاص لغات",
    ratings: [5, 4, 5, 5, 4, 5, 4, 5, 4, 5, 5, 4],
    ucrr: 94,
    medianResponseDays: 2.1,
  },
  {
    id: "sch-cairo-002",
    slug: "al-amal-experimental-school",
    name: "مدرسة الأمل الرسمية المتميزة للغات",
    governorate: "القاهرة",
    type: "رسمي لغات",
    ratings: [4, 4, 3, 5, 4, 4, 5, 4],
    ucrr: 88,
    medianResponseDays: 3.5,
  },
  {
    id: "sch-cairo-003",
    slug: "new-cairo-british-school",
    name: "مدرسة القاهرة الجديدة البريطانية الحديثة",
    governorate: "القاهرة",
    type: "دولي (IGCSE)",
    ratings: [5, 5, 4, 5, 5, 5, 4, 5, 5, 5, 4, 5, 5, 4, 5],
    ucrr: 96,
    medianResponseDays: 1.8,
  },
  {
    id: "sch-cairo-004",
    slug: "heliopolis-pioneer-school",
    name: "مدرسة الرواد بمصر الجديدة",
    governorate: "القاهرة",
    type: "خاص عربي",
    ratings: [3, 4, 3, 4, 3, 4],
    ucrr: 80,
    medianResponseDays: 4.2,
  },
  {
    id: "sch-cairo-005",
    slug: "future-leaders-international",
    name: "مدرسة قادة المستقبل الدولية",
    governorate: "القاهرة",
    type: "دولي (American)",
    ratings: [4, 5, 4, 4, 5, 4, 5],
    ucrr: 91,
    medianResponseDays: 2.4,
  },
  {
    id: "sch-cairo-006",
    slug: "al-shorouk-language-school",
    name: "مدرسة الشروق للغات",
    governorate: "القاهرة",
    type: "خاص لغات",
    ratings: [4, 4, 4, 3, 4, 5],
    ucrr: 85,
    medianResponseDays: 3.1,
  },
  {
    id: "sch-cairo-007",
    slug: "el-nasr-boys-school-cairo",
    name: "مدرسة النصر للبنين بالمعادي",
    governorate: "القاهرة",
    type: "قومية",
    ratings: [3, 4, 4, 3, 4],
    ucrr: 82,
    medianResponseDays: 4.0,
  },
  {
    id: "sch-cairo-008",
    slug: "manarat-al-qahira-school",
    name: "مدرسة منارات القاهرة للغات",
    governorate: "القاهرة",
    type: "خاص لغات",
    ratings: [4, 5, 4, 5, 4, 4, 5],
    ucrr: 89,
    medianResponseDays: 2.8,
  },
  {
    id: "sch-cairo-009",
    slug: "tajamoa-stem-school",
    name: "مدرسة المتفوقين للعلوم والتكنولوجيا بالقاهرة",
    governorate: "القاهرة",
    type: "رسمي STEM",
    ratings: [5, 5, 5, 4, 5, 5, 5, 4, 5],
    ucrr: 98,
    medianResponseDays: 1.5,
  },
  {
    id: "sch-cairo-010",
    slug: "zahraa-al-maadi-school",
    name: "مدرسة زهراء المعادي التجريبية",
    governorate: "القاهرة",
    type: "رسمي لغات",
    ratings: [4, 3, 4, 4, 4, 3],
    ucrr: 81,
    medianResponseDays: 3.8,
  },

  // Giza
  {
    id: "sch-giza-001",
    slug: "el-saeedia-secondary-school-giza",
    name: "مدرسة السعيدية الثانوية العسكرية بنين (الجيزة)",
    governorate: "الجيزة",
    type: "رسمي حكومي عريق",
    ratings: [4, 4, 3, 4, 4, 3, 4, 5, 4],
    ucrr: 86,
    medianResponseDays: 2.9,
  },
  {
    id: "sch-giza-002",
    slug: "el-orman-experimental-school-dokki",
    name: "مدرسة الأورمان الرسمية للغات (الدقي)",
    governorate: "الجيزة",
    type: "رسمي لغات",
    ratings: [4, 5, 4, 4, 3, 4, 4, 4],
    ucrr: 88,
    medianResponseDays: 2.7,
  },
  {
    id: "sch-giza-003",
    slug: "misr-2000-modern-school-october",
    name: "مدرسة مصر 2000 الحديثة (MSE - 6 أكتوبر)",
    governorate: "الجيزة",
    type: "خاص لغات ودولي",
    ratings: [5, 4, 5, 5, 4, 5, 4, 5, 4, 5],
    ucrr: 93,
    medianResponseDays: 1.9,
  },
  {
    id: "sch-giza-004",
    slug: "manor-house-sheikh-zayed",
    name: "مدرسة مانور هاوس (الشيخ زايد)",
    governorate: "الجيزة",
    type: "دولي ولغات",
    ratings: [5, 5, 4, 5, 4, 5, 5, 4],
    ucrr: 92,
    medianResponseDays: 2.1,
  },
  {
    id: "sch-giza-005",
    slug: "nile-egyptian-school-zayed",
    name: "مدارس النيل المصرية الدولية (الشيخ زايد)",
    governorate: "الجيزة",
    type: "نيل دولية معتمدة",
    ratings: [5, 4, 5, 5, 5, 4, 5, 5],
    ucrr: 95,
    medianResponseDays: 1.7,
  },

  // Alexandria
  {
    id: "sch-alex-001",
    slug: "victoria-college-alexandria",
    name: "كلية فيكتوريا بالإسكندرية (Victoria College)",
    governorate: "الإسكندرية",
    type: "قومية ولغات",
    ratings: [5, 4, 5, 4, 4, 5, 4, 5, 4, 5, 4],
    ucrr: 91,
    medianResponseDays: 2.3,
  },
  {
    id: "sch-alex-002",
    slug: "college-saint-marc-alexandria",
    name: "كلية سان مارك (Collège Saint Marc - الشاطبي)",
    governorate: "الإسكندرية",
    type: "خاص لغات (فرنسي)",
    ratings: [5, 5, 4, 5, 5, 4, 5, 5, 4, 5],
    ucrr: 96,
    medianResponseDays: 1.6,
  },
  {
    id: "sch-alex-003",
    slug: "el-nasr-girls-college-egc-alex",
    name: "كلية النصر للبنات (EGC - الشاطبي بالإسكندرية)",
    governorate: "الإسكندرية",
    type: "قومية ولغات",
    ratings: [4, 4, 5, 4, 4, 5, 4, 5],
    ucrr: 89,
    medianResponseDays: 2.5,
  },
  {
    id: "sch-alex-004",
    slug: "lycee-francais-alexandrie",
    name: "مدرسة ليسيه الحرية بالإسكندرية (Lycée Français)",
    governorate: "الإسكندرية",
    type: "خاص لغات وفرنسي",
    ratings: [4, 5, 4, 4, 5, 4, 4, 5],
    ucrr: 90,
    medianResponseDays: 2.2,
  },
  {
    id: "sch-alex-005",
    slug: "el-nasr-boys-school-ebs-alex",
    name: "مدرسة النصر للبنين (EBS - الشاطبي بالإسكندرية)",
    governorate: "الإسكندرية",
    type: "قومية",
    ratings: [4, 3, 4, 4, 3, 4, 4, 5],
    ucrr: 84,
    medianResponseDays: 3.2,
  },

  // Qena (only 3 schools -> fails governorate threshold < 10)
  {
    id: "sch-qena-001",
    slug: "qena-experimental-language-school",
    name: "مدرسة قنا الرسمية المتميزة للغات",
    governorate: "قنا",
    type: "رسمي لغات",
    ratings: [4, 5],
    ucrr: 90,
    medianResponseDays: 3.0,
  },
  {
    id: "sch-qena-002",
    slug: "nile-egyptian-school-qena",
    name: "مدارس النيل المصرية بقنا",
    governorate: "قنا",
    type: "نيل دولية",
    ratings: [5, 4, 5],
    ucrr: 95,
    medianResponseDays: 2.0,
  },
  {
    id: "sch-qena-003",
    slug: "al-ahram-private-school-qena",
    name: "مدرسة الأهرام الخاصة بقنا",
    governorate: "قنا",
    type: "خاص عربي",
    ratings: [3],
    ucrr: 75,
    medianResponseDays: 5.0,
  },
];

export async function getPublicSchoolsDirectory(
  selectedGovernorate = "القاهرة"
): Promise<{
  governorates: string[];
  selectedGovernorate: string;
  thresholdInfo: GovernorateThresholdResult;
  schools: PublicSchoolSummary[];
}> {
  const governorates = ["القاهرة", "قنا", "الجيزة", "الإسكندرية"];

  const filtered = SAMPLE_SCHOOLS.filter(
    (s) => s.governorate === selectedGovernorate
  );
  const thresholdInfo = checkGovernorateThreshold(
    selectedGovernorate,
    filtered.length
  );

  const schools: PublicSchoolSummary[] = filtered.map((s) => {
    const bars = calculateBARS({ ratings: s.ratings });
    return {
      id: s.id,
      slug: s.slug,
      name: s.name,
      governorate: s.governorate,
      type: s.type,
      metrics: {
        institutionId: s.id,
        institutionName: s.name,
        governorate: s.governorate,
        bars,
        userConfirmedResolutionRate: s.ucrr,
        medianResponseDays: s.medianResponseDays,
        totalCases12Months: s.ratings.length,
        sampleSizeContext: `بناءً على ${bars.sampleSize} حالة مغلقة ومقيمة من أولياء الأمور خلال 12 شهراً`,
      },
    };
  });

  return {
    governorates,
    selectedGovernorate,
    thresholdInfo,
    schools,
  };
}

export async function getSchoolProfileBySlug(
  slug: string
): Promise<SchoolProfileData | null> {
  const school = SAMPLE_SCHOOLS.find((s) => s.slug === slug);
  if (!school) return null;

  const thresholdInfo = checkGovernorateThreshold(
    school.governorate,
    SAMPLE_SCHOOLS.filter((s) => s.governorate === school.governorate).length
  );

  const bars = calculateBARS({ ratings: school.ratings });

  // Public safe cases for this school
  const samplePublicCases: PublicCaseSummary[] = [
    {
      id: "case-pub-001",
      referenceNumber: "MRF-2026-0941",
      category: "ADMINISTRATION_DISCIPLINE",
      sanitizedDescription:
        "شكوى بخصوص مخالفة انضباط صفي وتوجيه توبيخ لفظي أمام الزملاء في الفصل الدراسي.",
      desiredOutcome: "اعتذار رسمي للطالب وتفعيل اختصاصات لجنة الحماية المدرسية",
      officialStatement:
        "عقدت إدارة المدرسة اجتماعاً فورياً للجنة الحماية وتم اتخاذ إجراءات توجيهية وإرشادية للمعلم والاعتذار لولي الأمر.",
      rqsScore: 92,
      rExp: 3,
      rResp: 5,
      rRes: 5,
      closingFeedback:
        "تعاملت إدارة المدرسة بأعلى درجات المسؤولية والمهنية واستعادة ثقة ابني في مدرسته.",
      closedAt: "2026-09-12",
      visibility: "PUBLIC",
    },
    {
      id: "case-pub-002",
      referenceNumber: "MRF-2026-0812",
      category: "TRANSPORTATION_BUSES",
      sanitizedDescription:
        "تأخر متكرر لحافلة المدرسة الصباحية لأكثر من 40 دقيقة مع غياب مشرفة الباص.",
      desiredOutcome: "تعديل مسار الحافلة والالتزام بمواعيد الحضور وتعيين مشرفة متفرغة",
      officialStatement:
        "تم استبدال الحافلة وإعادة تنظيم خط السير وتعيين مشرفة بديلة معتمدة.",
      rqsScore: 88,
      rExp: 2,
      rResp: 4,
      rRes: 5,
      closingFeedback: "انتظم خط السير والمشرفة ملتزمة للغاية، شكراً للمتابعة السريعة.",
      closedAt: "2026-08-28",
      visibility: "ANONYMOUS_PUBLIC",
    },
  ];

  return {
    id: school.id,
    slug: school.slug,
    name: school.name,
    governorate: school.governorate,
    type: school.type,
    metrics: {
      institutionId: school.id,
      institutionName: school.name,
      governorate: school.governorate,
      bars,
      userConfirmedResolutionRate: school.ucrr,
      medianResponseDays: school.medianResponseDays,
      totalCases12Months: school.ratings.length,
      sampleSizeContext: `بناءً على ${bars.sampleSize} حالة مغلقة ومقيمة من أولياء الأمور خلال 12 شهراً`,
    },
    publicCases: samplePublicCases,
    thresholdInfo,
  };
}
