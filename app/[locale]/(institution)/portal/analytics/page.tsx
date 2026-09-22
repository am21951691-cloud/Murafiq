"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MurafiqLogo } from "@/components/brand/MurafiqLogo";
import { SAMPLE_ENTITIES, SampleEntityRecord } from "@/lib/services/entities";
import { ExecutiveMetrics } from "@/lib/services/analytics";
import { SectorType } from "@/types/database";

export default function ExecutiveAnalyticsDashboard() {
  const [selectedEntityId, setSelectedEntityId] = useState<string>("ALL");
  const [metrics, setMetrics] = useState<ExecutiveMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const activeEntity: SampleEntityRecord | undefined = SAMPLE_ENTITIES.find(
    (e) => e.id === selectedEntityId
  );

  useEffect(() => {
    async function loadMetrics() {
      setLoading(true);
      try {
        const queryParam = selectedEntityId === "ALL" ? "" : `?institution_id=${selectedEntityId}`;
        const res = await fetch(`/api/institution/analytics${queryParam}`);
        const data = await res.json();
        if (data.metrics) {
          setMetrics(data.metrics);
        }
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, [selectedEntityId]);

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-arabic text-right" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Navigation Bar */}
        <header className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-200 text-xs shadow-xs">
          <div className="flex items-center gap-3 font-bold text-slate-700">
            <Link href="/" className="hover:opacity-90 transition flex items-center gap-1.5">
              <MurafiqLogo size="sm" showText={false} />
              <span className="text-sky-950 font-black text-sm">مُرافِق إنتربرايز</span>
            </Link>
            <span className="text-slate-300">|</span>
            <Link href="/portal/dashboard" className="hover:text-sky-800 transition">
              📋 لوحة فرز ومعالجة الحالات
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-sky-800 font-extrabold bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
              📊 مؤشرات الأداء والجودة المؤسسية (Executive Analytics)
            </span>
            <span className="text-slate-300">|</span>
            <Link href="/portal/admin" className="hover:text-teal-800 transition">
              ⚙️ إدارة المؤسسة (Org Admin)
            </Link>
          </div>
          <Link
            href="/cases/new"
            className="rounded-xl bg-sky-800 px-4 py-2 font-bold text-white hover:bg-sky-900 transition shadow-xs"
          >
            + تسجيل حالة جديدة
          </Link>
        </header>

        {/* Header & Entity Selector */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700 mb-2">
              <span>🏛️ لوحة القيادة العليا ومراقبة الامتثال واتفاقيات مستوى الخدمة (SLA)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              مؤشرات الأداء المؤسسي والحوكمة والامتثال
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              تحليل دقيق لمسارات معالجة الشكاوى وسرعة استجابة الأقسام ورضا المستفيدين
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedEntityId}
              onChange={(e) => setSelectedEntityId(e.target.value)}
              className="rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-sky-800 focus:outline-none"
            >
              <option value="ALL">🌐 المنظومة الوطنية الشاملة (جميع الفروع والجهات)</option>
              {SAMPLE_ENTITIES.map((ent) => (
                <option key={ent.id} value={ent.id}>
                  {ent.name} ({ent.governorate})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              🖨️ طباعة تقرير الجودة
            </button>
          </div>
        </div>

        {/* 4 Core Executive Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. SLA Compliance */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">نسبة الالتزام بالـ SLA</span>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                معدل الجودة
              </span>
            </div>
            <div className="my-3">
              <span className="text-3xl font-black text-slate-900 font-mono">
                {loading ? "..." : `${metrics?.slaCompliancePercent}%`}
              </span>
              <span className="text-xs text-emerald-600 font-bold mr-2">↑ معايير معتمدة</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              الحالات المنجزة ضمن المهلة المحددة دون تجاوز مؤقتات الاستجابة
            </p>
          </div>

          {/* 2. Total & Open Cases */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">إجمالي الحالات الواردة</span>
              <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-800">
                الحجم الكلي
              </span>
            </div>
            <div className="my-3 flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900 font-mono">
                {loading ? "..." : metrics?.totalCases}
              </span>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                {loading ? "..." : `${metrics?.openCases} جارية`}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              {metrics?.resolvedCases} حالة مغلقة بنجاح وموثقة بتقرير إنجاز رسمي
            </p>
          </div>

          {/* 3. Median Resolution Speed */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">متوسط سرعة الإنجاز النهائي</span>
              <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                الكفاءة
              </span>
            </div>
            <div className="my-3">
              <span className="text-3xl font-black text-slate-900 font-mono">
                {loading ? "..." : `${metrics?.medianResolutionDays} أيام`}
              </span>
              <span className="text-xs text-slate-500 mr-2">من الورود للإغلاق</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              زمن الاستجابة الأولية: {loading ? "..." : `${metrics?.medianResponseHours} ساعة`}
            </p>
          </div>

          {/* 4. Beneficiary Satisfaction */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">مؤشر رضا المستفيدين (R_res)</span>
              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                تقييم الحل
              </span>
            </div>
            <div className="my-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 font-mono">
                {loading ? "..." : `${metrics?.avgResolutionRating} / 5`}
              </span>
              <span className="text-amber-500 text-lg">★</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              تقييم جودة التواصل المؤسسي: {loading ? "..." : `${metrics?.avgResponsivenessRating} / 5`}
            </p>
          </div>
        </div>

        {/* Department Scorecard Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                بطاقة أداء الإدارات والأقسام (Department SLA Scorecard)
              </h2>
              <p className="text-xs text-slate-500">
                متابعة دقيقة لمعدل إنجاز كل قسم ومؤشر الالتزام بالمواعيد المحددة
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
              {metrics?.departmentMetrics?.length || 0} أقسام مفعلة
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">اسم القسم / الإدارة</th>
                  <th className="py-3 px-4">كود القسم</th>
                  <th className="py-3 px-4">إجمالي الحالات</th>
                  <th className="py-3 px-4">الحالات المنجزة</th>
                  <th className="py-3 px-4">الحالات الجارية</th>
                  <th className="py-3 px-4">الالتزام بالـ SLA</th>
                  <th className="py-3 px-4">مهلة الحل القياسية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {metrics?.departmentMetrics && metrics.departmentMetrics.length > 0 ? (
                  metrics.departmentMetrics.map((dept) => (
                    <tr key={dept.code} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        {dept.name_ar}
                        <span className="block text-[10px] text-slate-400 font-normal font-sans">
                          {dept.name_en}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-600">
                        {dept.code}
                      </td>
                      <td className="py-3.5 px-4 font-bold font-mono text-slate-800">
                        {dept.totalCases}
                      </td>
                      <td className="py-3.5 px-4 font-bold font-mono text-emerald-700">
                        {dept.resolvedCases}
                      </td>
                      <td className="py-3.5 px-4 font-bold font-mono text-amber-700">
                        {dept.openCases}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className="h-full bg-emerald-600 rounded-full"
                              style={{ width: `${dept.slaCompliancePercent}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-slate-700">
                            {dept.slaCompliancePercent}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {dept.avgResolutionDays} أيام عمل
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      لا توجد بيانات أقسام مسجلة حتى الآن
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Priority & Category Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Priority Radar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-base font-black text-slate-900 mb-1">
              توزيع الحالات حسب درجة الأهمية والخطورة
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              تصنيف درجات الاستعجال لضمان توجيه الموارد للحالات الطارئة
            </p>
            <div className="space-y-3">
              {[
                { key: "CRITICAL", label: "طارئة (Critical)", count: metrics?.priorityDistribution.CRITICAL || 0, color: "bg-red-600", text: "text-red-700", bg: "bg-red-50" },
                { key: "HIGH", label: "عاجلة (High)", count: metrics?.priorityDistribution.HIGH || 0, color: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
                { key: "MEDIUM", label: "متوسطة (Medium)", count: metrics?.priorityDistribution.MEDIUM || 0, color: "bg-sky-600", text: "text-sky-800", bg: "bg-sky-50" },
                { key: "LOW", label: "عادية (Low)", count: metrics?.priorityDistribution.LOW || 0, color: "bg-slate-400", text: "text-slate-600", bg: "bg-slate-50" },
              ].map((p) => {
                const total = metrics?.totalCases || 1;
                const pct = Math.round((p.count / total) * 100);
                return (
                  <div key={p.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className={p.text}>{p.label}</span>
                      <span className="font-mono text-slate-800">{p.count} حالة ({pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full ${p.color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recurring Category Breakdown */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-base font-black text-slate-900 mb-1">
              خريطة القضايا المتكررة (Recurring Issues Map)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              تحليل الأسباب الجذرية للمشكلات لدعم التطوير الإداري المستمر
            </p>
            <div className="space-y-3">
              {metrics?.categoryDistribution && metrics.categoryDistribution.length > 0 ? (
                metrics.categoryDistribution.slice(0, 5).map((cat) => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>{cat.category}</span>
                      <span className="font-mono text-slate-800">{cat.count} حالة ({cat.percent}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-sky-700 rounded-full" style={{ width: `${cat.percent}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">لا توجد حالات مسجلة حالياً</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
