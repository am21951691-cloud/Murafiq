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
        className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 transition"
      >
        <span>✨</span>
        <span>
          {isCitizen
            ? "اقتراح حل قانوني ومطلب عادل بالذكاء الاصطناعي"
            : "اقتراح خطة معالجة مؤسسية ذكية (RQS-Compliant)"}
        </span>
      </button>

      {/* Modal / Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 text-right">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-900 text-lg">
                  ⚖️
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {isCitizen
                      ? "مستشار التسوية الذكي: صياغة المطلب القانوني"
                      : "مستشار خطط العمل: نموذج المعالجة المؤسسية المعتمد"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isCitizen
                      ? "اقتراح صياغة محترفة تدعم حقك بالاستناد للقوانين المصرية"
                      : "خطة متدرجة الأثر ترفع تقييم جودة الرد (RQS Score)"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition font-bold"
              >
                ✕
              </button>
            </div>

            {/* Content Loading */}
            {isLoading && (
              <div className="py-12 text-center space-y-3">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-800 animate-spin text-xl">
                  ⚙️
                </div>
                <p className="text-sm font-bold text-slate-700">
                  {isCitizen
                    ? "جاري مطابقة الوقائع مع القوانين واللوائح المصرية المعتمدة..."
                    : "جاري صياغة خطة عمل ثلاثية المراحل مطابقة لمعايير RQS..."}
                </p>
                <p className="text-xs text-slate-400">
                  فحص القوانين (القرار 187، قانون 181، قانون 49، معايير GAHAR)...
                </p>
              </div>
            )}

            {/* Error */}
            {error && !isLoading && (
              <div className="rounded-xl bg-red-50 p-4 text-xs text-red-700 border border-red-200 mb-4">
                {error}
              </div>
            )}

            {/* Citizen Outcome Result */}
            {isCitizen && citizenAdvice && !isLoading && (
              <div className="space-y-4">
                {/* 1. Suggested Outcome Box */}
                <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/60 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                      <span>💡</span> المطلب المقترح (صياغة رسمية هادئة وحازمة):
                    </span>
                    <span className="rounded-md bg-amber-200/80 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                      نوع الإجراء: {citizenAdvice.suggestedRemedyType}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-800 font-medium">
                    {citizenAdvice.outcomeSuggestion}
                  </p>
                </div>

                {/* 2. Statutory Grounds */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-xs space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>📜</span> السند القانوني واللائحي المعتمد:
                  </div>
                  <div className="text-sky-900 font-bold text-[13px]">
                    {citizenAdvice.statutoryGrounds.lawName} — {citizenAdvice.statutoryGrounds.articleNumber}
                  </div>
                  <div className="text-slate-600 leading-relaxed">
                    {citizenAdvice.statutoryGrounds.summary}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    الجهة المصدرة: {citizenAdvice.statutoryGrounds.issuingAuthority}
                  </div>
                </div>

                {/* 3. Recommended Steps */}
                <div className="rounded-2xl border border-slate-200 p-4 bg-white text-xs">
                  <div className="font-bold text-slate-900 mb-2">
                    الخطوات المقترحة لدعم طلبك:
                  </div>
                  <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
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
                <div className="rounded-2xl border-2 border-sky-300 bg-sky-50/60 p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-black text-sky-950 flex items-center gap-1">
                      <span>🏛️</span> البيان الرسمي والتعهد المؤسسي:
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-800 border border-emerald-300">
                      مؤشر جودة الرد المتوقع: {institutionAdvice.estimatedRqs} / 100
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-800">
                    {institutionAdvice.officialStatement}
                  </p>
                </div>

                {/* 2. Milestones Grid */}
                <div className="rounded-2xl border border-slate-200 p-4 bg-white">
                  <div className="text-xs font-bold text-slate-900 mb-2.5 flex items-center justify-between">
                    <span>مراحل الخطة المتدرجة (3 مراحل تنفيذية):</span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      المرجعية: {institutionAdvice.statutoryBasis}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {institutionAdvice.milestones.map((m, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200 p-3 bg-slate-50/70 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="flex-1">
                          <div className="font-bold text-slate-800">
                            {idx + 1}. {m.title}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            المخرج / الإثبات: {m.deliverable}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-semibold">
                          <span className="rounded-md bg-slate-200 px-2 py-0.5 text-slate-700">
                            {m.owner_role}
                          </span>
                          <span className="rounded-md bg-sky-100 px-2 py-0.5 text-sky-800 font-mono">
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
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-slate-300 px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                إغلاق
              </button>

              {((isCitizen && citizenAdvice) || (!isCitizen && institutionAdvice)) && !isLoading && (
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={applied}
                  className="rounded-xl bg-linear-to-r from-emerald-600 to-teal-700 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:from-emerald-700 hover:to-teal-800 transition flex items-center gap-1.5"
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
