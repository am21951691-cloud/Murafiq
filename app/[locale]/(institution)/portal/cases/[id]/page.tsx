"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { MurafiqLogo } from "@/components/brand/MurafiqLogo";
import { CaseTimeline, type TimelineEvent } from "@/components/institution/CaseTimeline";
import { CommunicationThread } from "@/components/institution/CommunicationThread";
import { ActionPlanBuilder } from "@/components/institution/ActionPlanBuilder";
import type { CasePriority, SectorType } from "@/types/database";

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

  // Modal states
  const [showPlanBuilder, setShowPlanBuilder] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [activeTab, setActiveTab] = useState<"PLAN" | "NOTES" | "COMMUNICATION" | "TIMELINE">("PLAN");

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
    } catch (err) {
      alert("حدث خطأ أثناء التحديث");
    } finally {
      setIsUpdatingAssignment(false);
    }
  };

  const handleSaveInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    setIsSavingNote(true);
    try {
      const res = await fetch("/api/institution/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_id: caseId,
          institution_id: caseData?.institution_id,
          author_name: "موظف العمليات",
          author_role: "OPS_LEAD",
          note_text: newNoteText.trim(),
        }),
      });
      const data = await res.json();
      if (data.note) {
        setNotes((prev) => [...prev, data.note]);
        setNewNoteText("");
      }
    } catch (err) {
      alert("تعذر حفظ الملاحظة");
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleCompleteMilestone = async (milestoneId: string) => {
    try {
      const res = await fetch("/api/cases/milestones/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_id: caseId,
          milestone_id: milestoneId,
          verification_method: "ADMIN_AUDIT",
          verification_notes: "تم التحقق من إنجاز المستندات والخطوات الميدانية",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionPlan((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            milestones: prev.milestones.map((m: any) =>
              m.id === milestoneId ? { ...m, is_completed: true, completed_at: new Date().toISOString() } : m
            ),
          };
        });
      }
    } catch (err) {
      alert("حدث خطأ أثناء إتمام المرحلة");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-civic-canvas py-12 px-4 font-arabic text-center">
        <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="inline-block animate-spin text-3xl">⏳</div>
          <p className="text-sm font-bold text-slate-700">جاري تحميل مساحة عمل الحالة...</p>
        </div>
      </main>
    );
  }

  if (error || !caseData) {
    return (
      <main className="min-h-screen bg-civic-canvas py-12 px-4 font-arabic text-right">
        <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 border border-rose-200 shadow-sm space-y-4">
          <h2 className="text-base font-black text-rose-800">تعذر العثور على الحالة</h2>
          <p className="text-xs text-slate-600">{error || "لم يتم العثور على سجل الحالة المطلوب."}</p>
          <Link
            href="/portal/dashboard"
            className="inline-block rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white"
          >
            العودة إلى لوحة الفرز
          </Link>
        </div>
      </main>
    );
  }

  const completedMilestonesCount = actionPlan?.milestones?.filter((m: any) => m.is_completed).length || 0;
  const totalMilestonesCount = actionPlan?.milestones?.length || 0;
  const progressPercent = totalMilestonesCount > 0 ? Math.round((completedMilestonesCount / totalMilestonesCount) * 100) : 0;

  return (
    <main className="min-h-screen bg-civic-canvas py-8 px-4 sm:px-6 lg:px-8 font-arabic text-right">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-xs shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <Link href="/" className="hover:opacity-90 flex items-center gap-1.5">
              <MurafiqLogo size="sm" showText={false} />
              <span className="text-sky-950 font-black">مُرافِق إنتربرايز</span>
            </Link>
            <span className="text-slate-300">/</span>
            <Link href="/portal/dashboard" className="text-slate-600 hover:text-sky-800">
              لوحة الفرز
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-mono text-teal-800 font-extrabold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              {caseData.reference_number}
            </span>
          </div>
          <Link
            href={`/track?ref=${caseData.reference_number}`}
            target="_blank"
            className="text-2xs font-bold text-sky-800 hover:underline flex items-center gap-1"
          >
            عرض تتبع المستفيد ↗
          </Link>
        </div>

        {/* Case Header Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-base font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                {caseData.reference_number}
              </span>
              <span className="rounded-lg bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 text-xs font-bold">
                {caseData.sector || "قطاع وطني"}
              </span>
              <span
                className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                  caseData.priority === "CRITICAL"
                    ? "bg-rose-100 text-rose-800 border border-rose-300"
                    : caseData.priority === "HIGH"
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : "bg-sky-100 text-sky-800 border border-sky-300"
                }`}
              >
                أولوية: {caseData.priority || "MEDIUM"}
              </span>
              <span className="rounded-lg bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-1 text-xs font-bold">
                الحالة: {caseData.lifecycle_status}
              </span>
            </div>

            <div className="text-xs text-slate-500 font-mono">
              تاريخ التسجيل: {new Date(caseData.created_at).toLocaleString("ar-EG")}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            {/* Left 2 cols: Details & Description */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-500 mb-1">تصنيف الحالة والموضوع:</h3>
                <div className="text-sm font-extrabold text-slate-900">
                  {caseData.category} / {caseData.subcategory || "عام"}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-500 mb-1">وصف الحالة المعتمد والمفلتر:</h3>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs leading-relaxed text-slate-800 font-medium">
                  {caseData.sanitized_description}
                </div>
              </div>
            </div>

            {/* Right col: Assignment & SLA Controls */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4 text-xs">
              <h3 className="font-black text-slate-900 text-xs border-b border-slate-200 pb-2">
                توجيه القسم والأولوية
              </h3>

              <div>
                <label className="block text-2xs font-bold text-slate-600 mb-1">القسم الإداري المختص:</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800"
                >
                  <option value="">(غير معين بقسم)</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      {d.name_ar} ({d.default_sla_hours}h)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-2xs font-bold text-slate-600 mb-1">مستوى الأولوية:</label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value as CasePriority)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800"
                >
                  <option value="CRITICAL">🚨 قصوى (CRITICAL - 24h)</option>
                  <option value="HIGH">⚡ عالية (HIGH - 48h)</option>
                  <option value="MEDIUM">ℹ️ متوسطة (MEDIUM - 96h)</option>
                  <option value="LOW">📄 عادية (LOW - 168h)</option>
                </select>
              </div>

              <button
                onClick={handleUpdateAssignment}
                disabled={isUpdatingAssignment}
                className="w-full rounded-xl bg-teal-700 py-2 text-xs font-bold text-white hover:bg-teal-800 transition disabled:opacity-50"
              >
                {isUpdatingAssignment ? "جاري الحفظ..." : "تأكيد التوجيه"}
              </button>
            </div>
          </div>
        </div>

        {/* Action Plan Summary Bar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-slate-900">خطة العمل والمعالجة المؤسسية</span>
              {actionPlan && (
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-2xs font-bold">
                  مؤشر الجودة RQS: {actionPlan.rqs_score || 90}/100
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {actionPlan
                ? `تم إنجاز ${completedMilestonesCount} من أصل ${totalMilestonesCount} مراحل معتمدة.`
                : "لم يتم بناء خطة عمل معتمدة بعد لهذه الحالة."}
            </p>
          </div>

          <button
            onClick={() => setShowPlanBuilder(true)}
            className="rounded-xl bg-sky-800 px-4 py-2 text-xs font-bold text-white hover:bg-sky-900 transition shadow-xs"
          >
            {actionPlan ? "✏️ تعديل خطة العمل" : "+ إنشاء خطة العمل"}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-200 pb-1">
          {[
            { id: "PLAN", label: `📋 مراحل خطة الحل (${totalMilestonesCount})` },
            { id: "NOTES", label: `💬 الملاحظات الداخلية (${notes.length})` },
            { id: "COMMUNICATION", label: "📨 التواصل مع المستفيد" },
            { id: "TIMELINE", label: `⏱️ مسار التدقيق (${events.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: ACTION PLAN & MILESTONES */}
        {activeTab === "PLAN" && (
          <div className="space-y-4">
            {/* Progress Bar */}
            {totalMilestonesCount > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>نسبة تقدم مراحل الحل:</span>
                  <span className="font-mono">{progressPercent}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-teal-600 transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Milestones Checklist */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900">مراحل الالتزام الميداني والتنفيذي:</h3>

              {!actionPlan || totalMilestonesCount === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  لا توجد خطة عمل مفعلة بعد. اضغط على «إنشاء خطة العمل» بالأعلى لإعداد المراحل.
                </div>
              ) : (
                <div className="space-y-3">
                  {actionPlan.milestones.map((m: any, idx: number) => (
                    <div
                      key={m.id || idx}
                      className={`rounded-xl border p-4 transition flex flex-wrap items-center justify-between gap-3 ${
                        m.is_completed
                          ? "bg-emerald-50/50 border-emerald-200 text-emerald-950"
                          : "bg-slate-50 border-slate-200 text-slate-800"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full text-2xs font-bold ${
                              m.is_completed ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-700"
                            }`}
                          >
                            {m.is_completed ? "✓" : idx + 1}
                          </span>
                          <span className="font-extrabold text-xs">{m.title}</span>
                        </div>
                        <div className="flex items-center gap-3 text-2xs text-slate-500 pr-7">
                          <span>المسؤول: <strong>{m.owner_role}</strong></span>
                          <span>الموعد المستهدف: <strong>{m.due_date}</strong></span>
                          {m.deliverable && <span>المخرج: {m.deliverable}</span>}
                        </div>
                      </div>

                      <div>
                        {m.is_completed ? (
                          <span className="text-2xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-md">
                            مكتملة ومحققة
                          </span>
                        ) : (
                          <button
                            onClick={() => handleCompleteMilestone(m.id)}
                            className="rounded-xl bg-teal-700 px-3.5 py-1.5 text-2xs font-bold text-white hover:bg-teal-800 transition"
                          >
                            ✓ إتمام المرحلة وتوثيق الإنجاز
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: INTERNAL NOTES */}
        {activeTab === "NOTES" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900">سجل التوجيه والملاحظات الداخلية</h3>
              <p className="text-xs text-slate-500">خاص بفريق العمل والمشرفين الإداريين ومحجوب تماماً عن المستفيد</p>
            </div>

            <div className="space-y-3">
              {notes.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">لا توجد ملاحظات داخلية بعد.</div>
              ) : (
                notes.map((n) => (
                  <div key={n.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 font-bold text-[11px]">
                      <span>{n.author_name} ({n.author_role})</span>
                      <span className="font-mono">{new Date(n.created_at).toLocaleString("ar-EG")}</span>
                    </div>
                    <p className="text-slate-800 leading-relaxed font-medium">{n.note_text}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSaveInternalNote} className="border-t border-slate-100 pt-4 space-y-3">
              <label className="block text-xs font-bold text-slate-700">إضافة ملاحظة داخلية جديدة:</label>
              <textarea
                rows={3}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="اكتب التوجيه الداخلي لفريق العمل..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:border-teal-700 focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingNote || !newNoteText.trim()}
                  className="rounded-xl bg-teal-700 px-5 py-2 text-xs font-bold text-white hover:bg-teal-800 transition disabled:opacity-50"
                >
                  {isSavingNote ? "جاري الحفظ..." : "حفظ الملاحظة"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: BENEFICIARY COMMUNICATION */}
        {activeTab === "COMMUNICATION" && (
          <CommunicationThread
            caseId={caseId}
            referenceNumber={caseData.reference_number}
          />
        )}

        {/* Tab 4: AUDIT TIMELINE */}
        {activeTab === "TIMELINE" && (
          <CaseTimeline
            events={events}
            referenceNumber={caseData.reference_number}
          />
        )}

        {/* Modal: Action Plan Builder */}
        {showPlanBuilder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl text-right my-8">
              <ActionPlanBuilder
                caseId={caseData.id}
                caseReference={caseData.reference_number}
                caseCategory={caseData.category}
                sector={caseData.sector}
                caseDescription={caseData.sanitized_description}
                entityName={caseData.institution_name}
                userRole="OPS_LEAD"
                onSuccess={() => {
                  setShowPlanBuilder(false);
                  loadCaseData();
                }}
                onCancel={() => setShowPlanBuilder(false)}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
