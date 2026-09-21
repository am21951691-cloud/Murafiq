"use client";

import React, { useState } from "react";
import { type ActionItem } from "@/types/database";

interface MilestoneTrackerProps {
  caseId: string;
  milestones: ActionItem[];
  canManage?: boolean;
  onMilestoneCompleted?: (milestoneId: string, allCompleted: boolean) => void;
}

export function MilestoneTracker({
  caseId,
  milestones: initialMilestones,
  canManage = true,
  onMilestoneCompleted,
}: MilestoneTrackerProps) {
  const [milestones, setMilestones] = useState<ActionItem[]>(initialMilestones);
  const [activeModalId, setActiveModalId] = useState<string | null>(null);
  const [evidenceText, setEvidenceText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completedCount = milestones.filter((m) => m.is_completed).length;
  const progressPercent = Math.round((completedCount / (milestones.length || 1)) * 100);

  const handleOpenCompleteModal = (milestoneId: string) => {
    setActiveModalId(milestoneId);
    setEvidenceText("");
    setError(null);
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalId) return;

    if (evidenceText.trim().length < 5) {
      setError("يرجى إدخال ملخص توثيقي للإجراء المنجز (لا يقل عن 5 أحرف).");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/cases/milestones/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_id: caseId,
          milestone_id: activeModalId,
          evidence_summary: evidenceText.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل تسجيل إنجاز المرحلة");
      }

      setMilestones((prev) =>
        prev.map((m) =>
          m.id === activeModalId
            ? { ...m, is_completed: true, completed_at: new Date().toISOString() }
            : m
        )
      );

      if (onMilestoneCompleted) {
        onMilestoneCompleted(activeModalId, data.all_milestones_completed);
      }

      setActiveModalId(null);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء حفظ التوثيق");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-right font-arabic">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <span className="text-xs font-mono font-bold text-civic-navy bg-slate-100 px-3 py-1 rounded-full">
          {completedCount} / {milestones.length} مراحل مكتملة ({progressPercent}%)
        </span>
        <h3 className="text-lg font-bold text-civic-navy">
          مراحل تنفيذ خطة العمل والتوثيق
        </h3>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2.5 mb-6 overflow-hidden">
        <div
          className="bg-civic-teal h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="space-y-3">
        {milestones.map((m, idx) => (
          <div
            key={m.id}
            className={`rounded-lg border p-4 transition ${
              m.is_completed
                ? "border-emerald-200 bg-emerald-50/40"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              {canManage && !m.is_completed ? (
                <button
                  type="button"
                  onClick={() => handleOpenCompleteModal(m.id)}
                  className="rounded-lg bg-civic-teal px-3 py-1.5 text-xs font-semibold text-white hover:bg-opacity-90 transition shrink-0"
                >
                  توثيق وإنجاز
                </button>
              ) : m.is_completed ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 shrink-0">
                  <span>✓</span>
                  <span>[VERIFIED]</span>
                </span>
              ) : (
                <span className="text-xs text-slate-400 font-semibold shrink-0">
                  قيد التنفيذ
                </span>
              )}

              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 justify-end">
                  <span className={`text-sm font-bold ${m.is_completed ? "text-emerald-950 line-through opacity-80" : "text-slate-800"}`}>
                    {m.title}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    #{idx + 1}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 justify-end">
                  <span>المسؤول: <strong className="text-slate-700">{m.owner_role}</strong></span>
                  <span>الموعد النهائي: <strong className="text-slate-700 font-mono">{m.due_date}</strong></span>
                  {m.completed_at && (
                    <span className="text-emerald-700">
                      تاريخ الإنجاز: {new Date(m.completed_at).toLocaleDateString("ar-EG")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Completion Modal */}
      {activeModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl text-right">
            <h4 className="text-lg font-bold text-civic-navy mb-2">
              توثيق إنجاز مرحلة العمل
            </h4>
            <p className="text-xs text-slate-600 mb-4">
              لإثبات إنجاز المهمة، يرجى تقديم ملخص دقيق للمستند أو الإجراء المتخذ وفق معايير الحوكمة والشفافية.
            </p>

            {error && (
              <div className="mb-3 rounded bg-red-50 p-2.5 text-xs text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ملخص الإثبات التوثيقي (Evidence Summary)
                </label>
                <textarea
                  rows={3}
                  value={evidenceText}
                  onChange={(e) => setEvidenceText(e.target.value)}
                  placeholder="مثال: تم اعتماد جدول المسارات الجديد وتوزيعه على السائقين مع نسخة للمشرف العام."
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-civic-navy focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModalId(null)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-civic-teal px-5 py-2 text-xs font-semibold text-white hover:bg-opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? "جاري الحفظ..." : "اعتماد الإنجاز رسميّاً"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
