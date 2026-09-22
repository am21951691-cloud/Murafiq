"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Case, SectorType, CasePriority } from "@/types/database";
import { ActionPlanBuilder } from "./ActionPlanBuilder";

export type CaseTriageItem = Case & {
  institution_name?: string;
  sector?: SectorType;
  remaining_days?: number;
  remaining_hours?: number;
  is_urgent?: boolean;
};

interface CaseTriageCardProps {
  caseData: CaseTriageItem;
  userRole?: string;
  onAcknowledged?: (caseId: string) => void;
  onPlanCreated?: (caseId: string) => void;
}

const SECTOR_ICONS: Record<string, string> = {
  EDUCATION_SCHOOLS: "🏫",
  HIGHER_EDUCATION: "🎓",
  GOVERNMENT_PUBLIC: "🏛️",
  COMMERCIAL_COMPANIES: "🏢",
  HEALTHCARE_MEDICAL: "🏥",
};

export function CaseTriageCard({
  caseData,
  userRole = "OPS_LEAD",
  onAcknowledged,
  onPlanCreated,
}: CaseTriageCardProps) {
  const [status, setStatus] = useState(caseData.lifecycle_status);
  const [priority, setPriority] = useState<CasePriority>(caseData.priority || "MEDIUM");
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [notes, setNotes] = useState("");
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showInternalNotes, setShowInternalNotes] = useState(false);
  const [showActionPlanModal, setShowActionPlanModal] = useState(false);
  const [internalNotes, setInternalNotes] = useState<any[]>([]);
  const [newInternalNote, setNewInternalNote] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAcknowledge = (userRole === "ADMIN" || userRole === "OPS_LEAD") && status === "PRIVATE_GRACE";

  // Calculate countdown
  const now = Date.now();
  const expiryTime = caseData.grace_expires_at
    ? new Date(caseData.grace_expires_at).getTime()
    : now + 7 * 86400000;
  const msRemaining = Math.max(0, expiryTime - now);
  const daysLeft = typeof caseData.remaining_days === "number" ? caseData.remaining_days : Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
  const hoursLeft = typeof caseData.remaining_hours === "number" ? caseData.remaining_hours : Math.ceil(msRemaining / (1000 * 60 * 60));
  const isUrgent = daysLeft <= 2;

  const displayToken = (caseData.metadata as any)?.display_token;

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
        throw new Error(data.error || "فشل تأكيد استلام الحالة");
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
      {/* Top Bar: Reference, Entity, Sector & Status Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-bold text-civic-navy bg-slate-100 px-3 py-1 rounded-md">
            {caseData.reference_number}
          </span>
          {caseData.sector && (
            <span className="rounded-md bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800">
              {SECTOR_ICONS[caseData.sector] || "🏛️"} {caseData.sector}
            </span>
          )}
          {caseData.institution_name && (
            <span className="rounded-md bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 border border-slate-200">
              {caseData.institution_name}
            </span>
          )}
          {displayToken && (
            <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-mono font-bold text-amber-800 border border-amber-200">
              🔑 رمز المعاملة: {displayToken}
            </span>
          )}
          {caseData.priority && (
            <span
              className={`rounded-md px-2.5 py-1 text-xs font-bold border ${
                caseData.priority === "CRITICAL"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : caseData.priority === "HIGH"
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : caseData.priority === "LOW"
                  ? "bg-slate-50 text-slate-600 border-slate-200"
                  : "bg-sky-50 text-sky-800 border-sky-200"
              }`}
            >
              {caseData.priority === "CRITICAL"
                ? "🚨 طارئة"
                : caseData.priority === "HIGH"
                ? "⚡ عاجلة"
                : caseData.priority === "LOW"
                ? "عادية"
                : "متوسطة"}
            </span>
          )}
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
            ✓ بانتظار خطة العمل الرسمية (ACTION_PLAN_PENDING)
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

        <div className="flex flex-wrap items-center gap-2">
          {/* Internal Notes Trigger */}
          <button
            type="button"
            onClick={async () => {
              setShowInternalNotes(true);
              try {
                const res = await fetch(`/api/institution/notes?case_id=${caseData.id}`);
                const data = await res.json();
                if (data.notes) setInternalNotes(data.notes);
              } catch {}
            }}
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            💬 الملاحظات الداخلية
          </button>

          {/* Action Plan Builder Trigger */}
          <button
            type="button"
            onClick={() => setShowActionPlanModal(true)}
            className="rounded-xl border border-sky-300 bg-sky-50 px-3.5 py-1.5 text-xs font-bold text-sky-900 hover:bg-sky-100 transition shadow-2xs"
          >
            📝 خطة العمل والمعالجة
          </button>

          {/* Full Case Detail Workspace */}
          <Link
            href={`/portal/cases/${caseData.id}`}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition shadow-2xs"
          >
            🔍 مساحة العمل والتدقيق
          </Link>

          {status === "PRIVATE_GRACE" ? (
            canAcknowledge ? (
              <button
                type="button"
                onClick={() => setShowNotesModal(true)}
                className="rounded-xl bg-sky-800 px-4 py-1.5 text-xs font-bold text-white hover:bg-sky-900 transition shadow-2xs"
              >
                تأكيد استلام الحالة
              </button>
            ) : (
              <span className="text-xs font-medium text-slate-400">
                صلاحية التأكيد: (ADMIN / OPS_LEAD)
              </span>
            )
          ) : (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
              ✓ معتمدة قيد التنفيذ
            </span>
          )}
        </div>
      </div>

      {/* Internal Notes Modal */}
      {showInternalNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl text-right max-h-[90vh] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h4 className="text-base font-black text-slate-900">
                  سجل الملاحظات والتنسيق الداخلي — {caseData.reference_number}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowInternalNotes(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Notes List */}
              <div className="space-y-2.5 max-h-60 overflow-y-auto mb-4 pr-1">
                {internalNotes.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    لا توجد ملاحظات داخلية مسجلة بعد.
                  </p>
                ) : (
                  internalNotes.map((n) => (
                    <div key={n.id} className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs">
                      <div className="flex items-center justify-between mb-1 text-[11px] font-bold text-slate-500">
                        <span>{n.author_name} ({n.author_role})</span>
                        <span>{new Date(n.created_at).toLocaleString("ar-EG")}</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed font-medium">{n.note_text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Note Form */}
              <label className="block text-xs font-bold text-slate-700 mb-1">
                إضافة ملاحظة أو توجيه إداري جديد (خاص بفريق العمل فقط):
              </label>
              <textarea
                rows={3}
                value={newInternalNote}
                onChange={(e) => setNewInternalNote(e.target.value)}
                placeholder="اكتب التوجيه أو الإجراء الداخلي المتخذ..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-sky-800 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-3">
              <button
                type="button"
                onClick={() => setShowInternalNotes(false)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                إغلاق
              </button>
              <button
                type="button"
                disabled={isSavingNote || newInternalNote.trim().length < 3}
                onClick={async () => {
                  setIsSavingNote(true);
                  try {
                    const res = await fetch("/api/institution/notes", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        case_id: caseData.id,
                        institution_id: caseData.institution_id,
                        author_name: "فريق المتابعة الإدارية",
                        author_role: userRole,
                        note_text: newInternalNote.trim(),
                      }),
                    });
                    const data = await res.json();
                    if (data.note) {
                      setInternalNotes((prev) => [...prev, data.note]);
                      setNewInternalNote("");
                    }
                  } catch {}
                  setIsSavingNote(false);
                }}
                className="rounded-xl bg-sky-800 px-5 py-2 text-xs font-bold text-white hover:bg-sky-900 disabled:opacity-50"
              >
                {isSavingNote ? "جاري الحفظ..." : "حفظ الملاحظة"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Plan Builder Modal */}
      {showActionPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl text-right my-8">
            <ActionPlanBuilder
              caseId={caseData.id}
              caseReference={caseData.reference_number}
              caseCategory={caseData.category}
              sector={caseData.sector}
              caseDescription={caseData.sanitized_description}
              entityName={caseData.institution_name}
              userRole={userRole as any}
              onSuccess={() => {
                setShowActionPlanModal(false);
                setStatus("IN_PROGRESS");
                if (onPlanCreated) onPlanCreated(caseData.id);
              }}
              onCancel={() => setShowActionPlanModal(false)}
            />
          </div>
        </div>
      )}

      {/* Acknowledgement Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl text-right">
            <h4 className="text-lg font-bold text-civic-navy mb-2">
              تأكيد استلام الحالة رسميًا
            </h4>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              بالتأكيد على استلام الحالة، سينتقل المسار من مهلة المراجعة الخاصة (PRIVATE_GRACE) إلى مرحلة صياغة خطة العمل الرسمية (ACTION_PLAN_PENDING) الموجهة للمستفيد والرقابة.
            </p>

            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ملاحظات داخلية لفريق العمل (اختياري)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: تم إحالة الحالة إلى الإدارة المعنية لدراسة الوقائع وإعداد خطة الحل المعتمدة..."
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
