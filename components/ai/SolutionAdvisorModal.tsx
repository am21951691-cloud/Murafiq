"use client";

import React, { useState } from "react";
import { SectorType } from "@/types/database";
import type {
  CitizenOutcomeAdvice,
  InstitutionActionPlanAdvice,
  AdvisorMode,
} from "@/lib/ai/solution-advisor-service";

interface SolutionAdvisorProps {
  mode: AdvisorMode;
  sector: SectorType;
  category: string;
  subcategory?: string;
  description: string;
  entityName?: string;
  caseReference?: string;
  onApplyOutcome?: (outcomeText: string) => void;
  onApplyActionPlan?: (plan: {
    officialStatement: string;
    milestones: Array<{
      title: string;
      owner_role: string;
      due_date: string;
      deliverable: string;
    }>;
  }) => void;
}

export function SolutionAdvisorWidget({
  mode,
  sector,
  category,
  subcategory,
  description,
  entityName,
  caseReference,
  onApplyOutcome,
  onApplyActionPlan,
}: SolutionAdvisorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [citizenAdvice, setCitizenAdvice] = useState<CitizenOutcomeAdvice | null>(null);
  const [institutionAdvice, setInstitutionAdvice] = useState<InstitutionActionPlanAdvice | null>(null);
  const [applied, setApplied] = useState(false);

  const isCitizen = mode === "CITIZEN_OUTCOME";

  const handleFetchAdvice = async () => {
    setIsOpen(true);
    setIsLoading(true);
    setError(null);
    setApplied(false);

    try {
      const res = await fetch("/api/ai/solution-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          sector,
          category,
          subcategory,
          description,
          entityName,
          caseReference,
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
      setError(err.message || "حدث خطأ أثناء استخراج المقترح");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (isCitizen && citizenAdvice && onApplyOutcome) {
      onApplyOutcome(citizenAdvice.outcomeSuggestion);
      setApplied(true);
      setTimeout(() => setIsOpen(false), 900);
    } else if (!isCitizen && institutionAdvice && onApplyActionPlan) {
      onApplyActionPlan({
        officialStatement: institutionAdvice.officialStatement,
        milestones: institutionAdvice.milestones,
      });
      setApplied(true);
      setTimeout(() => setIsOpen(false), 900);
    }
  };

  return (
    <div className="font-arabic" dir="rtl">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleFetchAdvice}
        disabled={isCitizen && (!description || description.trim().length < 20)}
        className="inline-flex items-center gap-2 rounded-xl bg-amber-600 bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-black text-white shadow-xs hover:bg-amber-700 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 transition border border-amber-400"
      >
        <span>✨</span>
        <span>
          {isCitizen
            ? "اقتراح حل قانوني ومطلب عادل بالذكاء الاصطناعي"
            : "اقتراح خطة معالجة مؤسسية ذكية (RQS ≥ 90)"}
        </span>
      </button>

      {/* Modal / Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in font-arabic" dir="rtl">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl border-2 border-slate-300 text-slate-950 text-right">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-white text-xl shadow-sm">
                  ⚖️
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-950">
                    {isCitizen
                      ? "مستشار التسوية الذكي: صياغة المطلب القانوني"
                      : "مستشار خطط العمل: نموذج المعالجة المؤسسية المعتمد"}
                  </h3>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">
                    {isCitizen
                      ? "صياغة محترفة تدعم حقك بالاستناد للقوانين واللوائح المصرية"
                      : "خطة متدرجة الأثر تضمن رفع مؤشر جودة الرد (RQS Score >= 90)"}
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

            {/* Content Loading */}
            {isLoading && (
              <div className="py-12 text-center space-y-3 bg-amber-50 rounded-2xl border-2 border-amber-300">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white animate-spin text-xl shadow-xs">
                  ⚙️
                </div>
                <p className="text-sm font-black text-slate-950">
                  {isCitizen
                    ? "جاري مطابقة الوقائع مع القوانين واللوائح المصرية المعتمدة..."
                    : "جاري صياغة خطة عمل ثلاثية المراحل مطابقة لمعايير RQS..."}
                </p>
                <p className="text-xs font-bold text-slate-700">
                  فحص القوانين (القرار 187، قانون 181، قانون 49، معايير GAHAR)...
                </p>
              </div>
            )}

            {/* Error */}
            {error && !isLoading && (
              <div className="rounded-xl bg-red-100 p-4 text-xs font-bold text-red-950 border-2 border-red-300 mb-4">
                {error}
              </div>
            )}

            {/* Citizen Outcome Result */}
            {isCitizen && citizenAdvice && !isLoading && (
              <div className="space-y-4">
                {/* 1. Suggested Outcome Box */}
                <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                      <span>💡</span> المطلب المقترح (صياغة رسمية هادئة وحازمة):
                    </span>
                    <span className="rounded-full bg-amber-200 border border-amber-400 px-2.5 py-0.5 text-[11px] font-black text-amber-950">
                      نوع الإجراء: {citizenAdvice.suggestedRemedyType}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base leading-relaxed text-slate-950 font-bold">
                    {citizenAdvice.outcomeSuggestion}
                  </p>
                </div>

                {/* 2. Statutory Grounds */}
                <div className="rounded-2xl border-2 border-sky-300 bg-sky-50 p-4 text-xs space-y-1.5">
                  <div className="font-black text-sky-950 flex items-center gap-1.5">
                    <span>📜</span> السند القانوني واللائحي المعتمد:
                  </div>
                  <div className="text-sky-900 font-black text-sm">
                    {citizenAdvice.statutoryGrounds.lawName} — {citizenAdvice.statutoryGrounds.articleNumber}
                  </div>
                  <div className="text-slate-800 font-bold leading-relaxed">
                    {citizenAdvice.statutoryGrounds.summary}
                  </div>
                  <div className="text-[11px] font-bold text-slate-600">
                    الجهة المصدرة: {citizenAdvice.statutoryGrounds.issuingAuthority}
                  </div>
                </div>

                {/* 3. Recommended Steps */}
                <div className="rounded-2xl border-2 border-slate-300 p-4 bg-white text-xs">
                  <div className="font-black text-slate-950 mb-2">
                    الخطوات المقترحة لدعم طلبك:
                  </div>
                  <ul className="space-y-1.5 text-slate-800 font-bold list-disc list-inside">
                    {citizenAdvice.recommendedSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Institution Action Plan Result */}
            {!isCitizen && institutionAdvice && !isLoading && (
              <div className="space-y-4">
                {/* 1. Official Statement */}
                <div className="rounded-2xl border-2 border-sky-400 bg-sky-50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-sky-950 flex items-center gap-1">
                      <span>🏛️</span> البيان الرسمي والتعهد المؤسسي:
                    </span>
                    <span className="rounded-full bg-emerald-200 px-3 py-1 text-xs font-black text-emerald-950 border-2 border-emerald-500">
                      مؤشر جودة الرد المتوقع: {institutionAdvice.estimatedRqs} / 100
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-950 font-bold">
                    {institutionAdvice.officialStatement}
                  </p>
                </div>

                {/* 2. Milestones Grid */}
                <div className="rounded-2xl border-2 border-slate-300 p-4 bg-white">
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
              </div>
            )}

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-between border-t-2 border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border-2 border-slate-300 px-5 py-2 text-xs font-black text-slate-800 hover:bg-slate-100 transition"
              >
                إغلاق
              </button>

              {((isCitizen && citizenAdvice) || (!isCitizen && institutionAdvice)) && !isLoading && (
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={applied}
                  className="rounded-xl bg-emerald-600 bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-2.5 text-xs font-black text-white shadow-md hover:bg-emerald-700 hover:from-emerald-700 hover:to-teal-800 transition flex items-center gap-1.5 border border-emerald-500"
                >
                  {applied ? (
                    <span>✓ تم التطبيق بنجاح!</span>
                  ) : (
                    <span>{isCitizen ? "اعتماد هذا المطلب في الشكوى ←" : "تطبيق واعتماد هذه الخطة ←"}</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
