"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { VisibilityLevelEnum, type SectorType } from "@/types/database";
import { PhoneVerificationModal } from "./PhoneVerificationModal";
import { SAMPLE_ENTITIES } from "@/lib/services/entities";
import { getSectorTaxonomy } from "@/lib/config/taxonomies";
import {
  getSectorDefaultIdentifierType,
  EGYPTIAN_NATIONAL_ID_REGEX,
} from "@/lib/validators/sensitive-identifiers";

interface IntakeWizardProps {
  initialInstitutionId?: string;
  initialSector?: SectorType;
  locale?: "ar" | "en";
}

const SECTOR_CONFIG: Record<
  SectorType,
  {
    icon: string;
    title_ar: string;
    title_en: string;
    entityLabel_ar: string;
    entityLabel_en: string;
    userRoles_ar: string[];
    userRoles_en: string[];
    identifierLabel_ar: string;
    identifierLabel_en: string;
    identifierPlaceholder_ar: string;
    identifierPlaceholder_en: string;
    guidance_ar: string;
  }
> = {
  EDUCATION_SCHOOLS: {
    icon: "🏫",
    title_ar: "المدارس والتعليم قبل الجامعي",
    title_en: "Pre-University Schools",
    entityLabel_ar: "المدرسة / المؤسسة التعليمية",
    entityLabel_en: "School / Educational Institution",
    userRoles_ar: ["ولي أمر الطالب", "الطالب نفسه", "الوصي القانوني"],
    userRoles_en: ["Parent / Guardian", "Student", "Legal Custodian"],
    identifierLabel_ar: "كود الطالب المدرسي (اختياري - مشفر)",
    identifierLabel_en: "Student Code (Optional - Encrypted)",
    identifierPlaceholder_ar: "مثال: STU-2026-90412",
    identifierPlaceholder_en: "e.g. STU-2026-90412",
    guidance_ar: "سيتم إرسال الإشعار لإدارة المدرسة لبدء مهلة الـ 7 أيام وتقديم خطة معالجة معتمدة.",
  },
  HIGHER_EDUCATION: {
    icon: "🎓",
    title_ar: "الجامعات والتعليم العالي",
    title_en: "Universities & Higher Education",
    entityLabel_ar: "الجامعة / الكلية أو المعهد المعتمد",
    entityLabel_en: "University / Faculty or Institute",
    userRoles_ar: ["طالب جامعي (مرحلة البكالوريوس/الليسانس)", "طالب دراسات عليا / باحث", "خريج سابق"],
    userRoles_en: ["Undergraduate Student", "Postgraduate / Researcher", "Alumnus"],
    identifierLabel_ar: "الرقم الجامعي / كود القيد الأكاديمي (مشفر)",
    identifierLabel_en: "Academic Student ID (Encrypted)",
    identifierPlaceholder_ar: "مثال: ENG-2023-94812",
    identifierPlaceholder_en: "e.g. ENG-2023-94812",
    guidance_ar: "تخضع المعالجة لضمانات التحقيق والتظلم الأكاديمي بقانون تنظيم الجامعات رقم 49 لسنة 1972.",
  },
  GOVERNMENT_PUBLIC: {
    icon: "🏛️",
    title_ar: "الخدمات الحكومية والهيئات",
    title_en: "Government & Public Services",
    entityLabel_ar: "الجهة أو المصلحة الحكومية",
    entityLabel_en: "Government Agency / Service Office",
    userRoles_ar: ["مواطن / صاحب الشأن", "مفوض أو وكيل رسمي", "مستفيد من الخدمة"],
    userRoles_en: ["Citizen / Applicant", "Authorized Representative", "Beneficiary"],
    identifierLabel_ar: "رقم الطلب أو المعاملة الحكومية (حظر الرقم القومي)",
    identifierLabel_en: "Service Request / Ticket Number (No National ID)",
    identifierPlaceholder_ar: "مثال: REQ-CAIRO-90214",
    identifierPlaceholder_en: "e.g. REQ-CAIRO-90214",
    guidance_ar: "يُحظر كتابة الرقم القومي المكون من 14 رقماً. يرجى إدخال رقم إيصال الطلب أو المعاملة.",
  },
  COMMERCIAL_COMPANIES: {
    icon: "🏢",
    title_ar: "الشركات والخدمات التجارية",
    title_en: "Commercial Companies & Telecom",
    entityLabel_ar: "الشركة أو مزود الخدمة",
    entityLabel_en: "Company / Service Provider",
    userRoles_ar: ["عميل متعاقد", "مستهلك / مشتري", "مشترك في الخدمة"],
    userRoles_en: ["Subscribed Customer", "Consumer / Buyer", "Service User"],
    identifierLabel_ar: "رقم الفاتورة أو أمر الشراء أو رقم الحساب (مشفر)",
    identifierLabel_en: "Order / Invoice / Account Number (Encrypted)",
    identifierPlaceholder_ar: "مثال: ORD-2026-88194",
    identifierPlaceholder_en: "e.g. ORD-2026-88194",
    guidance_ar: "تطبق المنظومة ضمانات قانون حماية المستهلك رقم 181 لسنة 2018 (حق الاسترجاع والضمان).",
  },
  HEALTHCARE_MEDICAL: {
    icon: "🏥",
    title_ar: "المنشآت الصحية والمستشفيات",
    title_en: "Healthcare & Hospitals",
    entityLabel_ar: "المستشفى / المنشأة الطبية",
    entityLabel_en: "Hospital / Healthcare Facility",
    userRoles_ar: ["المريض نفسه", "المرافق أو ولي الأمر القانوني", "المشترك في منظومة التأمين"],
    userRoles_en: ["Patient", "Legal Guardian / Relative", "Insurance Policyholder"],
    identifierLabel_ar: "رقم الملف الطبي أو كود التأمين (MRN - مشفر بالكامل)",
    identifierLabel_en: "Medical Record Number (MRN - Encrypted)",
    identifierPlaceholder_ar: "مثال: MRN-MED-99412",
    identifierPlaceholder_en: "e.g. MRN-MED-99412",
    guidance_ar: "تُعزل الأرقام الطبية والملفات الحساسة طبقاً لمعايير الخصوصية الصحية وقانون 151 لسنة 2020.",
  },
};

export function IntakeWizard({
  initialInstitutionId,
  initialSector,
  locale: initialLocale = "ar",
}: IntakeWizardProps) {
  const searchParams = useSearchParams();
  const paramSector = searchParams?.get("sector") as SectorType | null;
  const paramEntity = searchParams?.get("entity") || searchParams?.get("institution") || null;

  const [lang, setLang] = useState<"ar" | "en">(initialLocale);
  const [currentStep, setCurrentStep] = useState(1);

  // Sector Selection
  const [selectedSector, setSelectedSector] = useState<SectorType>(() => {
    if (paramSector && SECTOR_CONFIG[paramSector]) return paramSector;
    if (initialSector && SECTOR_CONFIG[initialSector]) return initialSector;
    if (paramEntity) {
      const match = SAMPLE_ENTITIES.find((e) => e.slug === paramEntity || e.id === paramEntity);
      if (match) return match.sector;
    }
    return "EDUCATION_SCHOOLS";
  });

  // Entities matching selected sector
  const sectorEntities = SAMPLE_ENTITIES.filter((e) => e.sector === selectedSector);

  // Institution Selection
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>(() => {
    if (paramEntity) {
      const match = SAMPLE_ENTITIES.find((e) => e.slug === paramEntity || e.id === paramEntity);
      if (match) return match.id;
    }
    return sectorEntities[0]?.id || "00000000-0000-0000-0000-000000000010";
  });

  // User Role / Relationship
  const [userRole, setUserRole] = useState<string>(SECTOR_CONFIG[selectedSector].userRoles_ar[0]);

  // Dynamic Taxonomy Categories
  const taxonomy = getSectorTaxonomy(selectedSector);
  const [category, setCategory] = useState<string>(taxonomy[0]?.key || "GENERAL");
  const [subcategory, setSubcategory] = useState<string>(
    taxonomy[0]?.subcategories[0]?.label_ar || "عام"
  );

  // Sensitive Identifier (Sector-specific: MRN, Student ID, Service Request, Order ID)
  const [identifierValue, setIdentifierValue] = useState<string>("");
  const [identifierError, setIdentifierError] = useState<string | null>(null);

  // Case Core Fields
  const [description, setDescription] = useState("");
  const [desiredOutcome, setDesiredOutcome] = useState("");
  const [rating, setRating] = useState<number>(2);
  const [visibility, setVisibility] = useState<string>(VisibilityLevelEnum.STRICTLY_PRIVATE);
  const [verifiedPhone, setVerifiedPhone] = useState<string>("");
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [consentGiven, setConsentGiven] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // When sector changes, update institution, categories, and roles
  const handleSectorChange = (newSector: SectorType) => {
    setSelectedSector(newSector);
    const newSectorEntities = SAMPLE_ENTITIES.filter((e) => e.sector === newSector);
    if (newSectorEntities.length > 0) {
      setSelectedInstitutionId(newSectorEntities[0].id);
    }
    const newTax = getSectorTaxonomy(newSector);
    if (newTax.length > 0) {
      setCategory(newTax[0].key);
      setSubcategory(newTax[0].subcategories[0]?.label_ar || "");
    }
    setUserRole(SECTOR_CONFIG[newSector].userRoles_ar[0]);
    setIdentifierValue("");
    setIdentifierError(null);
  };

  // Selected Entity Record
  const selectedEntity =
    SAMPLE_ENTITIES.find((i) => i.id === selectedInstitutionId) || sectorEntities[0] || SAMPLE_ENTITIES[0];

  // Active Category Object
  const activeCategoryObj = taxonomy.find((c) => c.key === category) || taxonomy[0];

  const handleIdentifierChange = (val: string) => {
    setIdentifierValue(val);
    const clean = val.replace(/[\s-]/g, "");
    if (EGYPTIAN_NATIONAL_ID_REGEX.test(clean)) {
      setIdentifierError(
        lang === "ar"
          ? "⚠️ يُحظر إدخال الرقم القومي المكون من 14 رقماً حرصاً على حماية البيانات الشخصية (قانون 151 لسنة 2020). يرجى إدخال رقم الطلب أو المعاملة أو الفاتورة بدلاً منه."
          : "⚠️ Egyptian National IDs (14 digits) are strictly prohibited under Law 151/2020. Please use a ticket or transaction reference."
      );
    } else {
      setIdentifierError(null);
    }
  };

  const handleSubmit = async () => {
    if (!verifiedPhone) {
      setIsPhoneModalOpen(true);
      return;
    }
    if (description.length < 50) {
      setError(
        lang === "ar"
          ? "يرجى كتابة وصف تفصيلي لا يقل عن 50 حرفاً لضمان دراسة الحالة بدقة."
          : "Please enter a detailed description of at least 50 characters."
      );
      return;
    }
    if (desiredOutcome.length < 5) {
      setError(
        lang === "ar"
          ? "يرجى توضيح النتيجة المرجوة أو الحل المطلوب من إدارة الجهة."
          : "Please describe your desired outcome."
      );
      return;
    }

    if (identifierError) {
      setError(identifierError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const defaultIdType = getSectorDefaultIdentifierType(selectedSector);
      const sensitiveIdentifierPayload = identifierValue.trim()
        ? {
            type: defaultIdType,
            value: identifierValue.trim(),
          }
        : null;

      const response = await fetch("/api/cases/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institution_id: selectedInstitutionId,
          category,
          subcategory,
          raw_description: description,
          desired_outcome: desiredOutcome,
          initial_experience_rating: rating,
          visibility,
          parent_phone: verifiedPhone,
          consent_given: consentGiven,
          sensitive_identifier: sensitiveIdentifierPayload,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "فشل تسجيل الحالة");
      }
      setSubmissionResult(data.case);
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع أثناء الإرسال");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRtl = lang === "ar";
  const secConfig = SECTOR_CONFIG[selectedSector];

  // Success Screen
  if (submissionResult) {
    return (
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className={`mx-auto max-w-2xl rounded-2xl border border-emerald-200 bg-emerald-50/70 p-8 shadow-sm ${
          isRtl ? "text-right font-arabic" : "text-left"
        }`}
      >
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 text-2xl font-bold shadow-inner">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          {isRtl ? "تم تسجيل الحالة رسمياً بنجاح" : "Case Registered Successfully"}
        </h2>
        <p className="text-slate-600 mb-6">
          {isRtl ? "رقم المرجع الرسمي للحالة:" : "Official Reference:"}{" "}
          <span className="font-mono font-bold text-sky-900 bg-white px-3 py-1 rounded border border-emerald-200">
            {submissionResult.reference_number}
          </span>
        </p>

        <div className="rounded-xl bg-white p-5 border border-emerald-100 text-sm space-y-3 mb-6 text-slate-700 shadow-sm">
          <div className="flex items-center justify-between border-b pb-2">
            <strong>{isRtl ? "الجهة المختصة:" : "Target Entity:"}</strong>
            <span className="font-bold text-slate-800">{selectedEntity.name}</span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <strong>{isRtl ? "القطاع الوطني:" : "Sector:"}</strong>
            <span className="rounded-md bg-sky-50 px-2 py-0.5 text-xs font-bold text-sky-800">
              {secConfig.icon} {secConfig.title_ar}
            </span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <strong>{isRtl ? "الحالة التشغيلية:" : "Lifecycle Status:"}</strong>
            <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-800">
              {isRtl ? "مهلة المراجعة الخاصة (7 أيام)" : "Private Grace (7 Days)"}
            </span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <strong>{isRtl ? "مستوى الخصوصية:" : "Privacy Level:"}</strong>
            <span className="font-semibold text-sky-900">
              {submissionResult.visibility === VisibilityLevelEnum.STRICTLY_PRIVATE
                ? isRtl
                  ? "سري بالكامل (STRICTLY_PRIVATE)"
                  : "Strictly Private"
                : isRtl
                ? "عام دون كشف الهوية (ANONYMOUS_PUBLIC)"
                : "Anonymous Public"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <strong>{isRtl ? "تاريخ انتهاء مهلة الـ 7 أيام:" : "Grace Period Expiry:"}</strong>
            <span className="font-mono text-slate-600">
              {new Date(submissionResult.grace_expires_at).toLocaleDateString(
                isRtl ? "ar-EG" : "en-US",
                { year: "numeric", month: "long", day: "numeric" }
              )}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          {isRtl
            ? "تم إخطار الجهة رسميًا عبر المنصة. تمنح الجهة مهلة خاصة مدتها 7 أيام للتواصل معك ودراسة الحالة وتقديم خطة حل معتمدة. يمكنك متابعة حالة الطلب في أي وقت عبر هذا المرجع."
            : "The entity has been notified. They have a 7-day private grace window to review and submit an action plan."}
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-block rounded-xl bg-sky-800 px-6 py-2.5 font-bold text-white hover:bg-sky-900 transition"
          >
            {isRtl ? "العودة للرئيسية" : "Back to Home"}
          </Link>
          <Link
            href="/directory"
            className="inline-block rounded-xl border border-slate-300 bg-white px-6 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            {isRtl ? "تصفح الدليل الوطني للجهات" : "Browse Directory"}
          </Link>
          <button
            type="button"
            onClick={() => {
              setSubmissionResult(null);
              setCurrentStep(1);
              setDescription("");
              setDesiredOutcome("");
              setIdentifierValue("");
            }}
            className="inline-block rounded-xl border border-slate-300 px-6 py-2.5 font-semibold text-slate-700 hover:bg-white transition"
          >
            {isRtl ? "تسجيل حالة أخرى" : "Submit Another Case"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className={`mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm ${
        isRtl ? "text-right font-arabic" : "text-left"
      }`}
    >
      {/* Top Global Return Bar */}
      <div className="mb-4 flex items-center justify-between text-xs font-bold text-slate-600 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Link href="/" className="hover:text-sky-800 transition flex items-center gap-1">
            🏠 <span>الرئيسية</span>
          </Link>
          <span className="text-slate-300">/</span>
          <Link href="/directory" className="hover:text-sky-800 transition">
            🌐 الدليل الوطني للجهات
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-sky-800">{secConfig.title_ar}</span>
        </div>
        <Link
          href="/portal/dashboard"
          className="text-slate-500 hover:text-sky-800 transition hidden sm:inline"
        >
          بوابة الجهات والمؤسسات
        </Link>
      </div>

      {/* Header & Locale Switcher */}
      <div className="mb-6 flex items-start justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="inline-block rounded-md bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-800 mb-2">
            {isRtl ? "المسار الآمن للشكاوى والتسوية المؤسسية" : "Secure National Resolution Intake"}
          </span>
          <h1 className="text-2xl font-bold text-slate-900">
            {isRtl ? "تسجيل شكوى أو طلب حل" : "Submit Case / Resolution Request"} —{" "}
            <span className="text-sky-800">{selectedEntity.name}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isRtl
              ? "منصة مُرافِق — توثيق وحل المشكلات بمهنية وحيادية تامة عبر 5 قطاعات وطنية"
              : "Murafiq Platform — Neutral and accountable resolution system across 5 national sectors"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setLang(lang === "ar" ? "en" : "ar")}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
        >
          {lang === "ar" ? "English" : "عربي"}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* Wizard Step Stepper */}
      <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-4 text-sm">
        <div
          className={`flex items-center gap-2 font-semibold ${
            currentStep === 1 ? "text-sky-900" : "text-slate-400"
          }`}
        >
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              currentStep === 1 ? "bg-sky-800 text-white" : "bg-slate-100 text-slate-500"
            }`}
          >
            1
          </span>
          <span>{isRtl ? "القطاع والجهة والتصنيف" : "Sector, Entity & Category"}</span>
        </div>

        <div
          className={`flex items-center gap-2 font-semibold ${
            currentStep === 2 ? "text-sky-900" : "text-slate-400"
          }`}
        >
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              currentStep === 2 ? "bg-sky-800 text-white" : "bg-slate-100 text-slate-500"
            }`}
          >
            2
          </span>
          <span>{isRtl ? "الوقائع والمطالب" : "Narrative & Outcome"}</span>
        </div>

        <div
          className={`flex items-center gap-2 font-semibold ${
            currentStep === 3 ? "text-sky-900" : "text-slate-400"
          }`}
        >
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              currentStep === 3 ? "bg-sky-800 text-white" : "bg-slate-100 text-slate-500"
            }`}
          >
            3
          </span>
          <span>{isRtl ? "الخصوصية والتحقق" : "Privacy & Verify"}</span>
        </div>
      </div>

      {/* Step 1: Sector, Entity, Dynamic Category & Role */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* 1.1 Sector Selection Pills */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {isRtl ? "1. اختر القطاع الوطني:" : "1. Select National Sector:"}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {(Object.keys(SECTOR_CONFIG) as SectorType[]).map((sKey) => {
                const cfg = SECTOR_CONFIG[sKey];
                const isSelected = selectedSector === sKey;
                return (
                  <button
                    key={sKey}
                    type="button"
                    onClick={() => handleSectorChange(sKey)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      isSelected
                        ? "border-sky-800 bg-sky-800 text-white shadow-xs"
                        : "border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-xl">{cfg.icon}</span>
                    <span className="text-center line-clamp-1">{cfg.title_ar}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 1.2 Entity Dropdown within Sector */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              2. {secConfig.entityLabel_ar}:
            </label>
            <select
              value={selectedInstitutionId}
              onChange={(e) => setSelectedInstitutionId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-sky-800 focus:outline-none bg-white font-medium"
            >
              {sectorEntities.map((ent) => (
                <option key={ent.id} value={ent.id}>
                  {ent.name} — ({ent.type} - {ent.governorate})
                </option>
              ))}
            </select>
          </div>

          {/* 1.3 Beneficiary Role in this Sector */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {isRtl ? "3. صفة مقدم الطلب في هذا القطاع:" : "3. Applicant Capacity:"}
            </label>
            <div className="flex flex-wrap gap-2">
              {secConfig.userRoles_ar.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setUserRole(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    userRole === r
                      ? "bg-slate-800 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* 1.4 Category Selection (Dynamically loaded from sector taxonomy) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {isRtl ? "4. التصنيف الرئيسي لموضوع المشكلة:" : "4. Primary Category:"}
            </label>
            <select
              value={category}
              onChange={(e) => {
                const newCatKey = e.target.value;
                setCategory(newCatKey);
                const found = taxonomy.find((c) => c.key === newCatKey);
                if (found && found.subcategories.length > 0) {
                  setSubcategory(found.subcategories[0].label_ar);
                }
              }}
              className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-sky-800 focus:outline-none bg-white"
            >
              {taxonomy.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label_ar} ({c.label_en})
                </option>
              ))}
            </select>
          </div>

          {/* 1.5 Subcategory Selection / Specification */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {isRtl ? "5. التصنيف الفرعي الدقيق:" : "5. Specific Subcategory:"}
            </label>
            {activeCategoryObj?.subcategories?.length > 0 ? (
              <div className="space-y-2">
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-sky-800 focus:outline-none bg-white"
                >
                  {activeCategoryObj.subcategories.map((sub) => (
                    <option key={sub.key} value={sub.label_ar}>
                      {sub.label_ar} — {sub.label_en}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder={isRtl ? "اكتب التصنيف الفرعي..." : "Enter subcategory..."}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-sky-800 focus:outline-none"
              />
            )}
          </div>

          {/* 1.6 Initial Experience Impact Rating (R_exp: 1 to 5) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {isRtl
                ? "6. تقييم أثر التجربة الأولية على المستفيد (1 إلى 5) — R_exp"
                : "6. Initial Experience Impact Rating (1 to 5) — R_exp"}
            </label>
            <div className="flex gap-3 items-center">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setRating(val)}
                  className={`h-11 w-11 rounded-xl border-2 font-bold text-base transition ${
                    rating === val
                      ? "border-sky-800 bg-sky-800 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {val}
                </button>
              ))}
              <span className="text-xs text-slate-500 mr-2">
                {rating === 1 && (isRtl ? "(1 = أثر سلبي بالغ ومعطل)" : "(1 = Severe negative impact)")}
                {rating === 2 && (isRtl ? "(2 = أثر سلبي واضح)" : "(2 = Noticeable disruption)")}
                {rating === 3 && (isRtl ? "(3 = مشكلة متوسطة تتطلب حلاً)" : "(3 = Moderate issue)")}
                {rating === 4 && (isRtl ? "(4 = ملاحظة طفيفة)" : "(4 = Minor issue)")}
                {rating === 5 && (isRtl ? "(5 = استفسار تنظيمي بسيط)" : "(5 = Routine inquiry)")}
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="rounded-xl bg-sky-800 px-8 py-3 font-semibold text-white hover:bg-sky-900 transition shadow-sm"
            >
              {isRtl ? "المتابعة لكتابة الوقائع والمطالب ←" : "Continue to Narrative →"}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Description & Desired Outcome */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* PII Defense Warning Banner */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 leading-relaxed">
            <strong>{isRtl ? "إرشادات حماية الخصوصية والأمان (قانون 151 لسنة 2020):" : "Privacy & Safety Guidance:"}</strong>
            <p className="mt-1">
              {isRtl
                ? "يُحظر كتابة أرقام بطاقات الرقم القومي أو أرقام الحسابات البنكية السرية في نص الشكوى. يقوم نظام مُرافِق تلقائياً بتنقيح أي أرقام هواتف أو بيانات وطنية كطبقة حماية أولى لضمان سرية البيانات."
                : "Do not include national IDs, credit cards, or personal mobile phones in the narrative. Murafiq automatically redacts sensitive patterns via Layer 1 PII filtering."}
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {isRtl ? "سرد وقائع المشكلة أو الشكوى بالتفصيل (50 حرفاً كحد أدنى):" : "Description of Issue (min 50 characters):"}
            </label>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isRtl
                  ? `يرجى كتابة تسلسل الوقائع بوضوح وموضوعية، مع ذكر التواريخ وأي تفاصيل مهمة تخص تعاملك مع ${selectedEntity.name}...`
                  : "Provide a clear chronological factual description..."
              }
              className="w-full rounded-xl border border-slate-300 p-3.5 text-sm focus:border-sky-800 focus:outline-none"
            />
            <div className="mt-1 flex justify-between text-xs text-slate-400">
              <span>{description.length} / 50 حرفاً على الأقل</span>
              {description.length < 50 && (
                <span className="text-amber-700 font-medium">
                  {isRtl ? `متبقي ${50 - description.length} حرفاً` : `${50 - description.length} chars remaining`}
                </span>
              )}
            </div>
          </div>

          {/* Desired Outcome */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {isRtl ? "المطلب المرجو أو النتيجة المرجوة لحل النزاع:" : "Desired Resolution Outcome:"}
            </label>
            <textarea
              rows={3}
              value={desiredOutcome}
              onChange={(e) => setDesiredOutcome(e.target.value)}
              placeholder={
                isRtl
                  ? "ما هو الإجراء أو التعويض أو التعديل الذي تطلبه من إدارة الجهة لإنهاء الشكوى ودياً؟"
                  : "What action or remedy would successfully resolve this issue?"
              }
              className="w-full rounded-xl border border-slate-300 p-3.5 text-sm focus:border-sky-800 focus:outline-none"
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="rounded-xl border border-slate-300 px-6 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              {isRtl ? "→ رجوع" : "← Back"}
            </button>
            <button
              type="button"
              disabled={description.length < 50 || desiredOutcome.length < 5}
              onClick={() => setCurrentStep(3)}
              className="rounded-xl bg-sky-800 px-8 py-3 font-semibold text-white hover:bg-sky-900 disabled:opacity-50 transition shadow-sm"
            >
              {isRtl ? "المتابعة للتحقق والخصوصية ←" : "Continue to Verification →"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Sensitive Identifier, Privacy, Phone OTP & Consent */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {/* 3.1 Sector-Tailored Sensitive Reference Identifier */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <label className="block text-sm font-bold text-slate-800 mb-1">
              {secConfig.identifierLabel_ar}
            </label>
            <p className="text-xs text-slate-500 mb-2.5">{secConfig.guidance_ar}</p>
            <input
              type="text"
              value={identifierValue}
              onChange={(e) => handleIdentifierChange(e.target.value)}
              placeholder={secConfig.identifierPlaceholder_ar}
              className={`w-full rounded-xl border p-3 text-sm focus:outline-none bg-white font-mono ${
                identifierError
                  ? "border-red-500 focus:border-red-600 bg-red-50/30"
                  : "border-slate-300 focus:border-sky-800"
              }`}
            />
            {identifierError && (
              <p className="text-xs text-red-600 mt-1.5 font-bold leading-relaxed">
                {identifierError}
              </p>
            )}
            <span className="text-[10px] text-slate-400 block mt-1">
              {isRtl
                ? "🔒 يُحفظ هذا الرقم في طبقة مشفرة منفصلة ومعزولة (AES-256) ولا يُعرض إلا في شكل رمز محجوب (Masked Token)."
                : "🔒 This identifier is physically isolated and encrypted (AES-256-GCM)."}
            </span>
          </div>

          {/* 3.2 Privacy Default = STRICTLY_PRIVATE */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {isRtl ? "مستوى الخصوصية المعتمد:" : "Privacy Default Level:"}
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-sky-800/40 bg-sky-50/20 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value={VisibilityLevelEnum.STRICTLY_PRIVATE}
                  checked={visibility === VisibilityLevelEnum.STRICTLY_PRIVATE}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="mt-1 text-sky-800"
                />
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    {isRtl ? "خاص تماماً (الافتراضي والمعتمد)" : "Strictly Private (Approved Default)"}
                    <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800">
                      {isRtl ? "مهلة 7 أيام خاصة" : "7-Day Private Grace"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {isRtl
                      ? `لا تظهر القضية إلا للمسؤول المصرح له في ${selectedEntity.name} ومقدم الطلب. تُمنح الجهة مهلة 7 أيام لحل المشكلة ودياً قبل أي إجراء آخر.`
                      : "Visible solely to the authorized leadership and applicant. A 7-day private window is granted to resolve amicably."}
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="visibility"
                  value={VisibilityLevelEnum.ANONYMOUS_PUBLIC}
                  checked={visibility === VisibilityLevelEnum.ANONYMOUS_PUBLIC}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="mt-1 text-sky-800"
                />
                <div>
                  <div className="font-bold text-slate-800">
                    {isRtl ? "عام دون كشف الهوية" : "Anonymous Public"}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {isRtl
                      ? "إخفاء تام لبيانات صاحب الشأن الشخصية. يُنشر الملخص المنقح فقط بعد مراجعة المشرفين وانتهاء مهلة المراجعة."
                      : "Complete masking of personal identity. Only the sanitized summary is published post-grace period."}
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* 3.3 Egyptian Phone Verification */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {isRtl ? "رقم الهاتف المصري المعتمد (SMS OTP):" : "Verified Egyptian Mobile Phone (SMS OTP):"}
            </label>
            {verifiedPhone ? (
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800">
                <span>
                  {isRtl ? "تم التحقق من الرقم:" : "Verified Mobile:"}{" "}
                  <strong className="dir-ltr font-mono">{verifiedPhone}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setIsPhoneModalOpen(true)}
                  className="text-xs text-sky-800 underline hover:text-opacity-80"
                >
                  {isRtl ? "تغيير الرقم" : "Change Phone"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsPhoneModalOpen(true)}
                className="w-full rounded-xl border-2 border-dashed border-sky-600 bg-sky-50/40 p-5 text-center font-bold text-sky-800 hover:bg-sky-50 transition"
              >
                + {isRtl ? "تحقق من رقم الهاتف المصري عبر رسالة SMS (مطلوب)" : "Verify Egyptian Phone via SMS OTP (Required)"}
              </button>
            )}
          </div>

          {/* 3.4 Law 151/2020 Consent Checkbox */}
          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 leading-relaxed">
            <input
              type="checkbox"
              id="consent"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-sky-800"
            />
            <label htmlFor="consent" className="cursor-pointer">
              {isRtl
                ? "أقر وأوافق صراحةً على معالجة وتوثيق البيانات المقدمة وفقاً لأحكام قانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020 ومعايير منصة مُرافِق للتسوية والوساطة."
                : "I explicitly consent to data processing under Egyptian Personal Data Protection Law No. 151 of 2020 and Murafiq platform resolution guidelines."}
            </label>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="rounded-xl border border-slate-300 px-6 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              {isRtl ? "→ رجوع" : "← Back"}
            </button>
            <button
              type="button"
              disabled={isSubmitting || !verifiedPhone || !consentGiven || !!identifierError}
              onClick={handleSubmit}
              className="rounded-xl bg-sky-800 px-9 py-3 font-semibold text-white hover:bg-sky-900 disabled:opacity-50 transition shadow-sm"
            >
              {isSubmitting
                ? isRtl
                  ? "جاري المعالجة الآمنة وتوثيق الحالة..."
                  : "Securing & Submitting..."
                : isRtl
                ? "تأكيد وإرسال الحالة رسمياً للجهة"
                : "Submit Case Officially"}
            </button>
          </div>
        </div>
      )}

      {/* Phone OTP Verification Modal */}
      <PhoneVerificationModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        onVerified={(phone) => {
          setVerifiedPhone(phone);
          setIsPhoneModalOpen(false);
        }}
        locale={lang}
      />
    </div>
  );
}
