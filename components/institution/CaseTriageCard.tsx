"use client";

import React, { useState } from "react";
import { Case } from "@/types/database";

export type CaseTriageItem = Case;

interface CaseTriageCardProps {
  caseData: Case;
  userRole?: string;
  onAcknowledged?: (caseId: string) => void;
}

export function CaseTriageCard({
  caseData,
  userRole = "OPS_LEAD",
  onAcknowledged,
}: CaseTriageCardProps) {
  const [status, setStatus] = useState(caseData.lifecycle_status);
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [notes, setNotes] = useState("");
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAcknowledge = (userRole === "ADMIN" || userRole === "OPS_LEAD") && status === "PRIVATE_GRACE";

  // Calculate countdown
  const now = Date.now();
  const expiryTime = caseData.grace_expires_at
    ? new Date(caseData.grace_expires_at).getTime()
    : now + 7 * 86400000;
  const msRemaining = Math.max(0, expiryTime - now);
  const daysLeft = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.ceil(msRemaining / (1000 * 60 * 60));
  const isUrgent = daysLeft <= 2;

  const handleAcknowledge = async () => {
    setIsAcknowledging(true);
    setError(null);
    try {
      const res = await fetch("/api/institution/acknowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_id: caseData.id,
          internal_notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل تأكيد استلام القضية");
      }
      setStatus("ACTION_PLAN_PENDING");
      setShowNotesModal(false);
      if (onAcknowledged) {
        onAcknowledged(caseData.id);
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء التأكيد");
    } finally {
      setIsAcknowledging(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-right font-arabic transition hover:shadow-md">
      {/* Top Bar: Reference & Status Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-civic-navy bg-slate-100 px-3 py-1 rounded-md">
            {caseData.reference_number}
          </span>
          <span className="rounded-md bg-teal-50 px-2.5 py-1 text-xs font-semibold text-civic-teal">
            {caseData.category}
          </span>
        </div>

        {/* Grace Window Countdown Badge */}
        {status === "PRIVATE_GRACE" ? (
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
              isUrgent
                ? "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse"
                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
            }`}
          >
            <span>⏱ مهلة المراجعة الخاصة:</span>
            <span>
              {daysLeft > 1 ? `${daysLeft} أيام متبقية` : `${hoursLeft} ساعة متبقية`}
            </span>
          </div>
        ) : (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
            ✓ بانتظار خطة العمل (ACTION_PLAN_PENDING)
          </span>
        )}
      </div>

      {/* Subcategory & Impact Rating */}
      <div className="mt-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-800">{caseData.subcategory}</h3>
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500">أثر التجربة الأولية (R_exp):</span>
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold text-white ${
              caseData.initial_experience_rating <= 2
                ? "bg-red-600"
                : caseData.initial_experience_rating === 3
                ? "bg-amber-500"
                : "bg-teal-600"
            }`}
          >
            {caseData.initial_experience_rating}
          </span>
        </div>
      </div>

      {/* Sanitized Description */}
      <p className="mt-3 rounded-xl bg-slate-50/70 p-4 text-sm text-slate-700 leading-relaxed border border-slate-100">
        {caseData.sanitized_description}
      </p>

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 p-2.5 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-400">
          تاريخ الورود: {new Date(caseData.created_at).toLocaleDateString("ar-EG")}
        </span>

        {status === "PRIVATE_GRACE" ? (
          canAcknowledge ? (
            <button
              type="button"
              onClick={() => setShowNotesModal(true)}
              className="rounded-xl bg-civic-teal px-5 py-2 text-sm font-semibold text-white hover:bg-opacity-90 transition shadow-sm"
            >
              تأكيد استلام القضية وبدء المعالجة
            </button>
          ) : (
            <span className="text-xs font-medium text-slate-400">
              صلاحية التأكيد محصورة لـ (ADMIN / OPS_LEAD)
            </span>
          )
        ) : (
          <span className="text-xs font-bold text-civic-teal">
            ✓ تم الاستلام وتجري صياغة خطة العمل
          </span>
        )}
      </div>

      {/* Acknowledgement Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl text-right">
            <h4 className="text-lg font-bold text-civic-navy mb-2">
              تأكيد استلام القضية رسميًا
            </h4>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              بالتأكيد على استلام القضية، سينتقل المسار من مهلة المراجعة الخاصة (PRIVATE_GRACE) إلى مرحلة صياغة خطة العمل الرسمية (ACTION_PLAN_PENDING).
            </p>

            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ملاحظات داخلية لفريق العمل (اختياري)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: تم إحالة الشكوى إلى وكيل المرحلة للمتابعة..."
              className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-civic-navy focus:outline-none mb-4"
            />

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowNotesModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isAcknowledging}
                onClick={handleAcknowledge}
                className="rounded-xl bg-civic-navy px-5 py-2 text-xs font-bold text-white hover:bg-opacity-90 disabled:opacity-50"
              >
                {isAcknowledging ? "جاري التأكيد..." : "اعتماد الاستلام"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
