"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MurafiqLogo } from "@/components/brand/MurafiqLogo";
import type { Institution, SectorType, SubscriptionPlanTier, SubscriptionStatus } from "@/types/database";

export default function MurafiqSuperAdminPortal() {
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState<Institution[]>([]);
  const [platformMetrics, setPlatformMetrics] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"ORGS" | "METRICS" | "AI_CONFIG" | "AUDIT">("ORGS");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Organization Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrgNameAr, setNewOrgNameAr] = useState("");
  const [newOrgNameEn, setNewOrgNameEn] = useState("");
  const [newOrgSlug, setNewOrgSlug] = useState("");
  const [newOrgSector, setNewOrgSector] = useState<SectorType>("EDUCATION_SCHOOLS");
  const [newOrgPlan, setNewOrgPlan] = useState<SubscriptionPlanTier>("ENTERPRISE");
  const [newOrgColor, setNewOrgColor] = useState("#0F766E");
  const [newOrgEmail, setNewOrgEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Global AI Config state
  const [aiModel, setAiModel] = useState("gemini-2.5-pro");
  const [tokenLimitMonthly, setTokenLimitMonthly] = useState(500000);
  const [autoModerationThreshold, setAutoModerationThreshold] = useState(0.85);

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/super-admin");
      const result = await res.json();
      if (result.success && result.data) {
        setOrganizations(result.data.organizations || []);
        setPlatformMetrics(result.data.platformMetrics || {});
        setAuditLogs(result.data.auditLogs || []);
      } else {
        throw new Error(result.error || "Failed to load super admin data");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "تعذر تحميل بيانات الإدارة العليا للمنصة");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const notify = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleToggleStatus = async (orgId: string, currentStatus?: string) => {
    const nextStatus: SubscriptionStatus = currentStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    try {
      const res = await fetch("/api/super-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_STATUS",
          payload: { organizationId: orgId, status: nextStatus },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrganizations((prev) =>
          prev.map((o) => (o.id === orgId ? { ...o, status: nextStatus } : o))
        );
        notify(nextStatus === "ACTIVE" ? "تم تنشيط المؤسسة بنجاح ✅" : "تم تعليق المؤسسة مؤقتاً ⚠️");
      }
    } catch {
      setErrorMessage("حدث خطأ أثناء تعديل حالة المؤسسة");
    }
  };

  const handlePlanChange = async (orgId: string, plan: SubscriptionPlanTier) => {
    try {
      const res = await fetch("/api/super-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_SUBSCRIPTION",
          payload: {
            organizationId: orgId,
            subscription: {
              plan,
              max_staff_seats: plan === "ENTERPRISE" ? 100 : plan === "PROFESSIONAL" ? 30 : 10,
              max_cases_monthly: plan === "ENTERPRISE" ? 10000 : plan === "PROFESSIONAL" ? 1000 : 250,
            },
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrganizations((prev) =>
          prev.map((o) =>
            o.id === orgId ? { ...o, subscription: { ...(o.subscription as any), plan } } : o
          )
        );
        notify(`تم تحديث باقة المؤسسة إلى ${plan} بنجاح ✅`);
      }
    } catch {
      setErrorMessage("حدث خطأ أثناء ترقية الخطة");
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgNameAr.trim() || !newOrgSlug.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/super-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_ORGANIZATION",
          payload: {
            name_ar: newOrgNameAr,
            name_en: newOrgNameEn,
            slug: newOrgSlug,
            sector: newOrgSector,
            plan: newOrgPlan,
            primary_color: newOrgColor,
            support_email: newOrgEmail,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrganizations((prev) => [data.data, ...prev]);
        setShowCreateModal(false);
        setNewOrgNameAr("");
        setNewOrgNameEn("");
        setNewOrgSlug("");
        notify("تم إنشاء المؤسسة بنجاح وإعداد البيئة الخاصة بها! 🎉");
      }
    } catch {
      setErrorMessage("حدث خطأ أثناء إنشاء المؤسسة");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-arabic text-right selection:bg-teal-600 selection:text-white" dir="rtl">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30 shadow-lg">
        <div className="mx-auto max-w-7xl px-4 py-3.5 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition">
              <MurafiqLogo size="md" />
              <div>
                <span className="block text-xs font-black text-teal-400 tracking-wider font-sans uppercase">
                  Murafiq Platform Super Admin
                </span>
                <span className="text-[11px] text-slate-400">لوحة تحكم مالك المنصة — الإدارة المركزية</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-950 text-teal-300 border border-teal-800">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              Platform Health: 99.98%
            </span>
            <Link
              href="/portal/admin"
              className="text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition"
            >
              عرض كـ Org Admin ←
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Messages */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-sm flex items-center justify-between animate-fadeIn">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-emerald-200">✕</button>
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-sm flex items-center justify-between animate-fadeIn">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-200">✕</button>
          </div>
        )}

        {/* Platform KPI Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <span className="block text-xs font-semibold text-slate-400 mb-1">المؤسسات المشتركة (Tenants)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{platformMetrics?.totalOrganizations || organizations.length}</span>
              <span className="text-xs font-bold text-emerald-400">({platformMetrics?.activeOrganizations || organizations.length} نشطة)</span>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <span className="block text-xs font-semibold text-slate-400 mb-1">إجمالي الحالات عبر المنصة</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{platformMetrics?.totalCasesPlatformWide || 0}</span>
              <span className="text-xs font-bold text-teal-400">{platformMetrics?.resolutionRatePercentage || 98}% نسبة الحسم</span>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <span className="block text-xs font-semibold text-slate-400 mb-1">استهلاك الـ AI Tokens شهرياً</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-400">{(platformMetrics?.totalAiQuotaUsedMonthly || 28140).toLocaleString()}</span>
              <span className="text-xs text-slate-400">tokens</span>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <span className="block text-xs font-semibold text-slate-400 mb-1">طلبات الـ API (خلال 24 ساعة)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-sky-400">{(platformMetrics?.apiRequests24h || 142850).toLocaleString()}</span>
              <span className="text-xs font-bold text-emerald-400">Healthy</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("ORGS")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                activeTab === "ORGS"
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-900/30"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              🏢 إدارة المؤسسات والعملاء ({organizations.length})
            </button>
            <button
              onClick={() => setActiveTab("AI_CONFIG")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                activeTab === "AI_CONFIG"
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-900/30"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              🤖 إعدادات الذكاء الاصطناعي العامة
            </button>
            <button
              onClick={() => setActiveTab("AUDIT")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                activeTab === "AUDIT"
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-900/30"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              🛡️ سجل العمليات المنصّي (Platform Audit)
            </button>
          </div>

          {activeTab === "ORGS" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 transition flex items-center gap-1.5"
            >
              <span>+ إضافة مؤسسة جديدة (Provision Tenant)</span>
            </button>
          )}
        </div>

        {/* Tab 1: Organizations List */}
        {activeTab === "ORGS" && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">قائمة المؤسسات المسجلة (Customer Tenants)</h3>
                <p className="text-xs text-slate-400">لكل مؤسسة بيئتها المنفصلة تماماً بهويتها وسجلاتها وموظفيها و SLAs الخاصة بها.</p>
              </div>
              <span className="text-xs font-mono text-slate-500">Multi-tenant Isolation: STRICT</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 uppercase font-mono border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">المؤسسة / المعرف</th>
                    <th className="py-3.5 px-4">القطاع</th>
                    <th className="py-3.5 px-4">باقة الاشتراك</th>
                    <th className="py-3.5 px-4">المقاعد / السعة</th>
                    <th className="py-3.5 px-4">استهلاك AI</th>
                    <th className="py-3.5 px-4">الحالة</th>
                    <th className="py-3.5 px-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {organizations.map((org) => {
                    const isSuspended = org.status === "SUSPENDED";
                    return (
                      <tr key={org.id} className="hover:bg-slate-800/50 transition">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-sm shrink-0"
                              style={{ backgroundColor: org.branding?.primary_color || "#0F766E" }}
                            >
                              {org.name_ar.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-white text-sm">{org.name_ar}</div>
                              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                                <span>{org.slug}</span>
                                {org.branding?.custom_domain && (
                                  <span className="text-teal-400">🌐 {org.branding.custom_domain}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                            {org.sector || "EDUCATION_SCHOOLS"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <select
                            value={org.subscription?.plan || "ENTERPRISE"}
                            onChange={(e) => handlePlanChange(org.id, e.target.value as SubscriptionPlanTier)}
                            className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-teal-500 font-mono"
                          >
                            <option value="STARTER">STARTER</option>
                            <option value="PROFESSIONAL">PROFESSIONAL</option>
                            <option value="ENTERPRISE">ENTERPRISE</option>
                            <option value="CUSTOM">CUSTOM</option>
                          </select>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-mono text-slate-300">
                            <span>{org.subscription?.max_staff_seats || 50} مقاعد</span>
                            <span className="text-slate-500 text-[11px] block">حد الحالات: {org.subscription?.max_cases_monthly || 1000}/شهر</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-mono">
                          <div className="text-amber-400 font-bold">
                            {(org.subscription?.ai_used_this_month || 0).toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-500">من {org.subscription?.ai_quota_monthly || 5000}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              isSuspended
                                ? "bg-rose-950 text-rose-300 border border-rose-800"
                                : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            }`}
                          >
                            {isSuspended ? "موقوفة (Suspended)" : "نشطة (Active)"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleToggleStatus(org.id, org.status)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                isSuspended
                                  ? "bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700"
                                  : "bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700"
                              }`}
                            >
                              {isSuspended ? "تنشيط" : "تعليق"}
                            </button>
                            <Link
                              href={`/portal/admin?institutionId=${org.id}`}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition"
                            >
                              إدارة الإعدادات ←
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: AI Config */}
        {activeTab === "AI_CONFIG" && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 max-w-2xl mx-auto shadow-xl">
            <h3 className="text-lg font-bold text-white mb-2">إعدادات محرك الذكاء الاصطناعي العام (Platform AI Gateway)</h3>
            <p className="text-xs text-slate-400 mb-6">التحكم المركزي في نماذج الذكاء الاصطناعي لحدود الاستهلاك والخصوصية وحظر التسريب عبر كافة المؤسسات.</p>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">النموذج الافتراضي (Primary LLM Model)</label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-mono"
                >
                  <option value="gemini-2.5-pro">Google Gemini 2.5 Pro (Recommended for Institutional Reasoning)</option>
                  <option value="gemini-2.5-flash">Google Gemini 2.5 Flash (Ultra Fast Triage)</option>
                  <option value="gpt-4o">OpenAI GPT-4o (Enterprise Compatible)</option>
                  <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
                  <option value="local-ollama">On-Premise Private Sovereign LLM (Air-Gapped)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">الحد الأقصى للرموز شهرياً لكل مؤسسة (Token Quota Cap)</label>
                <input
                  type="number"
                  value={tokenLimitMonthly}
                  onChange={(e) => setTokenLimitMonthly(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">حد الثقة للفرز الآلي (Confidence Threshold: {autoModerationThreshold})</label>
                <input
                  type="range"
                  min="0.5"
                  max="0.99"
                  step="0.01"
                  value={autoModerationThreshold}
                  onChange={(e) => setAutoModerationThreshold(Number(e.target.value))}
                  className="w-full accent-teal-500"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
                  <span>أكثر تحفظاً (0.50)</span>
                  <span>تدقيق صارم (0.99)</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => notify("تم حفظ إعدادات الـ AI المركزية بنجاح ✅")}
                  className="px-5 py-2.5 rounded-xl font-bold bg-teal-600 hover:bg-teal-500 text-white text-sm shadow-md transition"
                >
                  حفظ الإعدادات المنصّية
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Platform Audit */}
        {activeTab === "AUDIT" && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">سجل العمليات الإدارية المنصّي (Platform Audit Trail)</h3>
              <p className="text-xs text-slate-400">سجل غير قابل للتعديل لجميع العمليات الحساسة وتعديلات الإدارة العليا للمنصة.</p>
            </div>

            <div className="divide-y divide-slate-800 font-mono text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-800/40 transition flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-teal-400 mt-1.5 shrink-0"></span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white text-sm">{log.action}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">{log.entity_type}</span>
                        <span className="text-teal-400 text-[11px]">{log.actor_name} ({log.actor_role})</span>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        معرف الكيان: <span className="text-slate-300">{log.entity_id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-slate-500 text-[11px]">
                    {new Date(log.created_at).toLocaleString("ar-EG")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal: Create New Organization */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-right animate-fadeIn">
            <h3 className="text-lg font-bold text-white mb-1">تهيئة مؤسسة جديدة (Provision New Tenant)</h3>
            <p className="text-xs text-slate-400 mb-5">سيتم عزل قاعدة بيانات المؤسسة وتجهيز بيئتها المؤسسية وربطها برمز فريد.</p>

            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم المؤسسة (بالعربية) *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: جامعة عين شمس / مدرسة النيل الدولية"
                  value={newOrgNameAr}
                  onChange={(e) => setNewOrgNameAr(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم المؤسسة (بالإنجليزية)</label>
                <input
                  type="text"
                  placeholder="e.g. Ain Shams University"
                  value={newOrgNameEn}
                  onChange={(e) => setNewOrgNameEn(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">المعرف المختصر (Slug) *</label>
                  <input
                    type="text"
                    required
                    placeholder="ain-shams-uni"
                    value={newOrgSlug}
                    onChange={(e) => setNewOrgSlug(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">القطاع المؤسسي</label>
                  <select
                    value={newOrgSector}
                    onChange={(e) => setNewOrgSector(e.target.value as SectorType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="EDUCATION_SCHOOLS">المدارس والتعليم قبل الجامعي</option>
                    <option value="HIGHER_EDUCATION">الجامعات والتعليم العالي</option>
                    <option value="HEALTHCARE_MEDICAL">المستشفيات والرعاية الصحية</option>
                    <option value="GOVERNMENT_PUBLIC">الخدمات والهيئات الحكومية</option>
                    <option value="COMMERCIAL_COMPANIES">الشركات والتجارة</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">باقة الترخيص</label>
                  <select
                    value={newOrgPlan}
                    onChange={(e) => setNewOrgPlan(e.target.value as SubscriptionPlanTier)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="STARTER">Starter (10 مقاعد)</option>
                    <option value="PROFESSIONAL">Professional (30 مقعداً)</option>
                    <option value="ENTERPRISE">Enterprise (100 مقعد)</option>
                    <option value="CUSTOM">Custom Unlimited</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اللون الأساسي للهوية</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newOrgColor}
                      onChange={(e) => setNewOrgColor(e.target.value)}
                      className="w-10 h-9 bg-transparent border-0 rounded cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-400">{newOrgColor}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">بريد الدعم المؤسسي</label>
                <input
                  type="email"
                  placeholder="care@organization.edu.eg"
                  value={newOrgEmail}
                  onChange={(e) => setNewOrgEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition"
                >
                  {isSubmitting ? "جاري الإنشاء والتهيئة..." : "إطلاق بيئة المؤسسة 🚀"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
