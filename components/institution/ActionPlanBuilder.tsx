"use client";

import React, { useState } from "react";
import { calculateRQS, type ActionPlanPayload } from "@/lib/ai/scoring";
import { SolutionAdvisorWidget } from "@/components/ai/SolutionAdvisorModal";
import { SectorType } from "@/types/database";

interface ActionPlanBuilderProps {
  caseId: string;
  caseReference: string;
  caseCategory?: string;
  sector?: SectorType;
  caseDescription?: string;
  entityName?: string;
  userRole?: "ADMIN" | "OPS_LEAD" | "STAFF" | "OBSERVER";
  onSuccess?: (plan: any) => void;
  onCancel?: () => void;
}

interface MilestoneInput {
  id: string;
  title: string;
  owner_role: string;
  due_date: string;
  deliverable: string;
}

const COMMON_ROLES = [
  "مدير المرحلة الدراسية",
  "رئيس القسم الأكاديمي",
  "الأخصائي الاجتماعي",
  "الأخصائي النفسي",
  "وكيل شؤون الطلاب",
  "مسؤول الصيانة والمرافق",
  "مدير حركة النقل والحافلات",
  "مسؤول الرقابة المالية",
];

export function ActionPlanBuilder({
  caseId,
  caseReference,
  caseCategory,
  sector = "EDUCATION_SCHOOLS",
  caseDescription,
  entityName,
  userRole = "OPS_LEAD",
  onSuccess,
  onCancel,
}: ActionPlanBuilderProps) {
  const [statement, setStatement] = useState("");
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    {
      id: "m-1",
      title: "",
      owner_role: COMMON_ROLES[0],
      due_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      deliverable: "",
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute live RQS preview
  const livePayload: ActionPlanPayload = {
    officialStatement: statement,
    milestones: milestones.map((m) => ({
      title: m.title,
      ownerRole: m.owner_role,
      dueDate: m.due_date,
      deliverable: m.deliverable,
    })),
  };

  const preview = calculateRQS(livePayload);

  const addMilestone = () => {
    setMilestones((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        title: "",
        owner_role: COMMON_ROLES[1] || "رئيس القسم",
        due_date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
        deliverable: "",
      },
    ]);
  };

  const removeMilestone = (id: string) => {
    if (milestones.length <= 1) return;
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  const updateMilestone = (id: string, field: keyof MilestoneInput, value: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (statement.trim().length < 20) {
      setError("يجب أن يحتوي البيان الرسمي على 20 حرفاً على الأقل.");
      return;
    }

    const invalidMilestones = milestones.some(
      (m) => !m.title.trim() || !m.owner_role.trim() || !m.due_date.trim()
    );
    if (invalidMilestones) {
      setError("يرجى ملء كافة تفاصيل المراحل (العنوان، المسؤول، والموعد النهائي).");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/institution/action-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_id: caseId,
          official_statement: statement,
          user_role: userRole,
          milestones: milestones.map((m) => ({
            title: m.title.trim(),
            owner_role: m.owner_role.trim(),
            due_date: m.due_date.trim(),
            deliverable: m.deliverable.trim() || undefined,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل إرسال خطة العمل");
      }

      if (onSuccess) {
        onSuccess(data.action_plan);
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء إرسال خطة العمل");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-right font-arabic">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-civic-navy mb-1">
          صياغة خطة العمل الرسمية — القضية {caseReference}
        </h2>
        <p className="text-xs text-slate-500">
          وفقاً لمعايير مُرافِق: تعتمد جودة خطة العمل (RQS) على وضوح الالتزام، تحديد المسؤولين، ودقة المواعيد والمخرجات.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {/* Official Statement */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="block text-sm font-semibold text-slate-700">
            البيان المؤسسي الرسمي (Statement)
          </label>
          <SolutionAdvisorWidget
            mode="INSTITUTION_ACTION_PLAN"
            sector={sector}
            category={caseCategory || "GENERAL"}
            caseReference={caseReference}
            description={caseDescription || statement}
            entityName={entityName}
            onApplyActionPlan={(plan) => {
              setStatement(plan.officialStatement);
              setMilestones(
                plan.milestones.map((m, idx) => ({
                  id: `ai-m-${idx}-${Date.now()}`,
                  title: m.title,
                  owner_role: m.owner_role,
                  due_date: m.due_date,
                  deliverable: m.deliverable,
                }))
              );
            }}
          />
        </div>
        <p className="text-xs text-slate-400">
          رد الإدارة المباشر على الشكوى موضحاً الإجراءات المتخذة أو المخططة بمهنية ووضوح (20–3000 حرف).
        </p>
        <textarea
          rows={4}
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          placeholder="مثال: بعد مراجعة تقرير المشرف الأكاديمي، تم الاتفاق على جدول حصص علاجية مخصصة وتكليف رئيس القسم بالمتابعة الأسبوعية..."
          className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-civic-navy focus:outline-none"
          required
        />
        <div className="text-left text-xs text-slate-400 font-mono">
          {statement.length} / 3000
        </div>
      </div>

      {/* Milestones */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <button
            type="button"
            onClick={addMilestone}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-civic-navy hover:bg-slate-200 transition"
          >
            + إضافة مرحلة عمل
          </button>
          <label className="text-sm font-semibold text-slate-700">
            مراحل التنفيذ المحددة (Action Milestones)
          </label>
        </div>

        <div className="space-y-4">
          {milestones.map((m, idx) => (
            <div
              key={m.id}
              className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 relative transition hover:border-slate-300"
            >
              <div className="flex items-center justify-between">
                {milestones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMilestone(m.id)}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold"
                  >
                    حذف المرحلة
                  </button>
                )}
                <span className="text-xs font-bold text-civic-navy">
                  المرحلة {idx + 1}
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    عنوان الإجراء / المهمة
                  </label>
                  <input
                    type="text"
                    value={m.title}
                    onChange={(e) => updateMilestone(m.id, "title", e.target.value)}
                    placeholder="مثال: عقد جلسة إرشادية وتحديد مواعيد الدعم الفردي"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-civic-navy focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    الدور المسؤول عن التنفيذ
                  </label>
                  <input
                    type="text"
                    list={`roles-${m.id}`}
                    value={m.owner_role}
                    onChange={(e) => updateMilestone(m.id, "owner_role", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-civic-navy focus:outline-none"
                    placeholder="اختر أو اكتب المسمى الوظيفي"
                    required
                  />
                  <datalist id={`roles-${m.id}`}>
                    {COMMON_ROLES.map((r) => (
                      <option key={r} value={r} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    الموعد النهائي للإنجاز
                  </label>
                  <input
                    type="date"
                    value={m.due_date}
                    onChange={(e) => updateMilestone(m.id, "due_date", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white dir-ltr text-right focus:border-civic-navy focus:outline-none"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    المخرج القابل للقياس (Deliverable / Output) — اختياري لرفع درجة الجودة
                  </label>
                  <input
                    type="text"
                    value={m.deliverable}
                    onChange={(e) => updateMilestone(m.id, "deliverable", e.target.value)}
                    placeholder="مثال: تقرير تقييم موقع ومحضر اجتماع رسمي"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-civic-navy focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live RQS Score Preview Badge */}
      <div className="rounded-xl border border-civic-teal/30 bg-teal-50/50 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs text-slate-600 font-semibold">
            معاينة مؤشر جودة خطة العمل التقديري (RQS):
          </div>
          <div className="text-xs text-slate-500">
            {preview.grade === "EXEMPLARY" && "خطة ممتازة ومكتملة الأركان والمسؤوليات."}
            {preview.grade === "COMPREHENSIVE" && "خطة شاملة وواضحة المعالم."}
            {preview.grade === "ADEQUATE" && "خطة مقبولة لكن ينصح بإضافة مخرجات دقيقة."}
            {preview.grade === "NEEDS_IMPROVEMENT" && "ينصح بتحديد مسؤولين ومواعيد أدق لتفادي الخصم."}
            {preview.grade === "UNSATISFACTORY" && "الخطة تفتقر للتفاصيل أو تحتوي على عبارات عامة مفرطة."}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-civic-teal font-mono">
            {preview.rqsScore} / 100
          </span>
          <span className="rounded-md bg-civic-teal px-2.5 py-1 text-xs font-bold text-white">
            {preview.grade}
          </span>
        </div>
      </div>

      {/* Submit Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            إلغاء
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-civic-navy px-8 py-2.5 text-sm font-semibold text-white hover:bg-opacity-90 disabled:opacity-50 transition mr-auto"
        >
          {isSubmitting ? "جاري الاعتماد والإرسال..." : "اعتماد خطة العمل وبدء التنفيذ"}
        </button>
      </div>
    </form>
  );
}
