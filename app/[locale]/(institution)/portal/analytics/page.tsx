"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MurafiqLogo } from "@/components/brand/MurafiqLogo";

export default function ExecutiveAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<"EXECUTIVE" | "OPERATIONAL" | "QUALITY" | "AI_INSIGHTS">("EXECUTIVE");
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "90D">("30D");

  // Executive Metrics
  const execMetrics = {
    casesToday: 14,
    openCases: 38,
    overdueCases: 3,
    resolvedCases: 142,
    slaComplianceRate: 94.2,
    avgResponseHours: 4.8,
    avgResolutionHours: 42.5,
    csatScore: 4.6, // out of 5
    totalEvaluations: 128,
  };

  // Operational Metrics
  const departmentBreakdown = [
    { name: "شؤون الطلاب والقيد", total: 46, open: 12, overdue: 1, slaCompliance: 96 },
    { name: "الشؤون التعليمية والأكاديمية", total: 38, open: 14, overdue: 1, slaCompliance: 92 },
    { name: "الحسابات والمصروفات", total: 32, open: 8, overdue: 1, slaCompliance: 89 },
    { name: "التوجيه السلوكي والانضباط", total: 16, open: 3, overdue: 0, slaCompliance: 100 },
    { name: "المرافق والنقل المدرسي", total: 10, open: 1, overdue: 0, slaCompliance: 98 },
  ];

  const priorityDistribution = [
    { label: "حرجة (Critical)", count: 8, color: "bg-rose-500", text: "text-rose-700" },
    { label: "عالية (High)", count: 28, color: "bg-amber-500", text: "text-amber-700" },
    { label: "متوسطة (Medium)", count: 72, color: "bg-teal-500", text: "text-teal-700" },
    { label: "منخفضة (Low)", count: 34, color: "bg-slate-400", text: "text-slate-700" },
  ];

  // Quality Metrics
  const qualityMetrics = {
    firstContactResolution: 68.4,
    reopenedCasesRate: 4.2,
    repeatComplaintsRate: 6.1,
    resolutionAcceptanceRate: 93.8,
  };

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-arabic text-right selection:bg-teal-600 selection:text-white" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Top Navigation */}
        <header className="flex items-center justify-between bg-white px-5 py-3.5 rounded-2xl border border-slate-200 text-xs shadow-xs">
          <div className="flex items-center gap-3 font-bold text-slate-700">
            <Link href="/" className="hover:opacity-90 transition flex items-center gap-2">
              <MurafiqLogo size="sm" showText={false} />
              <span className="text-teal-900 font-black text-sm">مُرافِق Enterprise</span>
            </Link>
            <span className="text-slate-300">|</span>
            <Link href="/portal/dashboard" className="hover:text-teal-800 transition">
              📋 لوحة الحالات
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-teal-800 font-extrabold bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
              📊 التحليلات التنفيذية والـ AI Insights
            </span>
            <span className="text-slate-300">|</span>
            <Link href="/portal/admin" className="hover:text-teal-800 transition">
              ⚙️ مركز الإعدادات
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono font-bold"
            >
              <option value="7D">آخر 7 أيام</option>
              <option value="30D">آخر 30 يوماً</option>
              <option value="90D">آخر ربع سنوي</option>
            </select>
            <button
              onClick={() => window.print()}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              🖨️ طباعة التقرير
            </button>
          </div>
        </header>

        {/* Dashboard Title & Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[11px] font-bold text-teal-700 font-mono uppercase bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                Institutional Quality & Operations
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-1">
                لوحة التحليلات التنفيذية ومؤشرات الجودة والـ AI
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                قياس دقيق لالتزام الأقسام بمؤقتات الـ SLA، سرعة حل المشكلات، ورضا المستفيدين، مع استنتاجات الذكاء الاصطناعي اللحظية.
              </p>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-xs font-bold overflow-x-auto">
            {[
              { key: "EXECUTIVE", label: "📈 النظرة التنفيذية العامة (Executive Overview)" },
              { key: "OPERATIONAL", label: "🏛️ التحليلات التشغيلية للأقسام (Operational)" },
              { key: "QUALITY", label: "⭐ مؤشرات الجودة والرضا (Quality & CSAT)" },
              { key: "AI_INSIGHTS", label: "🤖 استنتاجات الذكاء الاصطناعي (AI Insights)", highlight: true },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 rounded-xl transition shrink-0 ${
                  activeTab === tab.key
                    ? "bg-teal-700 text-white shadow-xs"
                    : tab.highlight
                    ? "bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 1. EXECUTIVE OVERVIEW */}
        {activeTab === "EXECUTIVE" && (
          <div className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="block text-xs font-bold text-slate-400 mb-1">حالات اليوم (Cases Today)</span>
                <span className="text-3xl font-black text-slate-900 font-mono">{execMetrics.casesToday}</span>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="block text-xs font-bold text-slate-400 mb-1">الحالات المفتوحة (Open Cases)</span>
                <span className="text-3xl font-black text-teal-700 font-mono">{execMetrics.openCases}</span>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="block text-xs font-bold text-slate-400 mb-1">المتأخرة عن الـ SLA (Overdue)</span>
                <span className="text-3xl font-black text-rose-600 font-mono">{execMetrics.overdueCases}</span>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="block text-xs font-bold text-slate-400 mb-1">المحسومة والمعتمدة (Resolved)</span>
                <span className="text-3xl font-black text-emerald-600 font-mono">{execMetrics.resolvedCases}</span>
              </div>
            </div>

            {/* SLA & Time Performance */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="block text-xs font-bold text-slate-400 mb-1">نسبة الالتزام بالـ SLA</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-teal-800 font-mono">{execMetrics.slaComplianceRate}%</span>
                  <span className="text-xs font-bold text-emerald-600">✓ Target Met</span>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="block text-xs font-bold text-slate-400 mb-1">متوسط وقت الاستجابة (MTTA)</span>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-3xl font-black text-slate-800">{execMetrics.avgResponseHours}</span>
                  <span className="text-xs text-slate-500">ساعة</span>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="block text-xs font-bold text-slate-400 mb-1">متوسط وقت الحل النهائي (MTTR)</span>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-3xl font-black text-slate-800">{execMetrics.avgResolutionHours}</span>
                  <span className="text-xs text-slate-500">ساعة</span>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="block text-xs font-bold text-slate-400 mb-1">مؤشر رضا المستفيدين (CSAT)</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-amber-500 font-mono">{execMetrics.csatScore} / 5</span>
                  <span className="text-xs text-slate-400 font-mono">({execMetrics.totalEvaluations} تقييم)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. OPERATIONAL ANALYTICS */}
        {activeTab === "OPERATIONAL" && (
          <div className="space-y-6">
            {/* Department Breakdown Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4">كشف أداء الأقسام الإدارية والالتزام الزمني</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-mono uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">القسم الإداري</th>
                      <th className="py-3 px-4">إجمالي الحالات</th>
                      <th className="py-3 px-4">قيد المعالجة</th>
                      <th className="py-3 px-4">حالات متأخرة</th>
                      <th className="py-3 px-4">نسبة الامتثال للـ SLA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {departmentBreakdown.map((dept, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold font-arabic text-slate-800">{dept.name}</td>
                        <td className="py-3 px-4">{dept.total}</td>
                        <td className="py-3 px-4 text-teal-700 font-bold">{dept.open}</td>
                        <td className="py-3 px-4">
                          <span className={dept.overdue > 0 ? "text-rose-600 font-bold" : "text-slate-400"}>
                            {dept.overdue}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-teal-600 h-full rounded-full"
                                style={{ width: `${dept.slaCompliance}%` }}
                              ></div>
                            </div>
                            <span className="font-bold text-slate-700">{dept.slaCompliance}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Priority Distribution */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4">توزيع الحالات حسب مستوى الأولوية (Priority Mix)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {priorityDistribution.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className={`block text-xs font-bold mb-1 ${p.text}`}>{p.label}</span>
                    <span className="text-2xl font-black text-slate-900 font-mono">{p.count} حالة</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. QUALITY & CSAT */}
        {activeTab === "QUALITY" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">الحل من أول تواصل (First-Contact Resolution)</h3>
              <div className="text-3xl font-black text-teal-800 font-mono">{qualityMetrics.firstContactResolution}%</div>
              <p className="text-xs text-slate-500">نسبة الحالات التي تم حسمها نهائياً دون الحاجة لمراسلات متكررة أو تصعيد.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">قبول الحل ورضا الإغلاق (Resolution Acceptance)</h3>
              <div className="text-3xl font-black text-emerald-600 font-mono">{qualityMetrics.resolutionAcceptanceRate}%</div>
              <p className="text-xs text-slate-500">نسبة المستفيدين الذين وافقوا على خطة العمل والنتيجة النهائية للحالة.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">معدل إعادة فتح الحالات (Reopened Cases)</h3>
              <div className="text-3xl font-black text-amber-600 font-mono">{qualityMetrics.reopenedCasesRate}%</div>
              <p className="text-xs text-slate-500">الحالات التي استأنف المستفيد الاستفسار بشأنها بعد الحسم الأولي.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">الشكاوى المتكررة (Repeat Complaints)</h3>
              <div className="text-3xl font-black text-slate-700 font-mono">{qualityMetrics.repeatComplaintsRate}%</div>
              <p className="text-xs text-slate-500">نسبة تكرار نفس الشكوى لنفس المستفيد خلال فترة 30 يوماً.</p>
            </div>
          </div>
        )}

        {/* 4. AI OPERATIONAL INSIGHTS */}
        {activeTab === "AI_INSIGHTS" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50 to-white border border-teal-200 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">💡</span>
                <h3 className="text-sm font-black text-teal-950">استنتاج تشغيلي #1: تزايد استفسارات المصروفات والفوترة</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-teal-200 text-teal-900">
                  +23% Volume Trend
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                لوحظ ارتفاع بنسبة 23% في الحالات المرتبطة بـ &quot;الحسابات والمصروفات وتأجيل الأقساط&quot; خلال آخر 30 يوماً متزامناً مع مواعيد استحقاق القسط الثاني.
                <br />
                <strong className="text-teal-900 font-bold block mt-1.5">
                  التوصية الوقائية: إرسال جدول الاستحقاقات والخيارات المتاحة للتقسيط عبر WhatsApp قبل 10 أيام لتفادي 45% من الضغط على القسم.
                </strong>
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-white border border-amber-200 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">⚠️</span>
                <h3 className="text-sm font-black text-amber-950">استنتاج تشغيلي #2: ضغط الـ SLA في الشؤون الأكاديمية</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-200 text-amber-900">
                  SLA At Risk
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                يسجل قسم الشؤون الأكاديمية أعلى معدل لاقتراب كسر مهلة الـ SLA (72 ساعة) بمتوسط استجابة 68 ساعة بسبب دورة التوقيعات اليدوية.
                <br />
                <strong className="text-amber-900 font-bold block mt-1.5">
                  التوصية الوقائية: تفعيل دور &quot;رئيس الكنترول&quot; للاعتماد الإلكتروني الفوري المباشر عبر البوابة لتخفيض وقت الحل إلى 24 ساعة.
                </strong>
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-white border border-sky-200 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🎯</span>
                <h3 className="text-sm font-black text-sky-950">استنتاج تشغيلي #3: تشابه الأسباب الجذرية (12 حالة متطابقة)</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-sky-200 text-sky-900">
                  Root Cause Match
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                رصدت خوارزميات الـ AI تطابقاً كاملاً في السبب الجذري لـ 12 شكوى نقل مدرسي خاصة بخط حافلات التجمع الأول، نتيجة تغيير مسار مروري مؤقت لم يتم إشعار أولياء الأمور به.
                <br />
                <strong className="text-sky-900 font-bold block mt-1.5">
                  التوصية الوقائية: تفعيل الربط مع خدمة الـ SMS لتنبيه أولياء أمور الخط آلياً بأي تغيير لحظي.
                </strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
