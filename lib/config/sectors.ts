import type { SectorType } from "@/types/database";

export interface SectorDepartmentPreset {
  code: string;
  name_ar: string;
  name_en: string;
  default_sla_hours: number;
}

export interface SectorConfig {
  sector: SectorType;
  title_ar: string;
  title_en: string;
  icon: string;
  beneficiaryTerm: {
    ar: string;
    en: string;
  };
  beneficiaryIdentifier: {
    label_ar: string;
    label_en: string;
    placeholder_ar: string;
    placeholder_en: string;
    helper_ar: string;
  };
  defaultDepartments: SectorDepartmentPreset[];
  regulatoryAuthority_ar: string;
  regulatoryAuthority_en: string;
  statutoryBasis_ar: string;
  statutoryBasis_en: string;
}

export const SECTOR_CONFIGS: Record<SectorType, SectorConfig> = {
  EDUCATION_SCHOOLS: {
    sector: "EDUCATION_SCHOOLS",
    title_ar: "المدارس والتعليم قبل الجامعي",
    title_en: "Pre-University Schools",
    icon: "🏫",
    beneficiaryTerm: {
      ar: "ولي الأمر / الطالب",
      en: "Parent / Student",
    },
    beneficiaryIdentifier: {
      label_ar: "كود الطالب / رقم القيد المدرسي",
      label_en: "Student ID / Enrollment Number",
      placeholder_ar: "مثال: STU-2026-8841",
      placeholder_en: "e.g. STU-2026-8841",
      helper_ar: "كود الطالب المسجل بملف المدرسة أو إيصال المصروفات",
    },
    defaultDepartments: [
      { code: "STUDENT_AFFAIRS", name_ar: "شؤون الطلاب والقيد", name_en: "Student Affairs", default_sla_hours: 48 },
      { code: "ACADEMIC", name_ar: "الشؤون التعليمية والأكاديمية", name_en: "Academic Affairs", default_sla_hours: 72 },
      { code: "FINANCE_TUITION", name_ar: "الحسابات والمصروفات", name_en: "Finance & Tuition", default_sla_hours: 48 },
      { code: "BEHAVIORAL_DISCIPLINE", name_ar: "التوجيه السلوكي والانضباط", name_en: "Behavioral Guidance", default_sla_hours: 24 },
      { code: "FACILITIES_TRANSPORT", name_ar: "الحافلات والمرافق المدرسية", name_en: "Facilities & Transport", default_sla_hours: 36 },
    ],
    regulatoryAuthority_ar: "وزارة التربية والتعليم والتعليم الفني",
    regulatoryAuthority_en: "Ministry of Education & Technical Education",
    statutoryBasis_ar: "القرار الوزاري رقم 187 لسنة 2023 بشأن لائحة النظام والانضباط المدرسي",
    statutoryBasis_en: "Ministerial Decree 187/2023 on School Discipline Regulations",
  },

  HIGHER_EDUCATION: {
    sector: "HIGHER_EDUCATION",
    title_ar: "الجامعات والتعليم العالي",
    title_en: "Higher Education & Universities",
    icon: "🎓",
    beneficiaryTerm: {
      ar: "الطالب الجامعي / الباحث",
      en: "University Student / Researcher",
    },
    beneficiaryIdentifier: {
      label_ar: "الرقم الجامعي / رقم الجلوس",
      label_en: "University Student ID / Seat Number",
      placeholder_ar: "مثال: UNI-2024-10492",
      placeholder_en: "e.g. UNI-2024-10492",
      helper_ar: "الرقم الجامعي المطبوع على بطاقة الكلية أو منصة الساعات المعتمدة",
    },
    defaultDepartments: [
      { code: "STUDENT_AFFAIRS", name_ar: "شؤون التعليم والطلاب", name_en: "Student Affairs", default_sla_hours: 48 },
      { code: "EXAMS_CONTROL", name_ar: "الكنترول والتظلمات الأكاديمية", name_en: "Exams & Appeals", default_sla_hours: 72 },
      { code: "FINANCIAL_FEES", name_ar: "الخزينة والرسوم الدراسية", name_en: "Tuition & Fees", default_sla_hours: 48 },
      { code: "STUDENT_HOUSING", name_ar: "المدن الجامعية والإسكان", name_en: "Student Housing", default_sla_hours: 24 },
      { code: "GRADUATION_AFFAIRS", name_ar: "الخريجين وتوثيق الشهادات", name_en: "Graduation Affairs", default_sla_hours: 96 },
    ],
    regulatoryAuthority_ar: "وزارة التعليم العالي والبحث العلمي والمجلس الأعلى للجامعات",
    regulatoryAuthority_en: "Ministry of Higher Education & Supreme Council of Universities",
    statutoryBasis_ar: "قانون تنظيم الجامعات رقم 49 لسنة 1972 ولائحته التنفيذية",
    statutoryBasis_en: "Law 49/1972 on University Organization & Executive Bylaws",
  },

  GOVERNMENT_PUBLIC: {
    sector: "GOVERNMENT_PUBLIC",
    title_ar: "الخدمات الحكومية والهيئات العامة",
    title_en: "Government & Public Services",
    icon: "🏛️",
    beneficiaryTerm: {
      ar: "المواطن / صاحب المعاملة",
      en: "Citizen / Applicant",
    },
    beneficiaryIdentifier: {
      label_ar: "رقم المعاملة / إيصال الطلب",
      label_en: "Transaction Number / Service Receipt",
      placeholder_ar: "مثال: GOV-REC-2026-993",
      placeholder_en: "e.g. GOV-REC-2026-993",
      helper_ar: "رقم الإيصال أو كود الحجز الآلي المستلم بالنافذة أو البوابة الإلكترونية",
    },
    defaultDepartments: [
      { code: "CITIZEN_SERVICE", name_ar: "خدمة المواطنين والشكاوى", name_en: "Citizen Service Desk", default_sla_hours: 48 },
      { code: "DOCUMENTATION_RECORDS", name_ar: "التوثيق والأرشيف الإلكتروني", name_en: "Documentation & Records", default_sla_hours: 72 },
      { code: "LEGAL_AFFAIRS", name_ar: "الشؤون القانونية والمراجعة", name_en: "Legal Affairs", default_sla_hours: 96 },
      { code: "FINANCIAL_COLLECTION", name_ar: "التحصيل والرسوم الحكومية", name_en: "Government Collection", default_sla_hours: 48 },
      { code: "OPERATIONS_INSPECTION", name_ar: "المتابعة الميدانية والتفتيش", name_en: "Inspection & Follow-up", default_sla_hours: 48 },
    ],
    regulatoryAuthority_ar: "مجلس الوزراء ووزارة التخطيط والتنمية الاقتصادية",
    regulatoryAuthority_en: "Cabinet of Ministers & Ministry of Planning",
    statutoryBasis_ar: "قرارات مجلس الوزراء بشأن تفعيل اتفاقيات مستوى الخدمة (SLA) وبوابات الشكاوى الحكومية",
    statutoryBasis_en: "Cabinet Decrees on Public Service SLA Agreements & Government Inquiries",
  },

  COMMERCIAL_COMPANIES: {
    sector: "COMMERCIAL_COMPANIES",
    title_ar: "الشركات والخدمات التجارية",
    title_en: "Commercial Companies & Enterprises",
    icon: "🏢",
    beneficiaryTerm: {
      ar: "العميل / المستهلك / المشترك",
      en: "Customer / Client / Subscriber",
    },
    beneficiaryIdentifier: {
      label_ar: "رقم الفاتورة / أمر الشراء / رقم الاشتراك",
      label_en: "Invoice / Order ID / Subscription Number",
      placeholder_ar: "مثال: INV-2026-55421",
      placeholder_en: "e.g. INV-2026-55421",
      helper_ar: "رقم الفاتورة أو كود الاشتراك الموضح بإيصال الشراء أو عقد الخدمة",
    },
    defaultDepartments: [
      { code: "CUSTOMER_CARE", name_ar: "خدمة العملاء والدعم المباشر", name_en: "Customer Care", default_sla_hours: 24 },
      { code: "WARRANTY_MAINTENANCE", name_ar: "الضمان وخدمات ما بعد البيع", name_en: "Warranty & Maintenance", default_sla_hours: 48 },
      { code: "BILLING_REFUNDS", name_ar: "الفوترة واسترداد المدفوعات", name_en: "Billing & Refunds", default_sla_hours: 48 },
      { code: "SHIPPING_DELIVERY", name_ar: "الشحن والتوصيل واللوجستيات", name_en: "Shipping & Logistics", default_sla_hours: 24 },
      { code: "QUALITY_ASSURANCE", name_ar: "إدارة الجودة وتجارب العملاء", name_en: "Quality Assurance", default_sla_hours: 72 },
    ],
    regulatoryAuthority_ar: "جهاز حماية المستهلك ووزارة التموين والتجارة الداخلية",
    regulatoryAuthority_en: "Consumer Protection Agency (CPA)",
    statutoryBasis_ar: "قانون حماية المستهلك رقم 181 لسنة 2018 ولائحته التنفيذية",
    statutoryBasis_en: "Consumer Protection Law 181/2018 & Executive Regulations",
  },

  HEALTHCARE_MEDICAL: {
    sector: "HEALTHCARE_MEDICAL",
    title_ar: "المنشآت الصحية والمستشفيات",
    title_en: "Healthcare Facilities & Hospitals",
    icon: "🏥",
    beneficiaryTerm: {
      ar: "المريض / المرافق",
      en: "Patient / Guardian",
    },
    beneficiaryIdentifier: {
      label_ar: "رقم الملف الطبي (MRN) / رقم الدخول",
      label_en: "Medical Record Number (MRN) / Admission ID",
      placeholder_ar: "مثال: MRN-984210",
      placeholder_en: "e.g. MRN-984210",
      helper_ar: "رقم الملف الطبي المطبوع على بطاقة المريض أو تذكرة العيادة",
    },
    defaultDepartments: [
      { code: "PATIENT_RELATIONS", name_ar: "علاقات وخدمة المرضى", name_en: "Patient Relations", default_sla_hours: 12 },
      { code: "MEDICAL_ADMIN", name_ar: "الإدارة الطبية والأطباء", name_en: "Medical Administration", default_sla_hours: 24 },
      { code: "BILLING_INSURANCE", name_ar: "الحسابات والتأمين الصحي", name_en: "Billing & Medical Insurance", default_sla_hours: 24 },
      { code: "QUALITY_SAFETY", name_ar: "الجودة وسلامة المرضى ومكافحة العدوى", name_en: "Quality & Safety", default_sla_hours: 24 },
      { code: "NURSING_CARE", name_ar: "هيئة التمريض والرعاية الداخلية", name_en: "Nursing & Inpatient Care", default_sla_hours: 12 },
    ],
    regulatoryAuthority_ar: "الهيئة العامة للاعتماد والرقابة الصحية (GAHAR) ووزارة الصحة",
    regulatoryAuthority_en: "General Authority for Healthcare Accreditation & Regulation (GAHAR)",
    statutoryBasis_ar: "معايير GAHAR الوطنية ولائحة حقوق ومسؤوليات المريض بالمنشآت الصحية",
    statutoryBasis_en: "GAHAR Accreditation Standards & Patient Rights Regulations",
  },
};

export function getSectorConfig(sector: SectorType): SectorConfig {
  return SECTOR_CONFIGS[sector] || SECTOR_CONFIGS.EDUCATION_SCHOOLS;
}
