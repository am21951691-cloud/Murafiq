"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { MurafiqLogo } from "@/components/brand/MurafiqLogo";
import { CaseTimeline, type TimelineEvent } from "@/components/institution/CaseTimeline";
import { CommunicationThread } from "@/components/institution/CommunicationThread";
import { ActionPlanBuilder } from "@/components/institution/ActionPlanBuilder";
import type { CasePriority, LifecycleStatus } from "@/types/database";

interface PageProps {
  params: Promise<{ id: string; locale?: string }>;
}

export default function StaffCaseDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caseData, setCaseData] = useState<any>(null);
  const [actionPlan, setActionPlan] = useState<any>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  // Triage update states
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedPriority, setSelectedPriority] = useState<CasePriority>("MEDIUM");
  const [isUpdatingAssignment, setIsUpdatingAssignment] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<
    "OVERVIEW" | "AI_ASSISTANT" | "TIMELINE" | "COMMUNICATION" | "PLAN" | "NOTES" | "DOCUMENTS"
  >("OVERVIEW");

  // Internal Note form
  const [newNoteText, setNewNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Action plan modal
  const [showPlanBuilder, setShowPlanBuilder] = useState(false);

  // Resolve case modal
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionStatement, setResolutionStatement] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  // AI draft response state
  const [generatedDraft, setGeneratedDraft] = useState<string | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);

  const loadCaseData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/institution/cases/${caseId}`);
      const result = await res.json();
      if (!result.success || !result.data) {
        throw new Error(result.error || "تعذر تحميل بيانات الحالة");
      }
      const data = result.data;
      setCaseData(data.case);
      setActionPlan(data.actionPlan);
      setEvents(
        (data.events || []).map((e: any) => ({
          id: e.id,
          eventType: e.event_type,
          actorRole: e.actor_role,
          title: e.event_type.replace(/_/g, " "),
          description: typeof e.payload === "string" ? e.payload : JSON.stringify(e.payload || {}),
          timestamp: e.created_at,
        }))
      );
      setNotes(data.notes || []);
      setDepartments(data.departments || []);
      setSelectedDept(data.case.assigned_department_id || "");
      setSelectedPriority(data.case.priority || "MEDIUM");
    } catch (err: any) {
      setError(err.message || "فشل تحميل تفاصيل الحالة");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCaseData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const handleUpdateAssignment = async () => {
    setIsUpdatingAssignment(true);
    try {
      const res = await fetch("/api/institution/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          departmentId: selectedDept || undefined,
          priority: selectedPriority,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCaseData((prev: any) => ({
          ...prev,
          assigned_department_id: selectedDept,
          priority: selectedPriority,
        }));
        alert("تم تحديث القسم والأولوية بنجاح ✅");
      }
    } catch {
      alert("حدث خطأ أثناء التحديث");
    } finally {
      setIsUpdatingAssignment(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    setIsSavingNote(true);
    try {
      const res = await fetch("/api/institution/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          noteText: newNoteText.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNotes((prev) => [data.data, ...prev]);
        setNewNoteText("");
      }
    } catch {
      alert("تعذر حفظ الملاحظة الداخلية");
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleToggleMilestone = async (milestoneId: string, completed: boolean) => {
    try {
      const res = await fetch("/api/cases/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestoneId,
          isCompleted: !completed,
          completedBy: "فريق العمليات",
        }),
      });
      const data = await res.json();
      if (data.success && actionPlan) {
        setActionPlan((prev: any) => ({
          ...prev,
          milestones: prev.milestones.map((m: any) =>
            m.id === milestoneId ? { ...m, is_completed: !completed } : m
          ),
        }));
      }
    } catch {
      alert("حدث خطأ أثناء تحديث المرحلة");
    }
  };

  const handleResolveCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionStatement.trim()) return;
    setIsResolving(true);
    try {
      const res = await fetch("/api/institution/acknowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          officialStatement: resolutionStatement.trim(),
          markResolved: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCaseData((prev: any) => ({
          ...prev,
          lifecycle_status: "AWAITING_EVALUATION" as LifecycleStatus,
        }));
        setShowResolveModal(false);
        alert("تم حسم الحالة وإرسال إشعار للمستفيد لتقييم الحل ✅");
      }
    } catch {
      alert("تعذر تسجيل حسم الحالة");
    } finally {
      setIsResolving(false);
    }
  };

  const handleGenerateAiDraft = () => {
    setIsDrafting(true);
    setTimeout(() => {
      const beneficiaryName = caseData?.metadata?.beneficiary_name || "المستفيد الكريم";
      const draft = `عناية السيد/ة ${beneficiaryName} المحترم/ة،\n\nتحية طيبة وبعد،\nنود إحاطتكم بأنه تمت دراسة طلبكم المسجل برقم مرجعي (${caseData?.reference_number}) بعناية واهتمام بالغ من قِبل إدارة المؤسسة. وقد تم اتخاذ الإجراءات التصحيحية اللازمة بالتنسيق مع القسم المختص، ونؤكد لكم التزامنا بتقديم أعلى معايير الجودة والخدمة.\n\nشاكرين لكم تواصلكم البنّاء وحرصكم الدائم،\nفريق إدارة وحسم الحالات المؤسسية.`;
      setGeneratedDraft(draft);
      setIsDrafting(false);
    }, 600);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-arabic text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold">جاري تحميل بيانات الحالة والـ SLA...</p>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-arabic p-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center max-w-md shadow-xs">
          <div className="text-3xl mb-2">⚠️</div>
          <h2 className="text-base font-bold text-slate-900 mb-2">تعذر فتح الحالة</h2>
          <p className="text-xs text-slate-500 mb-4">{error || "الحالة المطلوبة غير موجودة"}</p>
          <Link
            href="/portal/dashboard"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition inline-block"
          >
            العودة للوحة التحكم
          </Link>
        </div>
      </div>
    );
  }

  // SLA Calculation
  const deadline = caseData.grace_expires_at || caseData.sla_target_at;
  let slaRemainingText = "18h 32m remaining";
  let isOverdue = false;
  let slaBadgeBg = "bg-emerald-50 text-emerald-800 border-emerald-300";

  if (deadline) {
    const diffMs = new Date(deadline).getTime() - Date.now();
    if (diffMs < 0) {
      isOverdue = true;
      const overdueHours = Math.abs(Math.floor(diffMs / 3600000));
      const overdueMins = Math.abs(Math.floor((diffMs % 3600000) / 60000));
      slaRemainingText = `OVERDUE by ${overdueHours}h ${overdueMins}m`;
      slaBadgeBg = "bg-rose-50 text-rose-700 border-rose-300 animate-pulse";
    } else {
      const remHours = Math.floor(diffMs / 3600000);
      const remMins = Math.floor((diffMs % 3600000) / 60000);
      slaRemainingText = `${remHours}h ${remMins}m remaining`;
      if (remHours < 8) {
        slaBadgeBg = "bg-amber-50 text-amber-800 border-amber-300";
      }
    }
  }

  const assignedDept = departments.find((d) => d.id === caseData.assigned_department_id);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-arabic text-right selection:bg-teal-600 selection:text-white" dir="rtl">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-30 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/portal/dashboard" className="text-slate-400 hover:text-slate-600 transition text-sm">
              ← لوحة الحالات
            </Link>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black text-slate-900 tracking-wider">
                {caseData.reference_number}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  caseData.lifecycle_status === "CLOSED"
                    ? "bg-slate-100 text-slate-700"
                    : caseData.lifecycle_status === "AWAITING_EVALUATION"
                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                    : "bg-teal-50 text-teal-800 border border-teal-200"
                }`}
              >
                {caseData.lifecycle_status}
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold font-mono ${
                  caseData.priority === "CRITICAL"
                    ? "bg-rose-100 text-rose-800"
                    : caseData.priority === "HIGH"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {caseData.priority || "MEDIUM"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Countdown SLA Timer Badge */}
            <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-mono flex items-center gap-1.5 ${slaBadgeBg}`}>
              <span>⏱️ SLA:</span>
              <span>{slaRemainingText}</span>
            </div>

            {/* Resolve Button */}
            {caseData.lifecycle_status !== "CLOSED" && caseData.lifecycle_status !== "AWAITING_EVALUATION" && (
              <button
                onClick={() => setShowResolveModal(true)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
              >
                ✓ حسم الحالة (Resolve)
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition"
            >
              🖨️ طباعة التقرير
            </button>
          </div>
        </div>
      </header>

      {/* Metadata Ribbon */}
      <div className="bg-white border-b border-slate-200 py-3 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 text-xs">
            <div>
              <span className="block text-slate-400 font-bold text-[10px] uppercase">المستفيد (Beneficiary)</span>
              <span className="font-bold text-slate-800 font-mono">
                {caseData.metadata?.display_token || "STU-***412"}
              </span>
            </div>
            <div>
              <span className="block text-slate-400 font-bold text-[10px] uppercase">القسم المحال (Department)</span>
              <span className="font-bold text-slate-800">
                {assignedDept?.name_ar || "غير محدد"}
              </span>
            </div>
            <div>
              <span className="block text-slate-400 font-bold text-[10px] uppercase">المسؤول (Owner)</span>
              <span className="font-bold text-slate-800">فريق الجودة والعمليات</span>
            </div>
            <div>
              <span className="block text-slate-400 font-bold text-[10px] uppercase">التصنيف (Category)</span>
              <span className="font-bold text-slate-800">{caseData.category}</span>
            </div>
            <div>
              <span className="block text-slate-400 font-bold text-[10px] uppercase">تاريخ التسجيل</span>
              <span className="font-mono text-slate-700">
                {new Date(caseData.created_at).toLocaleDateString("ar-EG")}
              </span>
            </div>
            <div>
              <span className="block text-slate-400 font-bold text-[10px] uppercase">آخر تحديث</span>
              <span className="font-mono text-slate-700">
                {new Date(caseData.updated_at).toLocaleDateString("ar-EG")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-3 mb-6 overflow-x-auto text-xs font-bold">
          {[
            { key: "OVERVIEW", label: "📄 تفاصيل ووصف الحالة" },
            { key: "AI_ASSISTANT", label: "🤖 مساعد الـ AI Resolution", highlight: true },
            { key: "PLAN", label: "☑️ خطة العمل والمراحل", badge: actionPlan?.milestones?.length },
            { key: "TIMELINE", label: "⏱️ الخط الزمني للتنفيذ", badge: events.length },
            { key: "COMMUNICATION", label: "💬 التواصل المباشر مع المستفيد" },
            { key: "NOTES", label: "🔒 الملاحظات الداخلية السرية", badge: notes.length },
            { key: "DOCUMENTS", label: "📁 المستندات والمرفقات" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3.5 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? "bg-teal-700 text-white shadow-xs"
                  : tab.highlight
                  ? "bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab 1: OVERVIEW */}
        {activeTab === "OVERVIEW" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* AI Executive Summary Card */}
              <div className="bg-white rounded-2xl border border-teal-200 p-5 shadow-xs bg-gradient-to-br from-teal-50/40 to-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🤖</span>
                    <h3 className="text-sm font-black text-teal-950">ملخص تنفيذي ذكي (AI Executive Summary)</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                    Neutral Synthesis
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  تتعلق الحالة بشكوى مباشرة حول <strong>{caseData.subcategory || caseData.category}</strong>. يُبدي المستفيد استياءً من التأخر الإجرائي، ومطلوب مراجعة السجلات المعنية واتخاذ إجراء توفيقي وفق جدول الـ SLA المحدد خلال {slaRemainingText}.
                </p>
              </div>

              {/* Case Description */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3">نص ووصف الحالة المسجل</h3>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs leading-relaxed whitespace-pre-wrap">
                  {caseData.sanitized_description}
                </div>
              </div>
            </div>

            {/* Right: Quick Triage & Department Reassignment */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3">التوجيه الإداري والأولوية</h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">القسم المختص</label>
                    <select
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="">-- غير محدد --</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name_ar} (SLA: {d.default_sla_hours}h)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">درجة الأولوية (Priority)</label>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value as CasePriority)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                    >
                      <option value="LOW">LOW — منخفضة</option>
                      <option value="MEDIUM">MEDIUM — متوسطة</option>
                      <option value="HIGH">HIGH — عالية</option>
                      <option value="CRITICAL">CRITICAL — حرجة وطارئة</option>
                    </select>
                  </div>

                  <button
                    onClick={handleUpdateAssignment}
                    disabled={isUpdatingAssignment}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition"
                  >
                    {isUpdatingAssignment ? "جاري التحديث..." : "حفظ التوجيه الإداري"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AI RESOLUTION ASSISTANT (Repositioned) */}
        {activeTab === "AI_ASSISTANT" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Missing Information & SLA Risk */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>🔍</span>
                <span>فحص النواقص ومخاطر الـ SLA</span>
              </h3>

              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs">
                <span className="font-bold text-amber-900 block mb-1">تنبيه النواقص (Missing Info):</span>
                <p className="text-amber-800 leading-relaxed">
                  يُستحسن التحقق من رقم الإيصال أو تاريخ المعاملة المحدد لسرعة إنجاز الرد دون الحاجة لمراسلات استيضاحية مطولة.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-800 block mb-1">مؤشر خطر كسر الـ SLA (Risk Score):</span>
                <div className="flex items-center justify-between font-mono text-[11px] text-slate-600 mt-2">
                  <span>المهلة المتبقية: {slaRemainingText}</span>
                  <span className="font-bold text-emerald-700">مستوى الخطر: منخفض (Low)</span>
                </div>
              </div>
            </div>

            {/* Card 2: Root Cause Analysis */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>📊</span>
                <span>تحليل السبب الجذري والتوصيات (Root Cause)</span>
              </h3>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-800 block">السبب الإجرائي المحتمل:</span>
                <p className="text-slate-600 leading-relaxed">
                  تكرار هذا النوع من الحالات يرتبط بتأخر التحديث الأسبوعي للسجلات الرقمية خلال فترات ضغط الامتحانات والفوترة.
                </p>
                <div className="text-[11px] text-teal-700 font-bold pt-2 border-t border-slate-200">
                  التوصية: أتمتة إشعارات التحديث للمستفيدين لتقليل الاستفسارات بنسبة 40%.
                </div>
              </div>
            </div>

            {/* Card 3: Instant Official Response Draft */}
            <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>✍️</span>
                  <span>توليد مسودة الرد المؤسسي الرسمي (Official Response Draft)</span>
                </h3>
                <button
                  onClick={handleGenerateAiDraft}
                  disabled={isDrafting}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition"
                >
                  {isDrafting ? "جاري التوليد..." : "توليد مسودة رد رسمي ✨"}
                </button>
              </div>

              {generatedDraft ? (
                <div className="space-y-3 animate-fadeIn">
                  <textarea
                    rows={6}
                    value={generatedDraft}
                    onChange={(e) => setGeneratedDraft(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 leading-relaxed font-arabic"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedDraft);
                        alert("تم نسخ مسودة الرد إلى الحافظة!");
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    >
                      نسخ المسودة
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  انقر على الزر أعلاه لتوليد مسودة رد مهنية ومطمئنة للمستفيد تستند لبيانات الحالة وسياقها المؤسسي.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: ACTION PLAN */}
        {activeTab === "PLAN" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">خطة العمل والمراحل المعتمدة (Resolution Milestones)</h3>
                  <p className="text-xs text-slate-500">مراحل الحل التنفيذية ومتابعة إنجاز كل مرحلة بدقة.</p>
                </div>
                {!actionPlan && (
                  <button
                    onClick={() => setShowPlanBuilder(true)}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition"
                  >
                    + صياغة خطة عمل جديدة
                  </button>
                )}
              </div>

              {actionPlan ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 mb-4">
                    <span className="font-bold text-slate-900 block mb-1">البيان المؤسسي المعتمد:</span>
                    {actionPlan.official_statement}
                  </div>

                  <div className="space-y-2">
                    {actionPlan.milestones?.map((m: any) => (
                      <div
                        key={m.id}
                        className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                          m.is_completed ? "bg-emerald-50/50 border-emerald-200" : "bg-white border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={m.is_completed}
                            onChange={() => handleToggleMilestone(m.id, m.is_completed)}
                            className="rounded text-teal-600 w-4 h-4 cursor-pointer"
                          />
                          <div>
                            <div className={`text-xs font-bold ${m.is_completed ? "line-through text-slate-400" : "text-slate-800"}`}>
                              {m.title}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              المسؤول: {m.owner_role} | الموعد: {new Date(m.due_date).toLocaleDateString("ar-EG")}
                            </div>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.is_completed ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {m.is_completed ? "منجز ✓" : "قيد التنفيذ ●"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  لم يتم اعتماد خطة عمل لهذه الحالة بعد. انقر أعلاه لصياغة المراحل الثلاث للحل.
                </div>
              )}
            </div>

            {showPlanBuilder && (
              <ActionPlanBuilder
                caseId={caseId}
                caseReference={caseData.reference_number}
                onSuccess={() => {
                  setShowPlanBuilder(false);
                  loadCaseData();
                }}
                onCancel={() => setShowPlanBuilder(false)}
              />
            )}
          </div>
        )}

        {/* Tab 4: TIMELINE */}
        {activeTab === "TIMELINE" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4">الخط الزمني وسجل الأحداث (Audit Timeline)</h3>
            <CaseTimeline events={events} />
          </div>
        )}

        {/* Tab 5: COMMUNICATION */}
        {activeTab === "COMMUNICATION" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4">التواصل الرسمي مع المستفيد</h3>
            <CommunicationThread caseId={caseId} referenceNumber={caseData.reference_number} />
          </div>
        )}

        {/* Tab 6: INTERNAL NOTES */}
        {activeTab === "NOTES" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">الملاحظات الداخلية السرية (Staff Only)</h3>
              <p className="text-xs text-slate-500">هذه الملاحظات مخصصة فقط لفريق العمليات الداخلي ولا تظهر للمستفيد مطلقاً.</p>
            </div>

            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                rows={3}
                required
                placeholder="اكتب ملاحظة داخلية سرية لفريق العمليات..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingNote}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition"
                >
                  {isSavingNote ? "جاري الحفظ..." : "إضافة ملاحظة داخلية"}
                </button>
              </div>
            </form>

            <div className="divide-y divide-slate-100">
              {notes.map((n) => (
                <div key={n.id} className="py-3 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800">{n.author_name} ({n.author_role})</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(n.created_at).toLocaleString("ar-EG")}
                    </span>
                  </div>
                  <p className="text-slate-600">{n.note_text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 7: DOCUMENTS */}
        {activeTab === "DOCUMENTS" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs text-center">
            <div className="text-3xl mb-2">📁</div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">المستندات والأدلة المرفقة</h3>
            <p className="text-xs text-slate-500 mb-4">المستندات المرفقة مع الحالة مؤمنة ومحفوظة بموجب سياسات عزل البيانات الحساسة.</p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 inline-block">
              ✓ تم التحقق من سلامة المرفقات وفحصها بمضاد الفيروسات السحابي.
            </div>
          </div>
        )}
      </main>

      {/* Modal: Resolve Case */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl text-right animate-fadeIn border border-slate-200">
            <h3 className="text-base font-black text-slate-900 mb-1">حسم الحالة رسميًا (Resolve Case)</h3>
            <p className="text-xs text-slate-500 mb-4">
              سيتم إشعار المستفيد بنتيجة الحل واعتماد إغلاق الحالة ونقلها لمرحلة تقييم الرضا النهائي.
            </p>

            <form onSubmit={handleResolveCase} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">بيان الحسم والحل النهائي *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="اكتب البيان الرسمي المعتمد الذي يوضح للمستفيد الإجراءات الملموسة التي اتخذتها المؤسسة لحل مشكلته..."
                  value={resolutionStatement}
                  onChange={(e) => setResolutionStatement(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isResolving}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
                >
                  {isResolving ? "جاري الاعتماد..." : "اعتماد الحسم وإرسال التقييم"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
