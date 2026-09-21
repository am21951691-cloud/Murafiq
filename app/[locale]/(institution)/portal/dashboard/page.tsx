"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CaseTriageCard, type CaseTriageItem } from "@/components/institution/CaseTriageCard";
import { Case } from "@/types/database";

export default function InstitutionTriageDashboard() {
  const [role, setRole] = useState<string>("OPS_LEAD");
  const [cases, setCases] = useState<CaseTriageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  useEffect(() => {
    async function loadCases() {
      setLoading(true);
      try {
        const res = await fetch("/api/institution/cases");
        const data = await res.json();
        if (data.cases) {
          setCases(data.cases);
        }
      } catch (err) {
        console.error("Failed to fetch cases:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCases();
  }, []);

  const handleCaseAcknowledged = (caseId: string) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId ? { ...c, lifecycle_status: "ACTION_PLAN_PENDING" } : c
      )
    );
  };

  const activeGraceCount = cases.filter(
    (c) => c.lifecycle_status === "PRIVATE_GRACE"
  ).length;

  const isUrgent = (c: Case) => {
    if (!c.grace_expires_at) return false;
    const daysLeft = Math.ceil(
      (new Date(c.grace_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysLeft <= 2;
  };

  const urgentCount = cases.filter(
    (c) => c.lifecycle_status === "PRIVATE_GRACE" && isUrgent(c)
  ).length;

  const filteredCases = cases.filter((c) => {
    if (filterCategory === "ALL") return true;
    return c.category === filterCategory;
  });

  return (
    <main className="min-h-screen bg-civic-canvas py-8 px-4 sm:px-6 lg:px-8 font-arabic text-right">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Global Navigation Bar */}
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200 text-xs shadow-2xs">
          <div className="flex items-center gap-3 font-bold text-slate-700">
            <Link href="/" className="hover:text-sky-800 transition flex items-center gap-1">
              🏠 <span>الرئيسية</span>
            </Link>
            <span className="text-slate-300">|</span>
            <Link href="/directory" className="hover:text-sky-800 transition">
              🌐 الدليل الوطني للجهات
            </Link>
            <span className="text-slate-300">|</span>
            <Link href="/schools" className="hover:text-sky-800 transition">
              🏫 المدارس
            </Link>
          </div>
          <Link
            href="/cases/new"
            className="rounded-lg bg-sky-700 px-3 py-1.5 font-bold text-white hover:bg-sky-800 transition"
          >
            + تقديم حالة جديدة
          </Link>
        </div>

        {/* Top Institution Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                مؤسسة معتمدة رسميًا
              </span>
              <span className="text-xs text-slate-400">ترخيص رقم: MOE-2024-8841</span>
            </div>
            <h1 className="text-2xl font-bold text-civic-navy">
              بوابة الإدارة المدرسية — لوحة فرز ومعالجة القضايا
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              مدرسة القاهرة التجريبية الرسمية للغات — إدارة شرق مدينة نصر التعليمية
            </p>
          </div>

          {/* Interactive RBAC Role Selector (for testing and role switching) */}
          <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
            <span className="font-semibold text-slate-600">الدور الحالي:</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 font-bold text-civic-navy focus:outline-none"
            >
              <option value="ADMIN">مدير المؤسسة (ADMIN)</option>
              <option value="OPS_LEAD">مسؤول العمليات (OPS_LEAD)</option>
              <option value="STAFF">عضو هيئة تدريس / موظف (STAFF)</option>
              <option value="OBSERVER">مراقب خارجي (OBSERVER)</option>
            </select>
          </div>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-teal-100 bg-white p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">
              قضايا في مهلة المراجعة الخاصة
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-bold text-civic-navy font-mono">
                {activeGraceCount}
              </span>
              <span className="text-xs font-semibold text-civic-teal bg-teal-50 px-2 py-0.5 rounded">
                7 أيام مهلة نظامية
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">
              قضايا عاجلة (يتبقى أقل من 48 ساعة)
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-bold text-amber-700 font-mono">
                {urgentCount}
              </span>
              <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                تتطلب تأكيد فوري
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">
              مستوى عزل الخصوصية (PII Isolation)
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-sm font-bold text-emerald-700">
                🔒 مشفر ومفصول بنسبة 100%
              </span>
              <span className="text-xs text-slate-400">قانون 151/2020</span>
            </div>
          </div>
        </div>

        {/* Role Warning for Observer */}
        {role === "OBSERVER" && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900">
            <strong>تنبيه الصلاحيات:</strong> بصفتك (OBSERVER)، لا يمكنك الاطلاع على القضايا الخاصة التي لا تزال في فترة المهلة (PRIVATE_GRACE) ولا تملك صلاحية اعتماد خطط العمل وفق مصفوفة الأمان.
          </div>
        )}

        {/* Role Warning for Staff */}
        {role === "STAFF" && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-900">
            <strong>تنبيه الصلاحيات:</strong> بصفتك (STAFF)، يمكنك الاطلاع على القضايا الموجهة لقسمك فقط، ولا تملك صلاحية تأكيد الاستلام أو اعتماد خطط العمل (محصورة لـ ADMIN و OPS_LEAD).
          </div>
        )}

        {/* Triage Cases List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">
              قضايا أولياء الأمور الواردة حديثًا ({filteredCases.length})
            </h2>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-civic-navy focus:outline-none"
            >
              <option value="ALL">جميع التصنيفات</option>
              <option value="TEACHER_COMMUNICATION">تواصل المعلمين</option>
              <option value="TRANSPORTATION_BUSES">الحافلات والنقل</option>
              <option value="ACADEMIC_CURRICULUM">المناهج والتدريس</option>
              <option value="TUITION_FEES_REFUNDS">المصروفات</option>
            </select>
          </div>

          {loading ? (
            <div className="rounded-2xl bg-white p-12 text-center text-sm text-slate-400 border border-slate-200">
              جاري تحميل القضايا الواردة...
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center text-sm text-slate-500 border border-slate-200">
              لا توجد قضايا معلقة تتطلب الفرز حالياً.
            </div>
          ) : (
            filteredCases.map((caseItem) => (
              <CaseTriageCard
                key={caseItem.id}
                caseData={caseItem}
                userRole={role}
                onAcknowledged={handleCaseAcknowledged}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
