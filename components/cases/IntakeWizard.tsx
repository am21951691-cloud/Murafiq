"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CaseCategoryEnum, VisibilityLevelEnum } from "@/types/database";
import { PhoneVerificationModal } from "./PhoneVerificationModal";

interface InstitutionOption {
  id: string;
  name_ar: string;
  name_en: string;
  governorate: string;
  type: string;
}

const SAMPLE_INSTITUTIONS: InstitutionOption[] = [
  {
    id: "00000000-0000-0000-0000-000000000010",
    name_ar: "مدرسة القاهرة التجريبية الرسمية للغات",
    name_en: "Cairo Official Experimental Language School",
    governorate: "القاهرة (مدينة نصر)",
    type: "رسمية تجريبية",
  },
  {
    id: "00000000-0000-0000-0000-000000000020",
    name_en: "Nile Egyptian International School - 6th of October",
    name_ar: "مدرسة النيل المصرية الدولية — فرع 6 أكتوبر",
    governorate: "الجيزة (أكتوبر)",
    type: "دولية حكومية",
  },
  {
    id: "00000000-0000-0000-0000-000000000030",
    name_ar: "مدرسة السلام الخاصة للغات",
    name_en: "El Salam Private Language School",
    governorate: "أسيوط",
    type: "خاصة لغات",
  },
];

interface IntakeWizardProps {
  initialInstitutionId?: string;
  locale?: "ar" | "en";
}

export function IntakeWizard({
  initialInstitutionId = "00000000-0000-0000-0000-000000000010",
  locale: initialLocale = "ar",
}: IntakeWizardProps) {
  const [lang, setLang] = useState<"ar" | "en">(initialLocale);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState(initialInstitutionId);
  const [category, setCategory] = useState<string>(CaseCategoryEnum.TEACHER_COMMUNICATION);
  const [subcategory, setSubcategory] = useState(
    lang === "ar" ? "التواصل مع المعلمين وإدارة المرحلة" : "Weekly teacher communication"
  );
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

  const selectedInstitution =
    SAMPLE_INSTITUTIONS.find((i) => i.id === selectedInstitutionId) || SAMPLE_INSTITUTIONS[0];

  const handleSubmit = async () => {
    if (!verifiedPhone) {
      setIsPhoneModalOpen(true);
      return;
    }
    if (description.length < 50) {
      setError(
        lang === "ar"
          ? "يرجى كتابة وصف تفصيلي لا يقل عن 50 حرفاً لضمان دراسة القضية بدقة."
          : "Please enter a detailed description of at least 50 characters."
      );
      return;
    }
    if (desiredOutcome.length < 5) {
      setError(
        lang === "ar"
          ? "يرجى توضيح النتيجة المرجوة أو الحل المطلوب من إدارة المدرسة."
          : "Please describe your desired outcome."
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
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
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit case");
      }
      setSubmissionResult(data.case);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRtl = lang === "ar";

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
          {isRtl ? "تم تسجيل القضية بنجاح" : "Case Registered Successfully"}
        </h2>
        <p className="text-slate-600 mb-6">
          {isRtl ? "رقم المرجع الرسمي:" : "Official Reference:"}{" "}
          <span className="font-mono font-bold text-civic-navy bg-white px-3 py-1 rounded border border-emerald-200">
            {submissionResult.reference_number}
          </span>
        </p>

        <div className="rounded-xl bg-white p-5 border border-emerald-100 text-sm space-y-3 mb-6 text-slate-700 shadow-sm">
          <div className="flex items-center justify-between border-b pb-2">
            <strong>{isRtl ? "الحالة التشغيلية:" : "Lifecycle Status:"}</strong>
            <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-800">
              {isRtl ? "مهلة المراجعة الخاصة (7 أيام)" : "Private Grace (7 Days)"}
            </span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <strong>{isRtl ? "مستوى الخصوصية:" : "Privacy Level:"}</strong>
            <span className="font-semibold text-civic-navy">
              {submissionResult.visibility === VisibilityLevelEnum.STRICTLY_PRIVATE
                ? isRtl
                  ? "سري بالكامل (STRICTLY_PRIVATE)"
                  : "Strictly Private"
                : isRtl
                ? "عام دون كشف الهوية"
                : "Anonymous Public"}
            </span>
          </div>
          <div>
            <strong className="block mb-1">{isRtl ? "الوصف المنقح أمنياً:" : "Sanitized Description:"}</strong>
            <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 border border-slate-200">
              {submissionResult.sanitized_description}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            href="/"
            className="inline-block rounded-xl bg-civic-navy px-6 py-2.5 font-semibold text-white hover:bg-opacity-90 text-center transition"
          >
            {isRtl ? "العودة للرئيسية" : "Return to Home"}
          </Link>
          <button
            type="button"
            onClick={() => {
              setSubmissionResult(null);
              setCurrentStep(1);
              setDescription("");
              setDesiredOutcome("");
            }}
            className="inline-block rounded-xl border border-slate-300 px-6 py-2.5 font-semibold text-slate-700 hover:bg-white transition"
          >
            {isRtl ? "تسجيل قضية أخرى" : "Submit Another Case"}
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
      {/* Header & Locale Switcher */}
      <div className="mb-6 flex items-start justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="inline-block rounded-md bg-teal-50 px-2.5 py-1 text-xs font-bold text-civic-teal mb-2">
            {isRtl ? "المسار الآمن للشكاوى والوساطة" : "Secure Educational Resolution Intake"}
          </span>
          <h1 className="text-2xl font-bold text-civic-navy">
            {isRtl ? "تسجيل قضية جديدة" : "New Case Intake"} —{" "}
            <span className="text-civic-teal">
              {isRtl ? selectedInstitution.name_ar : selectedInstitution.name_en}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isRtl
              ? "منصة مُرافِق — توثيق وحل المشكلات التعليمية بمهنية وحيادية تامة"
              : "Murafiq Platform — Professional and neutral education resolution platform"}
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
            currentStep === 1 ? "text-civic-navy" : "text-slate-400"
          }`}
        >
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              currentStep === 1 ? "bg-civic-navy text-white" : "bg-slate-100 text-slate-500"
            }`}
          >
            1
          </span>
          <span>{isRtl ? "المدرسة والتصنيف" : "School & Category"}</span>
        </div>

        <div
          className={`flex items-center gap-2 font-semibold ${
            currentStep === 2 ? "text-civic-navy" : "text-slate-400"
          }`}
        >
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              currentStep === 2 ? "bg-civic-navy text-white" : "bg-slate-100 text-slate-500"
            }`}
          >
            2
          </span>
          <span>{isRtl ? "الوقائع والأثر المطلوب" : "Narrative & Outcome"}</span>
        </div>

        <div
          className={`flex items-center gap-2 font-semibold ${
            currentStep === 3 ? "text-civic-navy" : "text-slate-400"
          }`}
        >
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              currentStep === 3 ? "bg-civic-navy text-white" : "bg-slate-100 text-slate-500"
            }`}
          >
            3
          </span>
          <span>{isRtl ? "الخصوصية والتحقق" : "Privacy & Verify"}</span>
        </div>
      </div>

      {/* Step 1: School, Category, Subcategory, Impact Rating */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Institution Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {isRtl ? "المؤسسة التعليمية / المدرسة" : "Educational Institution / School"}
            </label>
            <select
              value={selectedInstitutionId}
              onChange={(e) => setSelectedInstitutionId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-civic-navy focus:outline-none bg-slate-50/50"
            >
              {SAMPLE_INSTITUTIONS.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {isRtl ? inst.name_ar : inst.name_en} — ({inst.governorate})
                </option>
              ))}
            </select>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {isRtl ? "التصنيف الرئيسي للقضية" : "Primary Category"}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-civic-navy focus:outline-none"
            >
              <option value={CaseCategoryEnum.TEACHER_COMMUNICATION}>
                {isRtl ? "التواصل مع المعلمين وإدارة المدرسة" : "Teacher Communication & Management"}
              </option>
              <option value={CaseCategoryEnum.ACADEMIC_CURRICULUM}>
                {isRtl ? "المناهج وجودة التدريس" : "Academic Curriculum & Teaching Quality"}
              </option>
              <option value={CaseCategoryEnum.STUDENT_BEHAVIOR_BULLYING}>
                {isRtl ? "سلوك الطلاب والتنمر والسلامة" : "Student Behavior, Bullying & Safety"}
              </option>
              <option value={CaseCategoryEnum.FACILITIES_HEALTH_SAFETY}>
                {isRtl ? "المرافق والنظافة والصحة" : "Facilities, Hygiene & Health"}
              </option>
              <option value={CaseCategoryEnum.TRANSPORTATION_BUSES}>
                {isRtl ? "حافلات المدرسة وخدمات النقل" : "School Transportation & Buses"}
              </option>
              <option value={CaseCategoryEnum.TUITION_FEES_REFUNDS}>
                {isRtl ? "المصروفات والرسوم المدرسية" : "Tuition Fees & Refunds"}
              </option>
              <option value={CaseCategoryEnum.ADMINISTRATION_DISCIPLINE}>
                {isRtl ? "الإدارة والانضباط الإداري" : "Administration & Discipline"}
              </option>
            </select>
          </div>

          {/* Subcategory */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {isRtl ? "التصنيف الفرعي المحدد" : "Specific Subcategory"}
            </label>
            <input
              type="text"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              placeholder={isRtl ? "مثال: تأخر الرد على الملاحظات الأسبوعية" : "e.g., Delayed feedback on weekly reports"}
              className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-civic-navy focus:outline-none"
            />
          </div>

          {/* Initial Experience Impact Rating (R_exp: 1 to 5) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {isRtl
                ? "تقييم أثر التجربة الأولية على الطالب والأسرة (1 إلى 5) — R_exp"
                : "Initial Experience Impact Rating (1 to 5) — R_exp"}
            </label>
            <div className="flex gap-3 items-center">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setRating(val)}
                  className={`h-12 w-12 rounded-xl border-2 font-bold text-base transition ${
                    rating === val
                      ? "border-civic-navy bg-civic-navy text-white shadow-sm"
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
              className="rounded-xl bg-civic-navy px-8 py-3 font-semibold text-white hover:bg-opacity-90 transition shadow-sm"
            >
              {isRtl ? "المتابعة لكتابة الوقائع ←" : "Continue to Narrative →"}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Description & Desired Outcome */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* PII Defense Warning Banner */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 leading-relaxed">
            <strong>{isRtl ? "إرشادات حماية الخصوصية والأمان:" : "Privacy & Safety Guidance:"}</strong>
            <p className="mt-1">
              {isRtl
                ? "يُحظر كتابة أرقام بطاقات الرقم القومي أو أرقام الهواتف أو أسماء الأطفال القُصّر في نص الشكوى. يقوم نظام مُرافِق تلقائياً بتنقيح أي أرقام هواتف أو بيانات وطنية كطبقة حماية أولى لضمان سرية البيانات."
                : "Do not include national IDs, phone numbers, or names of minor students in the text. Murafiq automatically sanitizes sensitive identifiers via Layer 1 PII filtering."}
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {isRtl ? "سرد وقائع المشكلة أو الشكوى (50 حرفاً كحد أدنى)" : "Description of Issue (min 50 characters)"}
            </label>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isRtl
                  ? "يرجى كتابة تسلسل الوقائع بوضوح وموضوعية، مع ذكر التواريخ والتفاصيل المهمة..."
                  : "Provide a clear chronological factual description..."
              }
              className="w-full rounded-xl border border-slate-300 p-3.5 text-sm focus:border-civic-navy focus:outline-none"
            />
            <div className="text-left text-xs text-slate-400 mt-1 font-mono">
              {description.length} / 2000
            </div>
          </div>

          {/* Desired Outcome */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {isRtl ? "النتيجة المرجوة أو الحل المطلوب من إدارة المدرسة" : "Desired Outcome / Requested Resolution"}
            </label>
            <textarea
              rows={3}
              value={desiredOutcome}
              onChange={(e) => setDesiredOutcome(e.target.value)}
              placeholder={
                isRtl
                  ? "مثال: عقد اجتماع توضيحي مع إدارة المرحلة وتحديد خطة تعويضية للدروس الفائتة..."
                  : "e.g., A formal review meeting and an academic compensation plan..."
              }
              className="w-full rounded-xl border border-slate-300 p-3.5 text-sm focus:border-civic-navy focus:outline-none"
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
              className="rounded-xl bg-civic-navy px-8 py-3 font-semibold text-white hover:bg-opacity-90 disabled:opacity-50 transition shadow-sm"
            >
              {isRtl ? "المتابعة للتحقق والخصوصية ←" : "Continue to Verification →"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Privacy, Phone Verification, Law 151 Consent */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {/* Privacy Default = STRICTLY_PRIVATE */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {isRtl ? "مستوى الخصوصية المعتمد" : "Privacy Default Level"}
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-civic-navy/40 bg-teal-50/20 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value={VisibilityLevelEnum.STRICTLY_PRIVATE}
                  checked={visibility === VisibilityLevelEnum.STRICTLY_PRIVATE}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="mt-1 text-civic-navy"
                />
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    {isRtl ? "خاص تماماً (الافتراضي والمعتمد)" : "Strictly Private (Approved Default)"}
                    <span className="rounded bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                      {isRtl ? "مهلة 7 أيام خاصة" : "7-Day Private Grace"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {isRtl
                      ? "لا تظهر القضية إلا لإدارة المدرسة المصرح لها وولي الأمر. تُمنح المدرسة مهلة 7 أيام لحل المشكلة ودياً قبل أي إجراء آخر."
                      : "Visible solely to the authorized school leadership and parent. A 7-day private window is granted to resolve amicably."}
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
                  className="mt-1 text-civic-navy"
                />
                <div>
                  <div className="font-bold text-slate-800">
                    {isRtl ? "عام دون كشف الهوية" : "Anonymous Public"}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {isRtl
                      ? "إخفاء تام لبيانات ولي الأمر الشخصية. يُنشر الملخص المنقح فقط بعد مراجعة المشرفين وانتهاء مهلة المراجعة."
                      : "Complete masking of parent identity. Only the sanitized summary is published post-grace period."}
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Egyptian Phone Verification */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {isRtl ? "رقم الهاتف المصري المعتمد (SMS OTP)" : "Verified Egyptian Mobile Phone (SMS OTP)"}
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
                  className="text-xs text-civic-navy underline hover:text-opacity-80"
                >
                  {isRtl ? "تغيير الرقم" : "Change Phone"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsPhoneModalOpen(true)}
                className="w-full rounded-xl border-2 border-dashed border-civic-teal bg-teal-50/40 p-5 text-center font-semibold text-civic-teal hover:bg-teal-50 transition"
              >
                + {isRtl ? "تحقق من رقم الهاتف المصري عبر رسالة SMS (مطلوب)" : "Verify Egyptian Phone via SMS OTP (Required)"}
              </button>
            )}
          </div>

          {/* Law 151/2020 Consent Checkbox */}
          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 leading-relaxed">
            <input
              type="checkbox"
              id="consent"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-civic-navy"
            />
            <label htmlFor="consent" className="cursor-pointer">
              {isRtl
                ? "أقر وأوافق صراحةً على معالجة وتوثيق البيانات المقدمة وفقاً لأحكام قانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020 ومعايير منصة مُرافِق."
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
              disabled={isSubmitting || !verifiedPhone || !consentGiven}
              onClick={handleSubmit}
              className="rounded-xl bg-civic-teal px-9 py-3 font-semibold text-white hover:bg-opacity-90 disabled:opacity-50 transition shadow-sm"
            >
              {isSubmitting
                ? isRtl
                  ? "جاري المعالجة الآمنة..."
                  : "Securing & Submitting..."
                : isRtl
                ? "تأكيد وإرسال القضية رسمياً"
                : "Submit Case Officially"}
            </button>
          </div>
        </div>
      )}

      <PhoneVerificationModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        onVerified={(phone) => setVerifiedPhone(phone)}
      />
    </div>
  );
}
