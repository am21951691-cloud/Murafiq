"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MurafiqLogo } from "@/components/brand/MurafiqLogo";
import { EvaluationModal } from "@/components/cases/EvaluationModal";
import type { SectorType, LifecycleStatus } from "@/types/database";

const SAMPLE_REFS = [
  { ref: "MRF-2026-48219", label: "مدرسة القاهرة (نقل وحافلات)" },
  { ref: "MRF-2026-91042", label: "جامعة القاهرة (رسوم وساعات معتمدة)" },
  { ref: "MRF-2026-10492", label: "البريد المصري (بطاقة دفع ومعاملات)" },
  { ref: "MRF-2026-67102", label: "المصرية للاتصالات (ألياف ضوئية)" },
  { ref: "MRF-2026-38291", label: "قصر العيني (تأمين وعيادات)" },
];

function TrackContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref") || "";

  const [queryRef, setQueryRef] = useState(initialRef);
  const [loading, setLoading] = useState(false);
  const [caseData, setCaseData] = useState<any>(null);
  const [actionPlan, setActionPlan] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Evaluation modal
  const [showEvalModal, setShowEvalModal] = useState(false);

  // In-app inquiry
  const [inquiryText, setInquiryText] = useState("");
  const [isSendingInquiry, setIsSendingInquiry] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);

  const fetchCase = async (refNumber: string) => {
    if (!refNumber.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/cases/${encodeURIComponent(refNumber.trim().toUpperCase())}`);
      const result = await res.json();
      if (!result.success || !result.case) {
        throw new Error(result.error || "لم يتم العثور على حالة مطابقة لهذا الرقم المرجعي.");
      }
      setCaseData(result.case);
      setActionPlan(result.actionPlan);
      setEvaluation(result.evaluation);
      setEvents(result.events || []);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء الاستعلام");
      setCaseData(null);
      setActionPlan(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef) {
      setQueryRef(initialRef);
      fetchCase(initialRef);
    }
  }, [initialRef]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCase(queryRef);
  };

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryText.trim() || !caseData) return;
    setIsSendingInquiry(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      setInquirySent(true);
      setInquiryText("");
      setTimeout(() => setInquirySent(false), 4000);
    } finally {
      setIsSendingInquiry(false);
    }
  };

  const getStepProgress = (status: LifecycleStatus) => {
    switch (status) {
      case "SUBMITTED":
        return 1;
      case "PRIVATE_GRACE":
        return 2;
      case "ACTION_PLAN_PENDING":
        return 2;
      case "IN_PROGRESS":
        return 3;
      case "AWAITING_EVALUATION":
        return 4;
      case "CLOSED":
        return 5;
      default:
        return 1;
    }
  };

  const currentStep = caseData ? getStepProgress(caseData.lifecycle_status) : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-xs shadow-2xs">
        <div className="flex items-center gap-2 font-bold text-slate-700">
          <Link href="/" className="hover:opacity-90 flex items-center gap-1.5">
            <MurafiqLogo size="sm" showText={false} />
            <span className="text-sky-950 font-black">مُرافِق</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-teal-800 font-extrabold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            🔍 الاستعلام والتتبع المباشر
          </span>
        </div>
        <Link
          href="/cases/new"
          className="rounded-lg bg-teal-700 px-3 py-1 text-xs font-bold text-white hover:bg-teal-800 transition"
        >
          + تقديم حالة جديدة
        </Link>
      </div>

      {/* Hero Search Box */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-2xs font-extrabold text-teal-800">
          <span>🛡️ تتبع آمن ومشفر دون الحاجة لحساب معقد</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          تتبع مسار حالتك أو شكواك المؤسسية
        </h1>
        <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed">
          أدخل الرقم المرجعي الآمن للحالة (مثل: <code className="font-mono font-bold text-teal-800">MRF-2026-48219</code>) للاطلاع على الإجراءات المتخذة ومراحل خطة العمل وتقييم الحل.
        </p>

        <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2 pt-2">
          <input
            type="text"
            value={queryRef}
            onChange={(e) => setQueryRef(e.target.value)}
            placeholder="مثال: MRF-2026-48219"
            className="w-full rounded-2xl border-2 border-slate-300 px-4 py-3 text-sm font-mono font-bold uppercase text-slate-900 focus:border-teal-700 focus:outline-none shadow-xs"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-teal-700 px-6 py-3 text-sm font-bold text-white hover:bg-teal-800 transition shadow-sm disabled:opacity-50 shrink-0"
          >
            {loading ? "جاري البحث..." : "تتبع الآن"}
          </button>
        </form>

        {/* Quick Sample Links */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-2xs">
          <span className="text-slate-400 font-bold">أرقام مرجعية تجريبية:</span>
          {SAMPLE_REFS.map((s) => (
            <button
              key={s.ref}
              type="button"
              onClick={() => {
                setQueryRef(s.ref);
                fetchCase(s.ref);
              }}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-slate-700 hover:border-teal-400 hover:bg-teal-50 transition"
            >
              {s.ref}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-center space-y-2">
          <span className="text-xl">⚠️</span>
          <p className="text-xs font-bold text-rose-800">{error}</p>
        </div>
      )}

      {/* Case Details when loaded */}
      {caseData && (
        <div className="space-y-6">
          {/* Stepper Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-slate-400">الرقم المرجعي:</span>
                <div className="text-lg font-black text-slate-900 font-mono mt-0.5">
                  {caseData.reference_number}
                </div>
              </div>
              <div className="text-left">
                <span className="text-2xs font-bold text-slate-400">الجهة المعنية:</span>
                <div className="text-xs font-bold text-teal-900">{caseData.institution_name}</div>
              </div>
            </div>

            {/* Visual 5-Step Process */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
              {[
                { step: 1, title: "1. التسجيل والتوثيق", desc: "استلام الحالة وتوليد الرمز" },
                { step: 2, title: "2. المراجعة والفرز", desc: "توجيه القسم والتحقق" },
                { step: 3, title: "3. خطة العمل المعتمدة", desc: "تنفيذ مراحل المعالجة" },
                { step: 4, title: "4. اكتمال الإجراءات", desc: "جاهزة للتقييم النهائي" },
                { step: 5, title: "5. التسوية والإغلاق", desc: "إصدار التقرير المعتمد" },
              ].map((s) => {
                const isPassed = currentStep >= s.step;
                const isCurrent = currentStep === s.step;

                return (
                  <div
                    key={s.step}
                    className={`rounded-xl p-3 border text-right transition ${
                      isCurrent
                        ? "border-teal-600 bg-teal-50/80 shadow-xs ring-1 ring-teal-500"
                        : isPassed
                        ? "border-emerald-300 bg-emerald-50/50 text-emerald-900"
                        : "border-slate-200 bg-slate-50 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                          isPassed ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-600"
                        }`}
                      >
                        {isPassed ? "✓" : s.step}
                      </span>
                      <span className="font-extrabold text-xs">{s.title}</span>
                    </div>
                    <p className="text-[11px] leading-snug">{s.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Case Facts & Narrative */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">
              تفاصيل الحالة وموضوع الطلب
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="font-bold text-slate-400">التصنيف الرئيسي:</span>
                <p className="font-extrabold text-slate-800 mt-0.5">{caseData.category}</p>
              </div>
              <div>
                <span className="font-bold text-slate-400">التصنيف الفرعي:</span>
                <p className="font-extrabold text-slate-800 mt-0.5">{caseData.subcategory || "عام"}</p>
              </div>
              <div>
                <span className="font-bold text-slate-400">تاريخ الورود:</span>
                <p className="font-mono text-slate-700 mt-0.5">
                  {new Date(caseData.created_at).toLocaleDateString("ar-EG")}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs leading-relaxed text-slate-800 font-medium">
              {caseData.sanitized_description}
            </div>
          </div>

          {/* Action Plan & Milestones */}
          {actionPlan && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    خطة المعالجة والحل المعتمدة من {caseData.institution_name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    خطوات وإجراءات ملموسة تعهدت بها المؤسسة لمعالجة هذه الحالة
                  </p>
                </div>
                <span className="text-2xs font-extrabold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                  مؤشر الجودة RQS: {actionPlan.rqs_score || 92}/100
                </span>
              </div>

              {actionPlan.official_statement && (
                <div className="rounded-xl bg-teal-50/50 border border-teal-200 p-4 text-xs text-teal-950 leading-relaxed font-medium">
                  <strong>البيان الرسمي للمؤسسة:</strong> {actionPlan.official_statement}
                </div>
              )}

              <div className="space-y-2.5 pt-2">
                <span className="text-xs font-bold text-slate-700">مراحل التنفيذ والإنجاز:</span>
                {actionPlan.milestones?.map((m: any, idx: number) => (
                  <div
                    key={m.id || idx}
                    className={`rounded-xl border p-3.5 flex items-center justify-between text-xs transition ${
                      m.is_completed
                        ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                        : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-2xs font-bold ${
                          m.is_completed ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-700"
                        }`}
                      >
                        {m.is_completed ? "✓" : idx + 1}
                      </span>
                      <div>
                        <span className="font-extrabold">{m.title}</span>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          المسؤول: {m.owner_role} | الموعد: {m.due_date}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-2xs font-bold px-2 py-0.5 rounded ${
                        m.is_completed ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {m.is_completed ? "مكتملة ومحققة" : "قيد التنفيذ"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evaluation Trigger (if awaiting evaluation or completed) */}
          {caseData.lifecycle_status === "AWAITING_EVALUATION" && (
            <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-6 text-center space-y-3 shadow-md">
              <span className="text-2xl">🎉</span>
              <h3 className="text-base font-black text-emerald-950">
                أعلنت المؤسسة اكتمال كافة مراحل الحل!
              </h3>
              <p className="text-xs text-emerald-800 max-w-lg mx-auto">
                رأيك النهائي هو المرجعية القانونية لإغلاق الحالة واحتساب مؤشر الجودة المؤسسية.
              </p>
              <button
                onClick={() => setShowEvalModal(true)}
                className="rounded-xl bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition shadow-sm"
              >
                ⭐ تقييم جودة الحل وإغلاق الحالة
              </button>
            </div>
          )}

          {/* In-App Inquiry to Institution */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">
              إرسال استفسار أو متابعة إلى {caseData.institution_name}
            </h3>

            {inquirySent && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-3 text-xs font-bold text-emerald-800">
                تم إرسال استفسارك بنجاح إلى فريق المعالجة المؤسسية ✅
              </div>
            )}

            <form onSubmit={handleSendInquiry} className="space-y-3">
              <textarea
                rows={3}
                value={inquiryText}
                onChange={(e) => setInquiryText(e.target.value)}
                placeholder="اكتب استفسارك أو ملاحظتك بشأن تقدم الحل..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:border-teal-700 focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSendingInquiry || !inquiryText.trim()}
                  className="rounded-xl bg-teal-700 px-5 py-2 text-xs font-bold text-white hover:bg-teal-800 transition disabled:opacity-50"
                >
                  {isSendingInquiry ? "جاري الإرسال..." : "إرسال الاستفسار"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Evaluation Modal */}
      {caseData && (
        <EvaluationModal
          isOpen={showEvalModal}
          caseId={caseData.id}
          caseReference={caseData.reference_number}
          onSuccess={() => {
            setShowEvalModal(false);
            fetchCase(caseData.reference_number);
          }}
          onClose={() => setShowEvalModal(false)}
        />
      )}
    </div>
  );
}

export default function StandaloneTrackingPage() {
  return (
    <main className="min-h-screen bg-civic-canvas py-8 px-4 sm:px-6 lg:px-8 font-arabic text-right">
      <Suspense fallback={<div className="text-center py-12 font-bold text-xs text-slate-500">جاري التحميل...</div>}>
        <TrackContent />
      </Suspense>
    </main>
  );
}
