// lib/config/taxonomies/index.ts
import type { SectorType } from "@/types/database";

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

export const SECTOR_TAXONOMIES_V2026_1: Record<SectorType, SectorTaxonomyCategory[]> = {
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

export function getSectorTaxonomy(sector: SectorType): SectorTaxonomyCategory[] {
  return SECTOR_TAXONOMIES_V2026_1[sector] || SECTOR_TAXONOMIES_V2026_1.EDUCATION_SCHOOLS;
}
