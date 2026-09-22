"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MurafiqLogo } from "@/components/brand/MurafiqLogo";
import { EvaluationModal } from "@/components/cases/EvaluationModal";
import type { SectorType, LifecycleStatus } from "@/types/database";

interface CaseTrackingData {
  id: string;
  reference_number: string;
  institution_id: string;
  institution_name: string;
  sector: SectorType;
  category: string;
  subcategory: string;
  lifecycle_status: LifecycleStatus;
  visibility: string;
  sanitized_description: string;
  initial_experience_rating: number;
  grace_expires_at: string;
  remaining_days: number;
  remaining_hours: number;
  is_urgent: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

interface MilestoneItem {
  id: string;
  title: string;
  owner_role: string;
  due_date: string;
  deliverable?: string;
  is_completed: boolean;
  completed_at?: string | null;
}

interface ActionPlanData {
  id: string;
  official_statement: string;
  rqs_score: number;
  rqs_breakdown?: any;
  created_at: string;
  milestones: MilestoneItem[];
}

interface EvaluationData {
  id: string;
  responsiveness_rating: number;
  resolution_satisfaction_rating: number;
  feedback_notes?: string | null;
  created_at: string;
}

interface EventItem {
  id: string;
  event_type: string;
  actor_role: string;
  created_at: string;
}

const SECTOR_LABELS: Record<string, { icon: string; title: string }> = {
  EDUCATION_SCHOOLS: { icon: "🏫", title: "المدارس والتعليم قبل الجامعي" },
  HIGHER_EDUCATION: { icon: "🎓", title: "الجامعات والتعليم العالي" },
  GOVERNMENT_PUBLIC: { icon: "🏛️", title: "الخدمات الحكومية والهيئات" },
  COMMERCIAL_COMPANIES: { icon: "🏢", title: "الشركات والخدمات التجارية" },
  HEALTHCARE_MEDICAL: { icon: "🏥", title: "المنشآت الصحية والمستشفيات" },
};

const LIFECYCLE_LABELS: Record<string, { label: string; bg: string; text: string; step: number }> = {
  PRIVATE_GRACE: {
    label: "مهلة المراجعة الخاصة (7 أيام)",
    bg: "bg-amber-100 border-amber-300",
    text: "text-amber-900",
    step: 1,
  },
  ACKNOWLEDGED: {
    label: "تم التأكيد والمراجعة من الإدارة",
    bg: "bg-sky-100 border-sky-300",
    text: "text-sky-900",
    step: 2,
  },
  ACTION_PLAN_PENDING: {
    label: "صياغة خطة العمل والمعالجة",
    bg: "bg-blue-100 border-blue-300",
    text: "text-blue-900",
    step: 2,
  },
  IN_PROGRESS: {
    label: "خطة العمل قيد التنفيذ والمتابعة",
    bg: "bg-indigo-100 border-indigo-300",
    text: "text-indigo-900",
    step: 3,
  },
  AWAITING_EVALUATION: {
    label: "اكتملت الإجراءات — بانتظار تقييمك النهائي",
    bg: "bg-emerald-100 border-emerald-300",
    text: "text-emerald-900",
    step: 4,
  },
  CLOSED: {
    label: "مغلقة رسمياً ومقيمة (3D Resolved)",
    bg: "bg-slate-100 border-slate-300",
    text: "text-slate-800",
    step: 4,
  },
};

export default function CaseTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const rawId = decodeURIComponent(resolvedParams.id || "");

  const [searchInput, setSearchInput] = useState(rawId);
  const [caseData, setCaseData] = useState<CaseTrackingData | null>(null);
  const [actionPlan, setActionPlan] = useState<ActionPlanData | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationData | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);

  useEffect(() => {
    async function fetchCase() {
      if (!rawId) return;
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/cases/${encodeURIComponent(rawId)}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "لم يتم العثور على القضية");
        }

        setCaseData(data.case);
        setActionPlan(data.action_plan);
        setEvaluation(data.evaluation);
        setEvents(data.events || []);
      } catch (err: any) {
        setError(err.message || "حدث خطأ أثناء تحميل بيانات الحالة");
      } finally {
        setLoading(false);
      }
    }

    fetchCase();
  }, [rawId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/cases/${encodeURIComponent(searchInput.trim().toUpperCase())}`);
    }
  };

  const handleEvaluationSuccess = (newEval: any) => {
    setEvaluation({
      id: newEval.id,
      responsiveness_rating: newEval.response_rating,
      resolution_satisfaction_rating: newEval.resolution_rating,
      feedback_notes: newEval.closing_comment,
      created_at: newEval.created_at || new Date().toISOString(),
    });
    if (caseData) {
      setCaseData({
        ...caseData,
        lifecycle_status: "CLOSED",
      });
    }
  };

  const sectorMeta = caseData?.sector ? SECTOR_LABELS[caseData.sector] : null;
  const statusConfig = caseData?.lifecycle_status
    ? LIFECYCLE_LABELS[caseData.lifecycle_status] || LIFECYCLE_LABELS.PRIVATE_GRACE
    : LIFECYCLE_LABELS.PRIVATE_GRACE;

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 font-arabic text-right">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Top Breadcrumb Navigation */}
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-200 text-xs shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <Link href="/" className="hover:opacity-90 transition flex items-center gap-1.5">
              <MurafiqLogo size="sm" showText={false} />
              <span className="text-sky-950 font-black">مُرافِق</span>
            </Link>
            <span className="text-slate-300">/</span>
            <Link href="/directory" className="hover:text-sky-800 transition">
              🌐 الدليل الوطني
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-sky-900 font-mono font-bold">
              {caseData?.reference_number || rawId}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/cases/new"
              className="rounded-lg bg-sky-800 px-3 py-1.5 font-bold text-white hover:bg-sky-900 transition"
            >
              + تسجيل حالة جديدة
            </Link>
          </div>
        </div>

        {/* Search / Lookup Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <form onSubmit={handleSearchSubmit} className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="أدخل رقم المرجع الرسمي (مثال: MRF-2026-48219)..."
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-mono focus:border-sky-800 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition shrink-0"
            >
              🔍 تتبع الحالة
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="rounded-2xl bg-white p-12 text-center text-slate-500 border border-slate-200">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-sky-800 border-r-transparent mb-3" />
            <p className="font-bold text-slate-700">جاري جلب تفاصيل الحالة وسجل المعالجة...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700 space-y-3">
            <p className="font-bold text-base">⚠️ {error}</p>
            <p className="text-xs text-red-600">
              تأكد من كتابة الرقم المرجعي بصورة صحيحة بما في ذلك البادئة (مثال: MRF-2026-48219)
            </p>
            <div className="pt-2">
              <Link
                href="/cases/new"
                className="inline-block rounded-xl bg-red-700 px-5 py-2 text-xs font-bold text-white hover:bg-red-800 transition"
              >
                تسجيل شكوى جديدة
              </Link>
            </div>
          </div>
        )}

        {/* Main Case Tracking View */}
        {!loading && caseData && (
          <div className="space-y-6">
            {/* Header Status Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-mono text-xs font-black text-sky-900 bg-sky-50 px-3 py-1 rounded-lg border border-sky-200">
                      {caseData.reference_number}
                    </span>
                    {sectorMeta && (
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                        {sectorMeta.icon} {sectorMeta.title}
                      </span>
                    )}
                    <span className={`rounded-lg border px-3 py-1 text-xs font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                      ● {statusConfig.label}
                    </span>
                  </div>

                  <h1 className="text-2xl font-bold text-slate-900">
                    {caseData.institution_name}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    التصنيف: <strong className="text-slate-700">{caseData.category}</strong> — {caseData.subcategory}
                  </p>
                </div>

                {/* 4-Vector Primary Metric: R_exp */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-center min-w-[140px]">
                  <span className="text-[11px] font-bold text-slate-500 block">
                    أثر التجربة الأولية (R_exp)
                  </span>
                  <div className="flex items-center justify-center gap-1 my-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className={`text-lg ${
                          s <= caseData.initial_experience_rating
                            ? "text-amber-500"
                            : "text-slate-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700">
                    {caseData.initial_experience_rating} من 5
                  </span>
                </div>
              </div>

              {/* Progress Stepper Bar */}
              <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs font-bold">
                <div
                  className={`p-2.5 rounded-xl border ${
                    statusConfig.step >= 1
                      ? "bg-sky-50 border-sky-300 text-sky-900"
                      : "bg-slate-50 border-slate-200 text-slate-400"
                  }`}
                >
                  <span>1. التسجيل والمهلة</span>
                </div>
                <div
                  className={`p-2.5 rounded-xl border ${
                    statusConfig.step >= 2
                      ? "bg-sky-50 border-sky-300 text-sky-900"
                      : "bg-slate-50 border-slate-200 text-slate-400"
                  }`}
                >
                  <span>2. مراجعة الإدارة</span>
                </div>
                <div
                  className={`p-2.5 rounded-xl border ${
                    statusConfig.step >= 3
                      ? "bg-sky-50 border-sky-300 text-sky-900"
                      : "bg-slate-50 border-slate-200 text-slate-400"
                  }`}
                >
                  <span>3. تنفيذ خطة العمل</span>
                </div>
                <div
                  className={`p-2.5 rounded-xl border ${
                    statusConfig.step >= 4
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                      : "bg-slate-50 border-slate-200 text-slate-400"
                  }`}
                >
                  <span>4. التقييم والإغلاق</span>
                </div>
              </div>

              {/* Grace Period Countdown Alert if in PRIVATE_GRACE */}
              {caseData.lifecycle_status === "PRIVATE_GRACE" && (
                <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-4 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="font-bold block text-sm mb-0.5">
                      ⏳ مهلة المفاوضة والحل الودي الخاصة سارية:
                    </span>
                    <p className="text-amber-800">
                      تمنح إدارة الجهة مهلة نظامية مدتها 7 أيام لدراسة الحالة وتقديم خطة معالجة معتمدة قبل أي نشر أو تصعيد رقابي.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-amber-200/70 border border-amber-400 px-3 py-1.5 font-mono text-sm font-bold text-amber-950">
                      متبقي {caseData.remaining_days} أيام ({caseData.remaining_hours} ساعة)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Case Facts & Outcome */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span>📝</span>
                <span>وقائع الحالة والمطالب المسجلة:</span>
              </h2>

              <div className="space-y-3 text-sm leading-relaxed text-slate-700">
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                  <span className="font-bold text-xs text-slate-500 block mb-1">
                    سرد الوقائع (بعد التنقيح الآمن وحماية الهوية):
                  </span>
                  <p className="whitespace-pre-line">{caseData.sanitized_description}</p>
                </div>

                {caseData.metadata?.desired_outcome && (
                  <div className="rounded-xl bg-sky-50/50 p-4 border border-sky-200 text-sky-950">
                    <span className="font-bold text-xs text-sky-700 block mb-1">
                      النتيجة المرجوة أو الحل المطلوب من المؤسسة:
                    </span>
                    <p>{caseData.metadata.desired_outcome}</p>
                  </div>
                )}

                {caseData.metadata?.display_token && (
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>🔒 الرقم المرجعي المحمي للتعامل:</span>
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border">
                      {caseData.metadata.display_token}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Institutional Action Plan & Milestones */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <span>🎯</span>
                  <span>خطة العمل المؤسسية ومراحل التنفيذ:</span>
                </h2>
                {actionPlan && (
                  <span className="rounded-lg bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-bold text-teal-800">
                    جودة خطة الحل (RQS): {actionPlan.rqs_score}%
                  </span>
                )}
              </div>

              {actionPlan ? (
                <div className="space-y-4">
                  {/* Official Statement */}
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-sm">
                    <span className="font-bold text-xs text-slate-500 block mb-1">
                      البيان والالتزام الرسمي لإدارة الجهة:
                    </span>
                    <p className="text-slate-800 whitespace-pre-line">
                      {actionPlan.official_statement}
                    </p>
                  </div>

                  {/* Milestones Checklist */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-600 block">
                      مراحل التنفيذ المجدولة ({actionPlan.milestones.length}):
                    </span>
                    <div className="space-y-2">
                      {actionPlan.milestones.map((ms, idx) => (
                        <div
                          key={ms.id || idx}
                          className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-sm transition ${
                            ms.is_completed
                              ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                              : "bg-white border-slate-200 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                ms.is_completed
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {ms.is_completed ? "✓" : idx + 1}
                            </span>
                            <div>
                              <strong className="block text-slate-800">{ms.title}</strong>
                              <span className="text-xs text-slate-500">
                                المسؤول: {ms.owner_role} {ms.deliverable ? `• المخرج: ${ms.deliverable}` : ""}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-slate-500">
                              تاريخ الاستحقاق: {new Date(ms.due_date).toLocaleDateString("ar-EG")}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                ms.is_completed
                                  ? "bg-emerald-200/80 text-emerald-900"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {ms.is_completed ? "مكتملة" : "قيد التنفيذ"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-slate-50 p-6 text-center text-xs text-slate-500 border border-dashed border-slate-300">
                  <p className="font-semibold text-slate-700 mb-1">
                    لم تُصدر إدارة الجهة خطة العمل الرسمية بعد.
                  </p>
                  <p>
                    سيتم إدراج مراحل المعالجة وجدول التنفيذ فور اعتمادها من مفوض العمليات المختص.
                  </p>
                </div>
              )}
            </div>

            {/* 3D Evaluation & Closure Section */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span>⚖️</span>
                <span>التقييم النهائي وإغلاق القضية (3D Experience Closure):</span>
              </h2>

              {evaluation ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900">
                      ✓ تم اعتماد التقييم وإغلاق القضية رسمياً
                    </span>
                    <span className="text-xs font-mono text-emerald-700">
                      {new Date(evaluation.created_at).toLocaleDateString("ar-EG")}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="bg-white rounded-lg p-3 border border-emerald-100">
                      <span className="text-xs text-slate-500 block">تقييم تجاوب المؤسسة (R_resp)</span>
                      <span className="text-lg font-bold text-emerald-800">
                        {evaluation.responsiveness_rating} / 5 نجوم
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-emerald-100">
                      <span className="text-xs text-slate-500 block">تقييم الرضا عن الحل الفعلي (R_res)</span>
                      <span className="text-lg font-bold text-emerald-800">
                        {evaluation.resolution_satisfaction_rating} / 5 نجوم
                      </span>
                    </div>
                  </div>

                  {evaluation.feedback_notes && (
                    <div className="bg-white rounded-lg p-3 border border-emerald-100 text-xs text-slate-700">
                      <span className="font-bold block text-slate-500 mb-0.5">ملاحظات صاحب الشأن:</span>
                      <p>{evaluation.feedback_notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <strong className="text-sm text-sky-950 block">
                      هل تم التوصل لحل مناسب مع إدارة الجهة؟
                    </strong>
                    <p className="text-xs text-sky-800 mt-0.5">
                      يمكنك تقييم مدى سرعة ومهنية المؤسسة ورضاك عن النتيجة لإغلاق القضية رسمياً وتوثيقها في مؤشرات الشفافية.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEvalModalOpen(true)}
                    className="rounded-xl bg-sky-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-sky-800 transition shadow-xs"
                  >
                    ⭐ تقييم حل المؤسسة وإغلاق القضية
                  </button>
                </div>
              )}
            </div>

            {/* Audit Trail Events */}
            {events.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-500">
                  سجل الأحداث والمطابقة الرسمية (Immutable Audit Trail):
                </h3>
                <div className="space-y-2 text-xs">
                  {events.map((ev) => (
                    <div
                      key={ev.id}
                      className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0"
                    >
                      <span className="font-bold text-slate-700">{ev.event_type}</span>
                      <div className="flex items-center gap-3 text-slate-400 font-mono">
                        <span>{ev.actor_role}</span>
                        <span>{new Date(ev.created_at).toLocaleTimeString("ar-EG")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Evaluation Closure Modal */}
        {caseData && (
          <EvaluationModal
            isOpen={isEvalModalOpen}
            caseId={caseData.id}
            caseReference={caseData.reference_number}
            onClose={() => setIsEvalModalOpen(false)}
            onSuccess={handleEvaluationSuccess}
          />
        )}
      </div>
    </div>
  );
}
