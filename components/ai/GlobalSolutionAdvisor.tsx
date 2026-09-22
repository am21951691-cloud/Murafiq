"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SectorType } from "@/types/database";
import type {
  CitizenOutcomeAdvice,
  InstitutionActionPlanAdvice,
  AdvisorMode,
} from "@/lib/ai/solution-advisor-service";

const SECTORS_LIST: Array<{ key: SectorType; label: string; icon: string }> = [
  { key: "EDUCATION_SCHOOLS", label: "المدارس والتعليم قبل الجامعي", icon: "🏫" },
  { key: "HIGHER_EDUCATION", label: "الجامعات والتعليم العالي", icon: "🎓" },
  { key: "GOVERNMENT_PUBLIC", label: "الخدمات الحكومية والهيئات", icon: "🏛️" },
  { key: "COMMERCIAL_COMPANIES", label: "الشركات والخدمات التجارية", icon: "🏢" },
  { key: "HEALTHCARE_MEDICAL", label: "المنشآت الصحية والمستشفيات", icon: "🏥" },
];

export function GlobalSolutionAdvisor() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AdvisorMode>("CITIZEN_OUTCOME");
  const [sector, setSector] = useState<SectorType>("COMMERCIAL_COMPANIES");
  const [category, setCategory] = useState("نزاع مالي / استرجاع / جودة خدمة");
  const [description, setDescription] = useState("");
  const [entityName, setEntityName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [citizenAdvice, setCitizenAdvice] = useState<CitizenOutcomeAdvice | null>(null);
  const [institutionAdvice, setInstitutionAdvice] = useState<InstitutionActionPlanAdvice | null>(null);

  const isCitizen = mode === "CITIZEN_OUTCOME";

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.sector) {
        setSector(customEvent.detail.sector);
      }
      if (customEvent.detail?.mode) {
        setMode(customEvent.detail.mode);
      }
      setIsOpen(true);
    };

    window.addEventListener("open-murafiq-assistant", handleOpen);
    return () => window.removeEventListener("open-murafiq-assistant", handleOpen);
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || description.trim().length < 15) {
      setError("يرجى كتابة وصف موجز للمشكلة لا يقل عن 15 حرفاً لتمكين الذكاء الاصطناعي من التحليل بدقة.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setCitizenAdvice(null);
    setInstitutionAdvice(null);

    try {
      const res = await fetch("/api/ai/solution-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          sector,
          category,
          description,
          entityName: entityName.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل الاتصال بمستشار الحلول الذكي");
      }

      if (isCitizen) {
        setCitizenAdvice(data.advice as CitizenOutcomeAdvice);
      } else {
        setInstitutionAdvice(data.advice as InstitutionActionPlanAdvice);
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء استخراج التحليل والمقترح.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCitizenAdvice(null);
    setInstitutionAdvice(null);
    setDescription("");
    setError(null);
  };

  return (
    <>
      {/* Floating Action Trigger Button (Bottom Right) */}
      <div className="fixed bottom-5 right-5 z-40 font-arabic" dir="rtl">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-3 rounded-full bg-linear-to-r from-amber-600 via-amber-700 to-amber-800 p-3.5 pr-4 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-amber-400"
            aria-label="افتح مستشار الحلول القانونية والخطط"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-xl backdrop-blur-xs">
              ⚖️
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-xs font-black tracking-wide text-amber-100">
                مستشار الحلول الذكي (AI)
              </div>
              <div className="text-[11px] font-bold text-white opacity-95">
                صياغة المطالب • خطط RQS
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Main Full-Screen Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-6 backdrop-blur-sm animate-in fade-in font-arabic" dir="rtl">
          <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-5 sm:p-8 shadow-2xl border-2 border-slate-300 text-slate-950 text-right">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white text-2xl shadow-sm">
                  ⚖️
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-slate-950">
                      مستشار الحلول وصياغة خطط المعالجة
                    </h2>
                    <span className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-950">
                      Muse Glimmer 30B
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">
                    أداة تحليلية مستقلة لصياغة المطالب الودية ودعم القرارات المؤسسية وفق اللوائح المصرية
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border-2 border-slate-200 p-2 text-slate-700 hover:bg-slate-100 hover:text-slate-950 transition font-black text-sm"
                aria-label="إغلاق"
              >
                ✕
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5 border border-slate-300">
              <button
                type="button"
                onClick={() => {
                  setMode("CITIZEN_OUTCOME");
                  handleReset();
                }}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black transition ${
                  isCitizen
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-slate-800 hover:bg-slate-200"
                }`}
              >
                <span>👤</span>
                <span>المواطن والمستهلك (صياغة مطلب قانوني)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("INSTITUTION_ACTION_PLAN");
                  handleReset();
                }}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black transition ${
                  !isCitizen
                    ? "bg-sky-800 text-white shadow-sm"
                    : "text-slate-800 hover:bg-slate-200"
                }`}
              >
                <span>🏛️</span>
                <span>المؤسسة والجهة (خطة معالجة RQS $\ge 90$)</span>
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sector Selector */}
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1.5">
                    1. القطاع المعني:
                  </label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value as SectorType)}
                    className="w-full rounded-xl border-2 border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-slate-950 focus:border-amber-600 focus:outline-none"
                  >
                    {SECTORS_LIST.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.icon} {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Entity Name (Optional) */}
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1.5">
                    2. اسم الجهة أو المؤسسة المشكو ضدها (اختياري):
                  </label>
                  <input
                    type="text"
                    value={entityName}
                    onChange={(e) => setEntityName(e.target.value)}
                    placeholder="مثال: مدرسة الأمل، شركة اتصالات، مستشفى السلام..."
                    className="w-full rounded-xl border-2 border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-950 placeholder:text-slate-500 focus:border-amber-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Dispute Description */}
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1.5">
                  {isCitizen
                    ? "3. اشرح ما حدث معك وما هو الضرر الذي تعرضت له:"
                    : "3. ملخص الشكوى الواردة إلى إدارتكم لبناء خطة المعالجة:"}
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    isCitizen
                      ? "مثال: اشتريت هاتف وظهر به عيب مصنعي في الشاشة خلال 10 أيام من الشراء ورفضت الشركة الاسترجاع، أو تم فرض زيادة مصروفات على ابني بالمدرسة بالمخالفة للائحة..."
                      : "مثال: تقدم ولي أمر بشكوى عن تأخر الحافلة المدرسية والتعدي اللفظي من المشرف، ونريد صياغة خطة معالجة متدرجة تضمن محاسبة المقصر وتفادي تكرار الخطأ..."
                  }
                  className="w-full rounded-2xl border-2 border-slate-300 bg-white p-3.5 text-xs sm:text-sm font-medium text-slate-950 placeholder:text-slate-500 focus:border-amber-600 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-xl border-2 border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  إعادة ضبط
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-xl bg-linear-to-r from-amber-600 to-amber-700 px-6 py-2.5 text-xs font-black text-white shadow-md hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 transition flex items-center gap-2"
                >
                  <span>✨</span>
                  <span>{isLoading ? "جاري التحليل واستخراج الحل..." : "تحليل وصياغة الحل الذكي"}</span>
                </button>
              </div>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mt-4 rounded-xl bg-red-100 border-2 border-red-300 p-3.5 text-xs font-bold text-red-950">
                {error}
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="my-8 rounded-2xl bg-amber-50 border-2 border-amber-300 p-6 text-center space-y-2">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white animate-spin text-xl">
                  ⚙️
                </div>
                <h4 className="text-sm font-black text-slate-950">
                  جاري تشغيل محرك Muse Glimmer 30B لفحص النصوص واللوائح المصرية...
                </h4>
                <p className="text-xs font-bold text-slate-700">
                  (قانون حماية المستهلك 181، لائحة الانضباط 187، قانون الجامعات 49، معايير الرقابة الصحية GAHAR)
                </p>
              </div>
            )}

            {/* 1. Citizen Outcome Output */}
            {isCitizen && citizenAdvice && !isLoading && (
              <div className="mt-6 space-y-4 border-t-2 border-slate-200 pt-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-950 flex items-center gap-1.5">
                    <span>💡</span> المطلب العادل المقترح (صياغة رسمية هادئة وحازمة):
                  </h3>
                  <span className="rounded-full bg-amber-200 border border-amber-400 px-3 py-0.5 text-xs font-black text-amber-950">
                    {citizenAdvice.suggestedRemedyType}
                  </span>
                </div>

                <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-4">
                  <p className="text-sm sm:text-base leading-relaxed text-slate-950 font-bold">
                    {citizenAdvice.outcomeSuggestion}
                  </p>
                </div>

                {/* Statutory Citation */}
                <div className="rounded-2xl border-2 border-sky-300 bg-sky-50 p-4 space-y-1.5">
                  <div className="text-xs font-black text-sky-950 flex items-center gap-1.5">
                    <span>📜</span> السند القانوني واللائحي المعتمد:
                  </div>
                  <div className="text-sm font-black text-sky-900">
                    {citizenAdvice.statutoryGrounds.lawName} — {citizenAdvice.statutoryGrounds.articleNumber}
                  </div>
                  <p className="text-xs font-bold text-slate-800 leading-relaxed">
                    {citizenAdvice.statutoryGrounds.summary}
                  </p>
                  <div className="text-[11px] font-bold text-slate-600">
                    الجهة المصدرة: {citizenAdvice.statutoryGrounds.issuingAuthority}
                  </div>
                </div>

                {/* Steps */}
                <div className="rounded-2xl border-2 border-slate-300 bg-white p-4">
                  <div className="text-xs font-black text-slate-950 mb-2">
                    الخطوات المقترحة لدعم حقك ودياً:
                  </div>
                  <ul className="space-y-1.5 text-xs font-bold text-slate-800 list-disc list-inside">
                    {citizenAdvice.recommendedSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>

                {/* Direct CTA to submit case */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl bg-slate-900 p-4 text-white">
                  <div>
                    <div className="text-xs font-black text-amber-300">
                      هل تريد تقديم هذه الشكوى الآن؟
                    </div>
                    <div className="text-[11px] text-slate-200 font-medium">
                      سيتم فتح مهلة الـ 7 أيام للمراجعة الخاصة وإخطار إدارة الجهة فوراً وبسرية تامة.
                    </div>
                  </div>
                  <Link
                    href={`/cases/new?sector=${sector}`}
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400 transition shadow-sm whitespace-nowrap"
                  >
                    الانتقال لتقديم الشكوى بهذا المطلب ←
                  </Link>
                </div>
              </div>
            )}

            {/* 2. Institution Action Plan Output */}
            {!isCitizen && institutionAdvice && !isLoading && (
              <div className="mt-6 space-y-4 border-t-2 border-slate-200 pt-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-950 flex items-center gap-1.5">
                    <span>🏛️</span> بيان التعهد المؤسسي وخطة العمل:
                  </h3>
                  <span className="rounded-full bg-emerald-200 border-2 border-emerald-500 px-3 py-1 text-xs font-black text-emerald-950">
                    مؤشر جودة الرد المتوقع: {institutionAdvice.estimatedRqs} / 100
                  </span>
                </div>

                <div className="rounded-2xl border-2 border-sky-300 bg-sky-50 p-4">
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-950 font-bold">
                    {institutionAdvice.officialStatement}
                  </p>
                </div>

                {/* Milestones */}
                <div className="rounded-2xl border-2 border-slate-300 bg-white p-4">
                  <div className="text-xs font-black text-slate-950 mb-3 flex items-center justify-between">
                    <span>مراحل الخطة المتدرجة (3 مراحل تنفيذية):</span>
                    <span className="text-[11px] font-bold text-slate-600">
                      المرجعية: {institutionAdvice.statutoryBasis}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {institutionAdvice.milestones.map((m, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border-2 border-slate-200 p-3 bg-slate-50 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="flex-1">
                          <div className="font-black text-slate-950">
                            {idx + 1}. {m.title}
                          </div>
                          <div className="text-[11px] font-bold text-slate-700 mt-0.5">
                            المخرج / الإثبات: {m.deliverable}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-bold">
                          <span className="rounded-md bg-slate-200 border border-slate-300 px-2 py-0.5 text-slate-950">
                            {m.owner_role}
                          </span>
                          <span className="rounded-md bg-sky-200 border border-sky-300 px-2 py-0.5 text-sky-950 font-mono">
                            📅 {m.due_date}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direct CTA to Portal */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl bg-sky-950 p-4 text-white">
                  <div>
                    <div className="text-xs font-black text-sky-300">
                      تطبيق هذه الخطة في لوحة تحكم المؤسسة:
                    </div>
                    <div className="text-[11px] text-slate-200 font-medium">
                      يمكنك اعتماد هذه الخطة مباشرة للحالات المفتوحة في مهلة الـ 7 أيام لرفع مؤشر BARS.
                    </div>
                  </div>
                  <Link
                    href="/portal/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-black text-white hover:bg-emerald-600 transition shadow-sm whitespace-nowrap"
                  >
                    الانتقال لبوابة المؤسسات وإدخال الخطة ←
                  </Link>
                </div>
              </div>
            )}

            {/* Modal Bottom Close */}
            <div className="mt-6 flex items-center justify-end border-t-2 border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border-2 border-slate-300 px-6 py-2 text-xs font-black text-slate-800 hover:bg-slate-100 transition"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
